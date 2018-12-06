import { PostableBytes } from "@iov/base-types";
import { Ripemd160 } from "@iov/crypto";

import { TxHash } from "../common";

export function hashTx(tx: PostableBytes): TxHash {
  const hash = new Ripemd160(prefix(tx)).update(tx).digest();
  return hash as TxHash;
}

// prefix will create a varint prefix for any number < 2^14
// should be a good enough estimation for tx hashing
function prefix(tx: Uint8Array): Uint8Array {
  const l = tx.length;
  if (l < 128) {
    return Uint8Array.from([l]);
  }
  const high = Math.floor(l / 128);
  const low = (l % 128) + 128;
  return Uint8Array.from([low, high]);
}
