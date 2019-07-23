import { isUint8Array } from "@iov/bcp";
import { Encoding } from "@iov/encoding";
import { JsonCompatibleValue } from "@iov/jsonrpc";

const prefixes = {
  string: "string:",
  bytes: "bytes:",
};

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
export class TransactionEncoder {
  public static toJson(data: unknown): JsonCompatibleValue {
    if (typeof data === "number" || typeof data === "boolean") {
      return data;
    }

    if (data === null) {
      return null;
    }

    if (typeof data === "string") {
      return `${prefixes.string}${data}`;
    }

    if (isUint8Array(data)) {
      return `${prefixes.bytes}${Encoding.toHex(data)}`;
    }

    if (Array.isArray(data)) {
      return data.map(TransactionEncoder.toJson);
    }

    // Exclude special kind of objects like Array, Date or Uint8Array
    // Object.prototype.toString() returns a specified value:
    // http://www.ecma-international.org/ecma-262/7.0/index.html#sec-object.prototype.tostring
    if (
      typeof data === "object" &&
      data !== null &&
      Object.prototype.toString.call(data) === "[object Object]"
    ) {
      const out: any = {};
      for (const key of Object.keys(data)) {
        // tslint:disable-next-line: no-object-mutation
        out[key] = TransactionEncoder.toJson((data as any)[key]);
      }
      return out;
    }

    throw new Error("Cannot encode type to JSON");
  }

  public static fromJson(data: JsonCompatibleValue): any {
    if (typeof data === "number" || typeof data === "boolean") {
      return data;
    }

    if (data === null) {
      return null;
    }

    if (typeof data === "string") {
      if (data.startsWith(prefixes.string)) {
        return data.slice(prefixes.string.length);
      }

      if (data.startsWith(prefixes.bytes)) {
        return Encoding.fromHex(data.slice(prefixes.bytes.length));
      }

      throw new Error("Found string with unknown prefix");
    }

    if (Array.isArray(data)) {
      return data.map(TransactionEncoder.fromJson);
    }

    // Exclude special kind of objects like Array, Date or Uint8Array
    // Object.prototype.toString() returns a specified value:
    // http://www.ecma-international.org/ecma-262/7.0/index.html#sec-object.prototype.tostring
    if (
      typeof data === "object" &&
      data !== null &&
      Object.prototype.toString.call(data) === "[object Object]"
    ) {
      const out: any = {};
      for (const key of Object.keys(data)) {
        // tslint:disable-next-line: no-object-mutation
        out[key] = TransactionEncoder.fromJson((data as any)[key]);
      }
      return out;
    }

    throw new Error("Cannot decode type from JSON");
  }
}
