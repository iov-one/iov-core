import {
  Address,
  Algorithm,
  ChainId,
  Fee,
  Identity,
  isSwapTransaction,
  Nonce,
  PostableBytes,
  PrehashType,
  PubkeyBundle,
  PubkeyBytes,
  SendTransaction,
  SignableBytes,
  SignatureBytes,
  SignedTransaction,
  SigningJob,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapOfferTransaction,
  TransactionId,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp";
import { ExtendedSecp256k1Signature, Keccak256, Secp256k1 } from "@iov/crypto";
import { Encoding, fromHex, toHex } from "@iov/encoding";

import { isValidAddress, pubkeyToAddress, toChecksummedAddress } from "./address";
import { AtomicSwapContractTransactionBuilder } from "./atomicswapcontracttransactionbuilder";
import { constants } from "./constants";
import { BlknumForkState, Eip155ChainId, getRecoveryParam } from "./encoding";
import { Erc20ApproveTransaction, Erc20TokensMap } from "./erc20";
import { Erc20TokenTransactionBuilder } from "./erc20tokentransactionbuilder";
import { EthereumRpcTransactionResult } from "./ethereumrpctransactionresult";
import { Serialization } from "./serialization";
import { SwapIdPrefix } from "./serializationcommon";
import { SmartContractConfig } from "./smartcontracts/definitions";
import {
  CustomSmartContractTransaction,
  CustomSmartContractTransactionBuilder,
} from "./smartcontracts/transactionbuilder";
import {
  decodeHexQuantity,
  decodeHexQuantityNonce,
  decodeHexQuantityString,
  encodeQuantity,
  fromBcpChainId,
  normalizeHex,
} from "./utils";

export interface EthereumCodecOptions {
  /**
   * Address of the deployed atomic swap contract for ETH.
   */
  readonly atomicSwapEtherContractAddress?: Address;
  /**
   * Address of the deployed atomic swap contract for ERC20 tokens.
   */
  readonly atomicSwapErc20ContractAddress?: Address;
  /**
   * Custom smart contracts configuration
   */
  readonly customSmartContractConfig?: SmartContractConfig;
  /**
   * ERC20 tokens supported by the codec instance.
   *
   * The behaviour of encoding/decoding transactions for other tokens is undefined.
   */
  readonly erc20Tokens?: Erc20TokensMap;
}

type SupportedTransactionType =
  | SendTransaction
  | Erc20ApproveTransaction
  | SwapOfferTransaction
  | SwapClaimTransaction
  | SwapAbortTransaction
  | CustomSmartContractTransaction;

export class EthereumCodec implements TxCodec {
  private static getMemoFromInput(input: Uint8Array): string {
    try {
      return Encoding.fromUtf8(input);
    } catch {
      const hexstring = toHex(input);
      // split in space separated chunks up to 16 characters each
      return (hexstring.match(/.{1,16}/g) || []).join(" ");
    }
  }

  private readonly atomicSwapEtherContractAddress?: Address;
  private readonly atomicSwapErc20ContractAddress?: Address;
  private readonly customSmartContractConfig?: SmartContractConfig;
  private readonly erc20Tokens: Erc20TokensMap;

  public constructor(options: EthereumCodecOptions) {
    this.atomicSwapEtherContractAddress = options.atomicSwapEtherContractAddress;
    this.atomicSwapErc20ContractAddress = options.atomicSwapErc20ContractAddress;
    this.customSmartContractConfig = options.customSmartContractConfig;
    this.erc20Tokens = options.erc20Tokens || new Map();
  }

  public bytesToSign(unsigned: UnsignedTransaction, nonce: Nonce): SigningJob {
    return {
      bytes: Serialization.serializeUnsignedTransaction(
        unsigned,
        nonce,
        this.erc20Tokens,
        this.getAtomicSwapContractAddress(unsigned),
        this.getCustomSmartContractAddress(),
      ) as SignableBytes,
      prehashType: PrehashType.Keccak256,
    };
  }

  public bytesToPost(signed: SignedTransaction): PostableBytes {
    return Serialization.serializeSignedTransaction(
      signed,
      this.erc20Tokens,
      this.getAtomicSwapContractAddress(signed.transaction),
      this.getCustomSmartContractAddress(),
    ) as PostableBytes;
  }

  public identifier(signed: SignedTransaction): TransactionId {
    throw new Error(`Not implemented tx: ${signed}`);
  }

  public parseBytes(bytes: PostableBytes, chainId: ChainId): SignedTransaction {
    const json: EthereumRpcTransactionResult = JSON.parse(Encoding.fromUtf8(bytes));
    const nonce = decodeHexQuantityNonce(json.nonce);
    const value = decodeHexQuantityString(json.value);
    const input = fromHex(normalizeHex(json.input));
    const chain: Eip155ChainId = {
      forkState: BlknumForkState.Forked,
      chainId: fromBcpChainId(chainId),
    };
    const r = fromHex(normalizeHex(json.r));
    const s = fromHex(normalizeHex(json.s));
    const v = decodeHexQuantity(json.v);
    const recoveryParam = getRecoveryParam(chain, v);
    const signature = new ExtendedSecp256k1Signature(r, s, recoveryParam);
    const signatureBytes = signature.toFixedLength() as SignatureBytes;

    const message = Serialization.serializeGenericTransaction(
      nonce,
      json.gasPrice,
      json.gas,
      json.to as Address,
      value,
      input,
      encodeQuantity(chain.chainId),
    );
    const messageHash = new Keccak256(message).digest();
    const signerPubkey = {
      algo: Algorithm.Secp256k1,
      data: Secp256k1.recoverPubkey(signature, messageHash) as PubkeyBytes,
    };

    const transaction: SupportedTransactionType = this.parseBytesBuildTransaction(
      input,
      json,
      value,
      chainId,
      signerPubkey,
    );

    return {
      transaction: transaction,
      signatures: [
        {
          nonce: nonce,
          pubkey: signerPubkey,
          signature: signatureBytes,
        },
      ],
    };
  }

  public identityToAddress(identity: Identity): Address {
    return pubkeyToAddress(identity.pubkey);
  }

  public isValidAddress(address: string): boolean {
    return isValidAddress(address);
  }

  private getCustomSmartContractAddress(): Address | undefined {
    const config: SmartContractConfig | undefined = this.customSmartContractConfig;
    if (config === undefined) {
      return undefined;
    }
    return config.address;
  }

  private getAtomicSwapContractAddress(unsigned: UnsignedTransaction): Address | undefined {
    const maybeSwapId = isSwapTransaction(unsigned) ? unsigned.swapId : undefined;
    return (
      maybeSwapId &&
      (maybeSwapId.prefix === SwapIdPrefix.Ether
        ? this.atomicSwapEtherContractAddress
        : this.atomicSwapErc20ContractAddress)
    );
  }

  private parseBytesBuildTransaction(
    input: Uint8Array,
    json: EthereumRpcTransactionResult,
    value: string,
    chainId: ChainId,
    signerPubkey: PubkeyBundle,
  ): SupportedTransactionType {
    const fee: Fee = {
      gasLimit: decodeHexQuantityString(json.gas),
      gasPrice: {
        quantity: decodeHexQuantityString(json.gasPrice),
        fractionalDigits: constants.primaryTokenFractionalDigits,
        tokenTicker: constants.primaryTokenTicker,
      },
    };

    const atomicSwapContractAddress = [
      this.atomicSwapEtherContractAddress,
      this.atomicSwapErc20ContractAddress,
    ].find(
      (address) =>
        address !== undefined && toChecksummedAddress(json.to).toLowerCase() === address.toLowerCase(),
    );

    const erc20Token = [...this.erc20Tokens.values()].find(
      (options) => options.contractAddress.toLowerCase() === toChecksummedAddress(json.to).toLowerCase(),
    );

    if (this.customSmartContractConfig) {
      return CustomSmartContractTransactionBuilder.buildTransaction(
        input,
        json,
        chainId,
        fee,
        signerPubkey,
        this.customSmartContractConfig,
      );
    } else if (atomicSwapContractAddress) {
      const prefix =
        atomicSwapContractAddress === this.atomicSwapErc20ContractAddress
          ? SwapIdPrefix.Erc20
          : SwapIdPrefix.Ether;
      return AtomicSwapContractTransactionBuilder.buildTransaction(
        input,
        this.erc20Tokens,
        chainId,
        value,
        fee,
        signerPubkey,
        atomicSwapContractAddress,
        prefix,
      );
    } else if (erc20Token) {
      return Erc20TokenTransactionBuilder.buildTransaction(
        input,
        json,
        erc20Token,
        chainId,
        fee,
        signerPubkey,
      );
    } else {
      const memo: string = EthereumCodec.getMemoFromInput(input);
      return {
        kind: "bcp/send",
        chainId: chainId,
        sender: pubkeyToAddress(signerPubkey),
        fee: fee,
        amount: {
          quantity: decodeHexQuantityString(json.value),
          fractionalDigits: constants.primaryTokenFractionalDigits,
          tokenTicker: constants.primaryTokenTicker,
        },
        recipient: toChecksummedAddress(json.to),
        memo: memo,
      };
    }
  }
}

/** An unconfigured EthereumCodec for backwards compatibility */
export const ethereumCodec = new EthereumCodec({});
