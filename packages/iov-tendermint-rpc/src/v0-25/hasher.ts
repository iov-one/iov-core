import { PostableBytes } from "@iov/base-types";
import { Sha256 } from "@iov/crypto";

import { TxHash } from "../types";

// hash is a truncated sha256 hash
// https://github.com/tendermint/tendermint/blob/v0.25.0/types/tx.go#L19-L22
// https://github.com/tendermint/tendermint/blob/v0.25.0/crypto/tmhash/hash.go#L44-L48
export function hashTx(tx: PostableBytes): TxHash {
  const hash = new Sha256(tx).digest();
  return hash.slice(0, 20) as TxHash;
}
