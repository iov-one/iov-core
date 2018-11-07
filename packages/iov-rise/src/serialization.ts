// tslint:disable:no-bitwise
import Long from "long";
import { ReadonlyDate } from "readonly-date";

import { FullSignature, TransactionIdBytes, UnsignedTransaction } from "@iov/bcp-types";
import { Sha256 } from "@iov/crypto";
import { Serialization } from "@iov/dpos";
import { Encoding } from "@iov/encoding";

import { constants } from "./constants";

export function transactionId(
  unsigned: UnsignedTransaction,
  creationTime: ReadonlyDate,
  primarySignature: FullSignature,
): TransactionIdBytes {
  const serialized = Serialization.serializeTransaction(
    unsigned,
    creationTime,
    constants.transactionSerializationOptions,
  );
  const hash = new Sha256(serialized).update(primarySignature.signature).digest();
  const idString = Long.fromBytesLE(Array.from(hash.slice(0, 8)), true).toString(10);
  return Encoding.toAscii(idString) as TransactionIdBytes;
}
