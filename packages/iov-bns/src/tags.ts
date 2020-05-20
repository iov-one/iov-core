import {
  AtomicSwapQuery,
  isAtomicSwapHashQuery,
  isAtomicSwapIdQuery,
  isAtomicSwapRecipientQuery,
  isAtomicSwapSenderQuery,
  QueryTag,
} from "@iov/bcp";
import { toHex } from "@iov/encoding";

import { bucketKey, decodeBnsAddress, indexKey } from "./util";

export function bnsSwapQueryTag(query: AtomicSwapQuery, set = true): QueryTag {
  let binKey: Uint8Array;
  // https://github.com/iov-one/weave/blob/v0.15.0/x/aswap/model.go#L15
  const bucket = "swap";
  if (isAtomicSwapIdQuery(query)) {
    binKey = Uint8Array.from([...bucketKey(bucket), ...query.id.data]);
  } else if (isAtomicSwapSenderQuery(query)) {
    binKey = Uint8Array.from([...indexKey(bucket, "source"), ...decodeBnsAddress(query.sender).data]);
  } else if (isAtomicSwapRecipientQuery(query)) {
    binKey = Uint8Array.from([...indexKey(bucket, "destination"), ...decodeBnsAddress(query.recipient).data]);
  } else if (isAtomicSwapHashQuery(query)) {
    binKey = Uint8Array.from([...indexKey(bucket, "preimage_hash"), ...query.hash]);
  } else {
    throw new Error("Unsupported query type");
  }

  return {
    key: toHex(binKey).toUpperCase(),
    // "s" for set, "d" for delete.... we need to watch both changes to be clear
    // But if we return two tags here, that would AND not OR
    value: set ? "s" : "d",
  };
}
