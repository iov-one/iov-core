import { ReadonlyDate } from "readonly-date";

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
import {
  Algorithm,
  ChainId,
  PostableBytes,
  PublicKeyBundle,
  PublicKeyBytes,
  SignatureBytes,
} from "@iov/tendermint-types";

import { constants } from "./constants";
import { isValidAddress, pubkeyToAddress } from "./derivation";
import { serializeTransaction, transactionId } from "./serialization";

export const riseCodec: TxCodec = {
  /**
   * Transaction serialization as in
   * https://github.com/prolina-foundation/snapshot-validator/blob/35621c7/src/transaction.cpp#L36
   */
  bytesToSign: (unsigned: UnsignedTransaction, nonce: Nonce): SigningJob => {
    const creationTimestamp = nonce.toNumber();
    const creationDate = new ReadonlyDate(creationTimestamp * 1000);
    return {
      bytes: serializeTransaction(unsigned, creationDate) as SignableBytes,
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
        const riseTimestamp = timestamp - 1464109200;
        const id = transactionId(
          signed.transaction,
          new ReadonlyDate(timestamp * 1000),
          signed.primarySignature,
        );
        const amount = Serialization.amountFromComponents(
          signed.transaction.amount.whole,
          signed.transaction.amount.fractional,
        );

        const postableObject = {
          type: 0,
          amount: amount.toNumber(),
          recipientId: signed.transaction.recipient,
          senderId: pubkeyToAddress(signed.primarySignature.publicKey.data),
          senderPublicKey: Encoding.toHex(signed.primarySignature.publicKey.data),
          timestamp: riseTimestamp,
          fee: 10000000, // 0.1 RISE fixed
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
    return transactionId(signed.transaction, creationDate, signed.primarySignature);
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
          ...Parse.parseAmount(`${json.fee}`), // `fee` is a number
          tokenTicker: constants.primaryTokenTicker,
        },
        signer: {
          algo: Algorithm.Ed25519,
          data: Encoding.fromHex(json.senderPublicKey) as PublicKeyBytes,
        },
        ttl: undefined,
        kind: kind,
        amount: {
          ...Parse.parseAmount(`${json.amount}`), // `amount` is a number
          tokenTicker: constants.primaryTokenTicker,
        },
        recipient: json.recipientId as Address,
      },
      primarySignature: {
        nonce: Parse.timeToNonce(Parse.fromTimestamp(json.timestamp)),
        publicKey: {
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
  keyToAddress: (pubkey: PublicKeyBundle): Address => {
    return pubkeyToAddress(pubkey.data) as Address;
  },

  isValidAddress: isValidAddress,
};
