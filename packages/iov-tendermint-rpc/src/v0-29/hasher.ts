import { Sha256 } from "@iov/crypto";

import { TxBytes, TxHash } from "../types";

// hash is sha256
// https://github.com/tendermint/tendermint/blob/master/UPGRADING.md#v0260
export function hashTx(tx: TxBytes): TxHash {
  const hash = new Sha256(tx).digest();
  return hash as TxHash;
}
