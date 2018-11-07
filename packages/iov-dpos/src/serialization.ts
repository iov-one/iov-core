// tslint:disable:no-bitwise
import Long from "long";
import { ReadonlyDate } from "readonly-date";

import { TransactionKind, UnsignedTransaction } from "@iov/bcp-types";
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

  public static amountFromComponents(whole: number, fractional: number): Uint64 {
    // Do math on a Long (signed 64 bit integer). The max possible value is ~700 times
    // the current Lisk/RISE supply: (2**63-1) / (130_000_000 * 100_000_000) = 709.49
    const amount = Long.fromNumber(whole)
      .multiply(100000000)
      .add(fractional)
      .toBytesBE();
    return Uint64.fromBytesBigEndian(amount);
  }

  public static serializeTransaction(
    unsigned: UnsignedTransaction,
    creationTime: ReadonlyDate,
    options: TransactionSerializationOptions,
  ): Uint8Array {
    if (unsigned.fee !== undefined) {
      throw new Error("Fee must not be set. It is fixed and not included in the signed content.");
    }

    switch (unsigned.kind) {
      case TransactionKind.Send:
        const timestamp = Serialization.toTimestamp(creationTime);
        const timestampBytes = new Uint8Array([
          (timestamp >> 0) & 0xff,
          (timestamp >> 8) & 0xff,
          (timestamp >> 16) & 0xff,
          (timestamp >> 24) & 0xff,
        ]);
        const amount = Serialization.amountFromComponents(unsigned.amount.whole, unsigned.amount.fractional);
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
      default:
        throw new Error("Unsupported kind of transaction");
    }
  }
}
