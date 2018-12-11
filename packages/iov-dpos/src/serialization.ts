// tslint:disable:no-bitwise
import Long from "long";
import { ReadonlyDate } from "readonly-date";

import { FullSignature, isSendTransaction, TransactionId, UnsignedTransaction } from "@iov/bcp-types";
import { Sha256 } from "@iov/crypto";
import { Encoding, Uint64 } from "@iov/encoding";

export interface TransactionSerializationOptions {
  readonly maxMemoLength: number; // in bytes
}

export class Serialization {
  public static toTimestamp(date: ReadonlyDate): number {
    const unixTimestamp = Math.floor(date.getTime() / 1000);

    const epoch = Date.UTC(2016, 4, 24, 17, 0, 0, 0) / 1000;
    const timestamp = unixTimestamp - epoch;

    // Timestamp must be in the signed int32 range (to be stored in a Postgres
    // integer column and to be serializeable as 4 bytes) but has no further
    // plausibility restrictions.
    // https://github.com/LiskHQ/lisk/blob/v1.0.3/logic/transaction.js#L674

    if (timestamp < -2147483648 || timestamp > 2147483647) {
      throw new Error("Timestemp not in int32 range");
    }

    return timestamp;
  }

  public static serializeTransaction(
    unsigned: UnsignedTransaction,
    creationTime: ReadonlyDate,
    options: TransactionSerializationOptions,
  ): Uint8Array {
    if (unsigned.fee !== undefined) {
      throw new Error("Fee must not be set. It is fixed and not included in the signed content.");
    }

    if (isSendTransaction(unsigned)) {
      const timestamp = Serialization.toTimestamp(creationTime);
      const timestampBytes = new Uint8Array([
        (timestamp >> 0) & 0xff,
        (timestamp >> 8) & 0xff,
        (timestamp >> 16) & 0xff,
        (timestamp >> 24) & 0xff,
      ]);
      const amount = Uint64.fromString(unsigned.amount.quantity);
      const fullRecipientString = unsigned.recipient;

      if (!fullRecipientString.match(/^[0-9]{1,20}[A-Z]{1}$/)) {
        throw new Error("Recipient does not match expected format");
      }
      const recipientNumberString = fullRecipientString.slice(0, -1);

      if (recipientNumberString !== "0" && recipientNumberString[0] === "0") {
        throw new Error("Recipient must not contain leading zeros");
      }

      const recipient = Long.fromString(recipientNumberString, true, 10);

      const memoBytes = unsigned.memo !== undefined ? Encoding.toUtf8(unsigned.memo) : new Uint8Array([]);
      if (memoBytes.length > options.maxMemoLength) {
        throw new Error(`Memo length exceeds limit. Allowed: ${options.maxMemoLength} bytes`);
      }

      return new Uint8Array([
        0, // transaction type
        ...timestampBytes,
        ...unsigned.signer.data,
        ...recipient.toBytesBE(),
        ...amount.toBytesLittleEndian(),
        ...memoBytes,
      ]);
    } else {
      throw new Error("Unsupported kind of transaction");
    }
  }

  public static transactionId(
    unsigned: UnsignedTransaction,
    creationTime: ReadonlyDate,
    primarySignature: FullSignature,
    options: TransactionSerializationOptions,
  ): TransactionId {
    const serialized = Serialization.serializeTransaction(unsigned, creationTime, options);
    const hash = new Sha256(serialized).update(primarySignature.signature).digest();
    const idString = Long.fromBytesLE(Array.from(hash.slice(0, 8)), true).toString(10);
    return idString as TransactionId;
  }
}
