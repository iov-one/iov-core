import { ReadonlyDate } from "readonly-date";

import {
  Algorithm,
  ChainId,
  PostableBytes,
  PublicKeyBundle,
  PublicKeyBytes,
  SignatureBytes,
} from "@iov/base-types";
import {
  Address,
  Nonce,
  PrehashType,
  SignableBytes,
  SignedTransaction,
  SigningJob,
  TransactionIdBytes,
  TransactionKind,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { Parse, Serialization } from "@iov/dpos";
import { Encoding } from "@iov/encoding";

import { constants } from "./constants";
import { isValidAddress, pubkeyToAddress } from "./derivation";

export const liskCodec: TxCodec = {
  /**
   * Transaction serialization as in
   * https://github.com/prolina-foundation/snapshot-validator/blob/35621c7/src/transaction.cpp#L36
   */
  bytesToSign: (unsigned: UnsignedTransaction, nonce: Nonce): SigningJob => {
    const creationTimestamp = nonce.toNumber();
    const creationDate = new ReadonlyDate(creationTimestamp * 1000);
    return {
      bytes: Serialization.serializeTransaction(
        unsigned,
        creationDate,
        constants.transactionSerializationOptions,
      ) as SignableBytes,
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
        const timestamp = signed.primarySignature.nonce.toNumber();
        const liskTimestamp = timestamp - 1464109200;
        const id = Serialization.transactionId(
          signed.transaction,
          new ReadonlyDate(timestamp * 1000),
          signed.primarySignature,
          constants.transactionSerializationOptions,
        );
        const amount = Serialization.amountFromComponents(
          signed.transaction.amount.whole,
          signed.transaction.amount.fractional,
        );

        const postableObject = {
          type: 0,
          amount: amount.toString(),
          recipientId: signed.transaction.recipient,
          senderPublicKey: Encoding.toHex(signed.primarySignature.pubkey.data),
          timestamp: liskTimestamp,
          fee: "10000000", // 0.1 LSK fixed
          asset: {
            data: signed.transaction.memo,
          },
          signature: Encoding.toHex(signed.primarySignature.signature),
          id: Encoding.fromAscii(id),
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
    const creationTimestamp = signed.primarySignature.nonce.toNumber();
    const creationDate = new ReadonlyDate(creationTimestamp * 1000);
    return Serialization.transactionId(
      signed.transaction,
      creationDate,
      signed.primarySignature,
      constants.transactionSerializationOptions,
    );
  },

  /**
   * Recovers bytes (UTF-8 encoded JSON) from the blockchain into a format we can use
   */
  parseBytes: (bytes: PostableBytes, chainId: ChainId): SignedTransaction => {
    const json = JSON.parse(Encoding.fromUtf8(bytes));

    let kind: TransactionKind;
    switch (json.type) {
      case 0:
        kind = TransactionKind.Send;
        break;
      default:
        throw new Error("Unsupported transaction type");
    }

    return {
      transaction: {
        chainId: chainId,
        fee: {
          ...Parse.parseQuantity(json.fee),
          fractionalDigits: constants.primaryTokenFractionalDigits,
          tokenTicker: constants.primaryTokenTicker,
        },
        signer: {
          algo: Algorithm.Ed25519,
          data: Encoding.fromHex(json.senderPublicKey) as PublicKeyBytes,
        },
        ttl: undefined,
        kind: kind,
        amount: {
          ...Parse.parseQuantity(json.amount),
          fractionalDigits: constants.primaryTokenFractionalDigits,
          tokenTicker: constants.primaryTokenTicker,
        },
        recipient: json.recipientId as Address,
        memo: json.asset.data,
      },
      primarySignature: {
        nonce: Parse.timeToNonce(Parse.fromTimestamp(json.timestamp)),
        pubkey: {
          algo: Algorithm.Ed25519,
          data: Encoding.fromHex(json.senderPublicKey) as PublicKeyBytes,
        },
        signature: Encoding.fromHex(json.signature) as SignatureBytes,
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
    return pubkeyToAddress(pubkey.data);
  },

  isValidAddress: isValidAddress,
};
