// import Buffer from "buffer";
import hasher from "ripemd160";

import { PostableBytes, TxId } from "@iov/tendermint-types";

// a bit ugly as this expects buffer, while the rest of code uint8array
export const hashTx = (tx: PostableBytes): TxId => {
  const hash = new hasher().update(Buffer.from(tx));
  return Uint8Array.from(hash.digest()) as TxId;
};
