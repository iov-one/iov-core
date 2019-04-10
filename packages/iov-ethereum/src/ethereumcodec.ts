import BN from "bn.js";

import {
  Address,
  Algorithm,
  ChainId,
  Fee,
  Hash,
  Nonce,
  PostableBytes,
  PrehashType,
  PublicIdentity,
  PublicKeyBytes,
  SendTransaction,
  SignableBytes,
  SignatureBytes,
  SignedTransaction,
  SigningJob,
  SwapIdBytes,
  SwapOfferTransaction,
  TokenTicker,
  TransactionId,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp";
import { ExtendedSecp256k1Signature, Keccak256, Secp256k1 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

import { Abi } from "./abi";
import { isValidAddress, pubkeyToAddress, toChecksummedAddress } from "./address";
import { constants } from "./constants";
import { BlknumForkState, Eip155ChainId, getRecoveryParam } from "./encoding";
import { Erc20Options } from "./erc20";
import { Serialization } from "./serialization";
import {
  decodeHexQuantity,
  decodeHexQuantityNonce,
  decodeHexQuantityString,
  encodeQuantity,
  fromBcpChainId,
  normalizeHex,
  toEthereumHex,
} from "./utils";

const methodCallPrefix = {
  erc20: {
    transfer: toEthereumHex(Abi.calculateMethodId("transfer(address,uint256)")),
  },
};

/**
 * See https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_gettransactionbyhash
 *
 * This interface is package-internal.
 */
export interface EthereumRpcTransactionResult {
  readonly blockHash: string;
  readonly blockNumber: string;
  readonly from: string;
  /** Gas limit as set by the user */
  readonly gas: string;
  readonly gasPrice: string;
  readonly hash: string;
  readonly input: string;
  readonly nonce: string;
  readonly r: string;
  readonly s: string;
  readonly to: string;
  readonly transactionIndex: string;
  readonly v: string;
  readonly value: string;
}

export interface EthereumCodecOptions {
  /**
   * Address of the deployed atomic swap contract for ETH.
   */
  readonly atomicSwapEtherContractAddress?: Address;
  /**
   * ERC20 tokens supported by the codec instance.
   *
   * The behaviour of encoding/decoding transactions for other tokens is undefined.
   */
  readonly erc20Tokens?: ReadonlyMap<TokenTicker, Erc20Options>;
}

export class EthereumCodec implements TxCodec {
  private readonly atomicSwapEtherContractAddress: Address;
  private readonly erc20Tokens: ReadonlyMap<TokenTicker, Erc20Options>;

  constructor(options: EthereumCodecOptions) {
    this.atomicSwapEtherContractAddress = options.atomicSwapEtherContractAddress || ("0x0" as Address);
    this.erc20Tokens = options.erc20Tokens || new Map();
  }

  public bytesToSign(unsigned: UnsignedTransaction, nonce: Nonce): SigningJob {
    return {
      bytes: Serialization.serializeUnsignedTransaction(
        unsigned,
        nonce,
        this.erc20Tokens,
        this.atomicSwapEtherContractAddress,
      ) as SignableBytes,
      prehashType: PrehashType.Keccak256,
    };
  }

  public bytesToPost(signed: SignedTransaction): PostableBytes {
    return Serialization.serializeSignedTransaction(
      signed,
      this.erc20Tokens,
      this.atomicSwapEtherContractAddress,
    ) as PostableBytes;
  }

  public identifier(signed: SignedTransaction): TransactionId {
    throw new Error(`Not implemented tx: ${signed}`);
  }

  public parseBytes(bytes: PostableBytes, chainId: ChainId): SignedTransaction {
    const json: EthereumRpcTransactionResult = JSON.parse(Encoding.fromUtf8(bytes));
    const nonce = decodeHexQuantityNonce(json.nonce);
    const value = decodeHexQuantityString(json.value);
    const input = Encoding.fromHex(normalizeHex(json.input));
    const chain: Eip155ChainId = {
      forkState: BlknumForkState.Forked,
      chainId: fromBcpChainId(chainId),
    };
    const r = Encoding.fromHex(normalizeHex(json.r));
    const s = Encoding.fromHex(normalizeHex(json.s));
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
    const signerPubkey = Secp256k1.recoverPubkey(signature, messageHash) as PublicKeyBytes;
    const creator = {
      chainId: chainId,
      pubkey: {
        algo: Algorithm.Secp256k1,
        data: signerPubkey,
      },
    };
    const fee: Fee = {
      gasLimit: decodeHexQuantityString(json.gas),
      gasPrice: {
        quantity: decodeHexQuantityString(json.gasPrice),
        fractionalDigits: constants.primaryTokenFractionalDigits,
        tokenTicker: constants.primaryTokenTicker,
      },
    };

    const atomicSwap =
      toChecksummedAddress(json.to).toLowerCase() === this.atomicSwapEtherContractAddress.toLowerCase();

    const erc20Token =
      !atomicSwap &&
      [...this.erc20Tokens.values()].find(
        options => options.contractAddress.toLowerCase() === toChecksummedAddress(json.to).toLowerCase(),
      );

    let transaction: SendTransaction | SwapOfferTransaction;
    if (atomicSwap) {
      const positionOpenMethodEnd = 4;
      const positionOpenSwapIdBegin = positionOpenMethodEnd;
      const positionOpenSwapIdEnd = positionOpenSwapIdBegin + 32;
      const positionOpenRecipientBegin = positionOpenSwapIdEnd;
      const positionOpenRecipientEnd = positionOpenRecipientBegin + 32;
      const positionOpenHashBegin = positionOpenRecipientEnd;
      const positionOpenHashEnd = positionOpenHashBegin + 32;
      const positionOpenTimeoutBegin = positionOpenHashEnd;
      const positionOpenTimeoutEnd = positionOpenTimeoutBegin + 32;

      const swapId = input.slice(positionOpenSwapIdBegin, positionOpenSwapIdEnd) as SwapIdBytes;
      const recipientChecksummedAddress = toChecksummedAddress(
        Abi.decodeAddress(input.slice(positionOpenRecipientBegin, positionOpenRecipientEnd)),
      );
      const hash = input.slice(positionOpenHashBegin, positionOpenHashEnd) as Hash;
      const timeoutHeight = new BN(input.slice(positionOpenTimeoutBegin, positionOpenTimeoutEnd)).toNumber();

      transaction = {
        kind: "bcp/swap_offer",
        creator: creator,
        swapId: swapId,
        fee: fee,
        amounts: [
          {
            quantity: decodeHexQuantityString(json.value),
            fractionalDigits: constants.primaryTokenFractionalDigits,
            tokenTicker: constants.primaryTokenTicker,
          },
        ],
        recipient: recipientChecksummedAddress,
        timeout: {
          height: timeoutHeight,
        },
        hash: hash,
      };
    } else if (erc20Token && json.input.startsWith(methodCallPrefix.erc20.transfer)) {
      const positionTransferMethodEnd = 4;
      const positionTransferRecipientBegin = positionTransferMethodEnd;
      const positionTransferRecipientEnd = positionTransferRecipientBegin + 32;
      const positionTransferAmountBegin = positionTransferRecipientEnd;
      const positionTransferAmountEnd = positionTransferAmountBegin + 32;

      const quantity = Abi.decodeUint256(input.slice(positionTransferAmountBegin, positionTransferAmountEnd));
      transaction = {
        kind: "bcp/send",
        creator: creator,
        fee: fee,
        amount: {
          quantity: quantity,
          fractionalDigits: erc20Token.decimals,
          tokenTicker: erc20Token.symbol as TokenTicker,
        },
        recipient: toChecksummedAddress(
          Abi.decodeAddress(input.slice(positionTransferRecipientBegin, positionTransferRecipientEnd)),
        ),
        memo: undefined,
      };
    } else {
      let memo: string;
      try {
        memo = Encoding.fromUtf8(input);
      } catch {
        const hexstring = Encoding.toHex(input);
        // split in space separated chunks up to 16 characters each
        memo = (hexstring.match(/.{1,16}/g) || []).join(" ");
      }

      transaction = {
        kind: "bcp/send",
        creator: creator,
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

    return {
      transaction: transaction,
      primarySignature: {
        nonce: nonce,
        pubkey: {
          algo: Algorithm.Secp256k1,
          data: signerPubkey,
        },
        signature: signatureBytes,
      },
      otherSignatures: [],
    };
  }

  public identityToAddress(identity: PublicIdentity): Address {
    return pubkeyToAddress(identity.pubkey);
  }

  public isValidAddress(address: string): boolean {
    return isValidAddress(address);
  }
}

/** An unconfigured EthereumCodec for backwards compatibility */
export const ethereumCodec = new EthereumCodec({});
