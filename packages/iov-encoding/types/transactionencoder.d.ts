import { JsonCompatibleValue } from "./json";
/**
 * Encodes non-circular JavaScript objects and primitives into JSON.
 * Used for encoding/decoding transactions but works for kind of data consisting of the supported types.
 *
 * Supported types:
 * - boolean
 * - number
 * - null
 * - object
 * - Array
 * - string
 * - Uint8Array
 */
export declare class TransactionEncoder {
  static toJson(data: unknown): JsonCompatibleValue;
  static fromJson(data: JsonCompatibleValue): any;
}
