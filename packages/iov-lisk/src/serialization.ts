// tslint:disable:no-bitwise
import Long from "long";

import { FullSignature, TransactionIdBytes, TransactionKind, UnsignedTransaction } from "@iov/bcp-types";
import { Sha256 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

export function serializeTransaction(unsigned: UnsignedTransaction): Uint8Array {
  if (unsigned.fee !== undefined) {
    throw new Error("Fee must not be set. It is fixed in Lisk and not included in the signed content.");
  }

  switch (unsigned.kind) {
    case TransactionKind.Send:
      const timestampBytes = new Uint8Array([
        (unsigned.timestamp! >> 0) & 0xff,
        (unsigned.timestamp! >> 8) & 0xff,
        (unsigned.timestamp! >> 16) & 0xff,
        (unsigned.timestamp! >> 24) & 0xff,
      ]);
      const amount = Long.fromNumber(unsigned.amount.whole * 100000000 + unsigned.amount.fractional, true);
      const recipientString = Encoding.fromAscii(unsigned.recipient);
      if (!recipientString.match(/^[0-9]{1,20}L$/)) {
        throw new Error("Recipient does not match expected format");
      }

      if (recipientString !== "0L" && recipientString[0] === "0") {
        throw new Error("Recipient must not contain leading zeros");
      }

      const recipient = Long.fromString(recipientString.substring(0, recipientString.length - 1), true, 10);

      const memoBytes = unsigned.memo !== undefined ? Encoding.toUtf8(unsigned.memo) : new Uint8Array([]);

      return new Uint8Array([
        0, // transaction type
        ...timestampBytes,
        ...unsigned.signer.data,
        ...recipient.toBytesBE(),
        ...amount.toBytesLE(),
        ...memoBytes,
      ]);
    default:
      throw new Error("Unsupported kind of transaction");
  }
}

export function transactionId(
  unsigned: UnsignedTransaction,
  primarySignature: FullSignature,
): TransactionIdBytes {
  const serialized = serializeTransaction(unsigned);
  const hash = new Sha256(serialized).update(primarySignature.signature).digest();
  const idString = Long.fromBytesLE(Array.from(hash.slice(0, 8)), true).toString(10);
  return Encoding.toAscii(idString) as TransactionIdBytes;
}
