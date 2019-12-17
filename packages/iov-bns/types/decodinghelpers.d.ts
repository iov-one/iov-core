/// <reference types="long" />
/** Use this to decode non-optional strings */
export declare function decodeString(input: string | null | undefined): string;
export declare function ensure<T>(maybe: T | null | undefined, msg?: string): T;
/**
 * Decodes a protobuf int field (int32/uint32/int64/uint64) into a JavaScript
 * number.
 */
export declare function asIntegerNumber(maybeLong: Long | number | null | undefined): number;
export declare function decodeNumericId(id: Uint8Array): number;
