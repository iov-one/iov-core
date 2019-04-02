import {
  Address,
  Algorithm,
  ChainId,
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
  TransactionId,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp";
import { ExtendedSecp256k1Signature, Keccak256, Secp256k1 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

import { isValidAddress, pubkeyToAddress, toChecksummedAddress } from "./address";
import { constants } from "./constants";
import { BlknumForkState, Eip155ChainId, getRecoveryParam } from "./encoding";
import { Serialization } from "./serialization";
import {
  decodeHexQuantity,
  decodeHexQuantityNonce,
  decodeHexQuantityString,
  encodeQuantity,
  fromBcpChainId,
  normalizeHex,
} from "./utils";

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

export const ethereumCodec: TxCodec = {
  bytesToSign: (unsigned: UnsignedTransaction, nonce: Nonce): SigningJob => {
    return {
      bytes: Serialization.serializeUnsignedTransaction(unsigned, nonce) as SignableBytes,
      prehashType: PrehashType.Keccak256,
    };
  },
  bytesToPost: (signed: SignedTransaction): PostableBytes => {
    return Serialization.serializeSignedTransaction(signed) as PostableBytes;
  },
  identifier: (signed: SignedTransaction): TransactionId => {
    throw new Error(`Not implemented tx: ${signed}`);
  },
  parseBytes: (bytes: PostableBytes, chainId: ChainId): SignedTransaction => {
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

    const send: SendTransaction = {
      kind: "bcp/send",
      creator: {
        chainId: chainId,
        pubkey: {
          algo: Algorithm.Secp256k1,
          data: signerPubkey,
        },
      },
      fee: {
        gasLimit: {
          quantity: decodeHexQuantityString(json.gas),
          fractionalDigits: constants.primaryTokenFractionalDigits,
          tokenTicker: constants.primaryTokenTicker,
        },
        gasPrice: {
          quantity: decodeHexQuantityString(json.gasPrice),
          fractionalDigits: constants.primaryTokenFractionalDigits,
          tokenTicker: constants.primaryTokenTicker,
        },
      },
      amount: {
        quantity: decodeHexQuantityString(json.value),
        fractionalDigits: constants.primaryTokenFractionalDigits,
        tokenTicker: constants.primaryTokenTicker,
      },
      recipient: toChecksummedAddress(json.to),
      memo: Encoding.fromUtf8(input),
    };

    return {
      transaction: send,
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
  },
  identityToAddress: (identity: PublicIdentity): Address => {
    return pubkeyToAddress(identity.pubkey);
  },
  isValidAddress: isValidAddress,
};
