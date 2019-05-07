import { ReadonlyDate } from "readonly-date";

import {
  Address,
  Algorithm,
  ChainId,
  Identity,
  isSendTransaction,
  Nonce,
  PostableBytes,
  PrehashType,
  PublicKeyBytes,
  SendTransaction,
  SignableBytes,
  SignatureBytes,
  SignedTransaction,
  SigningJob,
  TransactionId,
  TxCodec,
  UnsignedTransaction,
  WithCreator,
} from "@iov/bcp";
import { Parse, Serialization } from "@iov/dpos";
import { Encoding, Int53 } from "@iov/encoding";

import { constants } from "./constants";
import { isValidAddress, pubkeyToAddress } from "./derivation";

export const riseCodec: TxCodec = {
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
      if (unsigned.memo) {
        throw new Error("RISE does not support sent transaction memos.");
      }

      const timestamp = new Int53(signed.primarySignature.nonce);
      const riseTimestamp = timestamp.toNumber() - 1464109200;
      const id = Serialization.transactionId(
        unsigned,
        new ReadonlyDate(timestamp.toNumber() * 1000),
        signed.primarySignature,
        constants.transactionSerializationOptions,
      );

      const postableObject = {
        type: 0,
        amount: Int53.fromString(unsigned.amount.quantity).toNumber(),
        recipientId: unsigned.recipient,
        senderId: pubkeyToAddress(signed.primarySignature.pubkey.data),
        senderPublicKey: Encoding.toHex(signed.primarySignature.pubkey.data),
        timestamp: riseTimestamp,
        fee: 10000000, // 0.1 RISE fixed
        signature: Encoding.toHex(signed.primarySignature.signature),
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
    const creationTimestamp = new Int53(signed.primarySignature.nonce);
    const creationDate = new ReadonlyDate(creationTimestamp.toNumber() * 1000);
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

    let unsignedTransaction: UnsignedTransaction;
    switch (json.type) {
      case 0:
        const send: SendTransaction & WithCreator = {
          kind: "bcp/send",
          creator: {
            chainId: chainId,
            pubkey: {
              algo: Algorithm.Ed25519,
              data: Encoding.fromHex(json.senderPublicKey) as PublicKeyBytes,
            },
          },
          fee: {
            tokens: {
              quantity: Parse.parseQuantity(`${json.fee}`), // `fee` is a number
              fractionalDigits: constants.primaryTokenFractionalDigits,
              tokenTicker: constants.primaryTokenTicker,
            },
          },
          amount: {
            quantity: Parse.parseQuantity(`${json.amount}`), // `amount` is a number
            fractionalDigits: constants.primaryTokenFractionalDigits,
            tokenTicker: constants.primaryTokenTicker,
          },
          recipient: json.recipientId as Address,
        };
        unsignedTransaction = send;
        break;
      default:
        throw new Error(`Transaction parsing failed. Unsupported transaction type: ${json.type}`);
    }

    return {
      transaction: unsignedTransaction,
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
   * Address string, e.g. 10145108642177909005R
   */
  identityToAddress: (identity: Identity): Address => {
    return pubkeyToAddress(identity.pubkey.data);
  },

  isValidAddress: isValidAddress,
};
