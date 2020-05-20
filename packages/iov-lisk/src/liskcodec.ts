import {
  Address,
  Algorithm,
  ChainId,
  Identity,
  isSendTransaction,
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
  TransactionId,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp";
import { Encoding, fromHex, Int53, toHex } from "@iov/encoding";
import { ReadonlyDate } from "readonly-date";

import { constants } from "./constants";
import { Derivation } from "./derivation";
import { Parse } from "./parse";
import { Serialization } from "./serialization";

export const liskCodec: TxCodec = {
  /**
   * Transaction serialization as in
   * https://github.com/prolina-foundation/snapshot-validator/blob/35621c7/src/transaction.cpp#L36
   */
  bytesToSign: (unsigned: UnsignedTransaction, nonce: Nonce): SigningJob => {
    const creationTimestamp = new Int53(nonce);
    const creationDate = new ReadonlyDate(creationTimestamp.toNumber() * 1000);
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
    const unsigned = signed.transaction;
    if (isSendTransaction(unsigned)) {
      const primarySignature = signed.signatures[0];
      const timestamp = new Int53(primarySignature.nonce);
      const liskTimestamp = timestamp.toNumber() - 1464109200;
      const id = Serialization.transactionId(
        unsigned,
        new ReadonlyDate(timestamp.toNumber() * 1000),
        primarySignature,
        constants.transactionSerializationOptions,
      );

      const postableObject = {
        type: 0,
        amount: unsigned.amount.quantity,
        recipientId: unsigned.recipient,
        senderPublicKey: toHex(primarySignature.pubkey.data),
        timestamp: liskTimestamp,
        fee: "10000000", // 0.1 LSK fixed
        asset: {
          data: unsigned.memo,
        },
        signature: toHex(primarySignature.signature),
        id: id,
      };
      return Encoding.toUtf8(JSON.stringify(postableObject)) as PostableBytes;
    } else {
      throw new Error("Unsupported kind of transaction");
    }
  },

  /**
   * Transaction ID as implemented in
   * https://github.com/prolina-foundation/snapshot-validator/blob/35621c7/src/transaction.cpp#L87
   */
  identifier: (signed: SignedTransaction): TransactionId => {
    const primarySignature = signed.signatures[0];
    const creationTimestamp = new Int53(primarySignature.nonce);
    const creationDate = new ReadonlyDate(creationTimestamp.toNumber() * 1000);
    return Serialization.transactionId(
      signed.transaction,
      creationDate,
      primarySignature,
      constants.transactionSerializationOptions,
    );
  },

  /**
   * Recovers bytes (UTF-8 encoded JSON) from the blockchain into a format we can use
   */
  parseBytes: (bytes: PostableBytes, chainId: ChainId): SignedTransaction => {
    const json = JSON.parse(Encoding.fromUtf8(bytes));
    const senderPublicKey: PubkeyBundle = {
      algo: Algorithm.Ed25519,
      data: fromHex(json.senderPublicKey) as PubkeyBytes,
    };

    let unsignedTransaction: UnsignedTransaction;
    switch (json.type) {
      case 0: {
        const send: SendTransaction = {
          kind: "bcp/send",
          chainId: chainId,
          senderPubkey: senderPublicKey,
          fee: {
            tokens: {
              quantity: Parse.parseQuantity(json.fee),
              fractionalDigits: constants.primaryTokenFractionalDigits,
              tokenTicker: constants.primaryTokenTicker,
            },
          },
          amount: {
            quantity: Parse.parseQuantity(json.amount),
            fractionalDigits: constants.primaryTokenFractionalDigits,
            tokenTicker: constants.primaryTokenTicker,
          },
          sender: Derivation.pubkeyToAddress(senderPublicKey),
          recipient: json.recipientId as Address,
          memo: json.asset.data,
        };
        unsignedTransaction = send;
        break;
      }
      default:
        throw new Error(`Transaction parsing failed. Unsupported transaction type: ${json.type}`);
    }

    return {
      transaction: unsignedTransaction,
      signatures: [
        {
          nonce: Parse.timeToNonce(Parse.fromTimestamp(json.timestamp)),
          pubkey: senderPublicKey,
          signature: fromHex(json.signature) as SignatureBytes,
        },
      ],
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
  identityToAddress: (identity: Identity): Address => {
    return Derivation.pubkeyToAddress(identity.pubkey);
  },

  isValidAddress: Derivation.isValidAddress,
};
