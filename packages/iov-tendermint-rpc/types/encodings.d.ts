import { ReadonlyDate } from "readonly-date";
import { As } from "type-tagger";
export declare type Base64String = string & As<"base64">;
export declare type HexString = string & As<"hex">;
export declare type IntegerString = string & As<"integer">;
export declare type DateTimeString = string & As<"datetime">;
/**
 * A runtime checker that ensures a given value is set (i.e. not undefined or null)
 *
 * This is used when you want to verify that data at runtime matches the expected type.
 */
export declare function assertSet<T>(value: T): T;
/**
 * Throws an error if value matches the empty value for the
 * given type (array/string of length 0, number of value 0, ...)
 *
 * Otherwise returns the value.
 *
 * This implies assertSet
 */
export declare function assertNotEmpty<T>(value: T): T;
export declare function optional<T>(value: T | null | undefined, fallback: T): T;
export declare function may<T, U>(transform: (val: T) => U, value: T | null | undefined): U | undefined;
export declare class Integer {
    static parse(str: IntegerString): number;
    static encode(num: number): IntegerString;
    static ensure(num: unknown): number;
}
export declare class Base64 {
    static encode(data: Uint8Array): Base64String;
    static decode(base64String: Base64String): Uint8Array;
}
export declare class DateTime {
    static decode(dateTimeString: DateTimeString): ReadonlyDate;
}
export declare class Hex {
    static encode(data: Uint8Array): HexString;
    static decode(hexString: HexString): Uint8Array;
}
