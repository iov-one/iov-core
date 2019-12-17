import { Uint64 } from "@iov/encoding";

/** Use this to decode non-optional strings */
export function decodeString(input: string | null | undefined): string {
  // weave encodes empty strings as null
  return input || "";
}

export function ensure<T>(maybe: T | null | undefined, msg?: string): T {
  if (maybe === null || maybe === undefined) {
    throw new Error("missing " + (msg || "field"));
  }
  return maybe;
}

/**
 * Decodes a protobuf int field (int32/uint32/int64/uint64) into a JavaScript
 * number.
 */
export function asIntegerNumber(maybeLong: Long | number | null | undefined): number {
  if (!maybeLong) {
    return 0;
  } else if (typeof maybeLong === "number") {
    if (!Number.isInteger(maybeLong)) {
      throw new Error("Number is not an integer.");
    }
    return maybeLong;
  } else {
    return maybeLong.toInt();
  }
}

export function decodeNumericId(id: Uint8Array): number {
  return Uint64.fromBytesBigEndian(id).toNumber();
}
