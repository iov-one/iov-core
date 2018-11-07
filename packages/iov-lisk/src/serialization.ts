// tslint:disable:no-bitwise
import Long from "long";
import { ReadonlyDate } from "readonly-date";

import { FullSignature, TransactionIdBytes, TransactionKind, UnsignedTransaction } from "@iov/bcp-types";
import { Sha256 } from "@iov/crypto";
import { Serialization } from "@iov/dpos";
import { Encoding, Uint64 } from "@iov/encoding";

export function amountFromComponents(whole: number, fractional: number): Uint64 {
  const amount = Long.fromNumber(whole)
    .multiply(100000000)
    .add(fractional)
    .toBytesBE();
  return Uint64.fromBytesBigEndian(amount);
}

export function serializeTransaction(unsigned: UnsignedTransaction, creationTime: ReadonlyDate): Uint8Array {
  if (unsigned.fee !== undefined) {
    throw new Error("Fee must not be set. It is fixed in Lisk and not included in the signed content.");
  }

  switch (unsigned.kind) {
    case TransactionKind.Send:
      const liskTimestamp = Serialization.toTimestamp(creationTime);
      const timestampBytes = new Uint8Array([
        (liskTimestamp >> 0) & 0xff,
        (liskTimestamp >> 8) & 0xff,
        (liskTimestamp >> 16) & 0xff,
        (liskTimestamp >> 24) & 0xff,
      ]);
      const amount = amountFromComponents(unsigned.amount.whole, unsigned.amount.fractional);
      const recipientString = unsigned.recipient;
      if (!recipientString.match(/^[0-9]{1,20}L$/)) {
        throw new Error("Recipient does not match expected format");
      }

      if (recipientString !== "0L" && recipientString[0] === "0") {
        throw new Error("Recipient must not contain leading zeros");
      }

      const recipient = Long.fromString(recipientString.substring(0, recipientString.length - 1), true, 10);

      const memoBytes = unsigned.memo !== undefined ? Encoding.toUtf8(unsigned.memo) : new Uint8Array([]);
      if (memoBytes.length > 64) {
        throw new Error("Memo exceeds 64 bytes");
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
