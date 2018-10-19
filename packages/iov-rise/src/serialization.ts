// tslint:disable:no-bitwise
import Long from "long";
import { ReadonlyDate } from "readonly-date";

import { FullSignature, TransactionIdBytes, TransactionKind, UnsignedTransaction } from "@iov/bcp-types";
import { Sha256 } from "@iov/crypto";
import { Encoding, Uint64 } from "@iov/encoding";

export function toRiseTimestamp(date: ReadonlyDate): number {
  const timestamp = Math.floor(date.getTime() / 1000);

  const riseEpoch = Date.UTC(2016, 4, 24, 17, 0, 0, 0) / 1000;
  const riseTimestamp = timestamp - riseEpoch;

  // RISE timestamp must be in the signed int32 range (to be stored in a Postgres
  // integer column and to be serializeable as 4 bytes) but has no further
  // plausibility restrictions.
  // https://github.com/RiseVision/rise-node/blob/v1.1.1/src/logic/transaction.ts#L346

  if (riseTimestamp < -2147483648 || riseTimestamp > 2147483647) {
    throw new Error("RISE timestamp not in int32 range");
  }

  return riseTimestamp;
}

export function amountFromComponents(whole: number, fractional: number): Uint64 {
  const amount = Long.fromNumber(whole)
    .multiply(100000000)
    .add(fractional)
    .toBytesBE();
  return Uint64.fromBytesBigEndian(amount);
}

export function serializeTransaction(unsigned: UnsignedTransaction, creationTime: ReadonlyDate): Uint8Array {
  if (unsigned.fee !== undefined) {
    throw new Error("Fee must not be set. It is fixed in RISE and not included in the signed content.");
  }

  switch (unsigned.kind) {
    case TransactionKind.Send:
      const rise = toRiseTimestamp(creationTime);
      const timestampBytes = new Uint8Array([
        (rise >> 0) & 0xff,
        (rise >> 8) & 0xff,
        (rise >> 16) & 0xff,
        (rise >> 24) & 0xff,
      ]);
      const amount = amountFromComponents(unsigned.amount.whole, unsigned.amount.fractional);
      const recipientString = unsigned.recipient;
      if (!recipientString.match(/^[0-9]{1,20}R$/)) {
        throw new Error("Recipient does not match expected format");
      }

      if (recipientString !== "0R" && recipientString[0] === "0") {
        throw new Error("Recipient must not contain leading zeros");
      }

      const recipient = Long.fromString(recipientString.substring(0, recipientString.length - 1), true, 10);

      return new Uint8Array([
        0, // transaction type
        ...timestampBytes,
        ...unsigned.signer.data,
        ...recipient.toBytesBE(),
        ...amount.toBytesLittleEndian(),
      ]);
    default:
      throw new Error("Unsupported kind of transaction");
  }
}

export function transactionId(
  unsigned: UnsignedTransaction,
  creationTime: ReadonlyDate,
  primarySignature: FullSignature,
): TransactionIdBytes {
  const serialized = serializeTransaction(unsigned, creationTime);
  const hash = new Sha256(serialized).update(primarySignature.signature).digest();
  const idString = Long.fromBytesLE(Array.from(hash.slice(0, 8)), true).toString(10);
  return Encoding.toAscii(idString) as TransactionIdBytes;
}
