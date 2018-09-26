import Long from "long";

import {
  Address,
  Nonce,
  PrehashType,
  SignableBytes,
  SignedTransaction,
  SigningJob,
  TokenTicker,
  TransactionIdBytes,
  TransactionKind,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import {
  Algorithm,
  ChainId,
  PostableBytes,
  PublicKeyBundle,
  PublicKeyBytes,
  SignatureBytes,
} from "@iov/tendermint-types";

import { pubkeyToAddress } from "./derivation";
import { serializeTransaction, transactionId } from "./serialization";

export const liskCodec: TxCodec = {
  /**
   * Transaction serialization as in
   * https://github.com/prolina-foundation/snapshot-validator/blob/35621c7/src/transaction.cpp#L36
   */
  bytesToSign: (unsigned: UnsignedTransaction, _: Nonce): SigningJob => {
    return {
      bytes: serializeTransaction(unsigned) as SignableBytes,
      prehashType: PrehashType.Sha256,
    };
  },

  /**
   * UTF-8 encoded JSON that can be posted to
   * https://app.swaggerhub.com/apis/LiskHQ/Lisk/1.0.30#/Transactions/postTransaction
   */
  bytesToPost: (signed: SignedTransaction): PostableBytes => {
    switch (signed.transaction.kind) {
      case TransactionKind.Send:
        const amount = Long.fromNumber(
          signed.transaction.amount.whole * 100000000 + signed.transaction.amount.fractional,
          true,
        );
        const postableObject = {
          type: 0,
          amount: amount.toString(10),
          recipientId: Encoding.fromAscii(signed.transaction.recipient),
          senderPublicKey: Encoding.toHex(signed.primarySignature.publicKey.data),
          timestamp: signed.transaction.timestamp!,
          fee: "10000000", // 0.1 LSK fixed
          asset: {
            data: signed.transaction.memo,
          },
          signature: Encoding.toHex(signed.primarySignature.signature),
          id: Encoding.fromAscii(transactionId(signed.transaction, signed.primarySignature)),
        };
        return Encoding.toUtf8(JSON.stringify(postableObject)) as PostableBytes;
      default:
        throw new Error("Unsupported kind of transaction");
    }
  },

  /**
   * Transaction ID as implemented in
   * https://github.com/prolina-foundation/snapshot-validator/blob/35621c7/src/transaction.cpp#L87
   */
  identifier: (signed: SignedTransaction): TransactionIdBytes => {
    return transactionId(signed.transaction, signed.primarySignature);
  },

  /**
   * Recovers bytes (UTF-8 encoded JSON) from the blockchain into a format we can use
   */
  parseBytes: (_1: PostableBytes, _2: ChainId): SignedTransaction => {
    return {
      transaction: {
        chainId: "lisk-testnet" as ChainId,
        fee: {
          whole: 0,
          fractional: 1,
          tokenTicker: "LSK" as TokenTicker,
        },
        signer: {
          algo: Algorithm.ED25519,
          data: new Uint8Array([]) as PublicKeyBytes,
        },
        ttl: undefined,
        kind: TransactionKind.Send,
        amount: {
          whole: 3,
          fractional: 22,
          tokenTicker: "LSK" as TokenTicker,
        },
        recipient: new Uint8Array([]) as Address,
        memo: "lalala",
      },
      primarySignature: {
        nonce: new Long(0) as Nonce,
        publicKey: {
          algo: Algorithm.ED25519,
          data: new Uint8Array([]) as PublicKeyBytes,
        },
        signature: new Uint8Array([]) as SignatureBytes,
      },
      otherSignatures: [],
    };
  },

  /**
   * ASCII-encoded address string, e.g. 6076671634347365051L
   *
   * Addresses cannot be stored as raw uint64 because there are two types of recipient addresses
   * on the Lisk blockchain that cannot be encoded as uint64 :
   * 1. leading zeros make different addresses ("123L" != "000123L")
   * 2. some addresses exceed the uint64 range (e.g. "19961131544040416558L")
   * These are bugs we have to deal with.
   */
  keyToAddress: (pubkey: PublicKeyBundle): Address => {
    return pubkeyToAddress(pubkey.data) as Address;
  },
};
