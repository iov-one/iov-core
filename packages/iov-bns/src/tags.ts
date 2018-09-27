import { Address } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { Tag } from "@iov/tendermint-types";

export function bnsFromOrToTag(addr: Address): Tag {
  const id = Uint8Array.from([...Encoding.toAscii("wllt:"), ...addr]);
  const key = Encoding.toHex(id).toUpperCase();
  const value = "s"; // "s" for "set"
  return { key, value };
}

export function bnsNonceTag(addr: Address): Tag {
  const id = Uint8Array.from([...Encoding.toAscii("sigs:"), ...addr]);
  const key = Encoding.toHex(id).toUpperCase();
  const value = "s"; // "s" for "set"
  return { key, value };
}
