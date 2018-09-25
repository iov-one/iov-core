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
import { Sha256 } from "@iov/crypto";
import { Encoding, Uint64 } from "@iov/encoding";
import {
  Algorithm,
  ChainId,
  PostableBytes,
  PublicKeyBundle,
  PublicKeyBytes,
  SignatureBytes,
} from "@iov/tendermint-types";

export const liskCodec: TxCodec = {
  /**
   * Transaction serialization as in
   * https://github.com/prolina-foundation/snapshot-validator/blob/35621c7/src/transaction.cpp#L36
   */
  bytesToSign: (_1: UnsignedTransaction, _2: Nonce): SigningJob => {
    return {
      bytes: new Uint8Array([]) as SignableBytes,
      prehashType: PrehashType.None,
    };
  },

  /**
   * UTF-8 encoded JSON that can be posted to
   * https://app.swaggerhub.com/apis/LiskHQ/Lisk/1.0.30#/Transactions/postTransaction
   */
  bytesToPost: (_1: SignedTransaction): PostableBytes => {
    return new Uint8Array([]) as PostableBytes;
  },

  /**
   * Transaction ID as implemented in
   * https://github.com/prolina-foundation/snapshot-validator/blob/35621c7/src/transaction.cpp#L87
   */
  identifier: (_1: SignedTransaction): TransactionIdBytes => {
    return new Uint8Array([]) as TransactionIdBytes;
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
    // https://github.com/prolina-foundation/snapshot-validator/blob/35621c7/src/lisk.cpp#L26
    const hash = new Sha256(pubkey.data).digest();
    const firstEightBytesReversed = hash.slice(0, 8).reverse();
    const addressString = Uint64.fromBigEndianBytes(firstEightBytesReversed).toString() + "L";
    return Encoding.toAscii(addressString) as Address;
  },
};
