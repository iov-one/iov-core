import {
  AtomicSwapQuery,
  isAtomicSwapIdQuery,
  isAtomicSwapRecipientQuery,
  isAtomicSwapSenderQuery,
  QueryTag,
} from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import { bucketKey, decodeBnsAddress, hashIdentifier, indexKey } from "./util";

export function bnsSwapQueryTag(query: AtomicSwapQuery, set = true): QueryTag {
  let binKey: Uint8Array;
  const bucket = "esc";
  if (isAtomicSwapIdQuery(query)) {
    binKey = Uint8Array.from([...bucketKey(bucket), ...query.swapid]);
  } else if (isAtomicSwapSenderQuery(query)) {
    binKey = Uint8Array.from([...indexKey(bucket, "sender"), ...decodeBnsAddress(query.sender).data]);
  } else if (isAtomicSwapRecipientQuery(query)) {
    binKey = Uint8Array.from([...indexKey(bucket, "recipient"), ...decodeBnsAddress(query.recipient).data]);
  } else {
    // if (isQueryBySwapHash(query))
    binKey = Uint8Array.from([...indexKey(bucket, "arbiter"), ...hashIdentifier(query.hashlock)]);
  }

  return {
    key: Encoding.toHex(binKey).toUpperCase(),
    // "s" for set, "d" for delete.... we need to watch both changes to be clear
    // But if we return two tags here, that would AND not OR
    value: set ? "s" : "d",
  };
}
