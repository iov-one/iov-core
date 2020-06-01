import { ReadonlyDate } from "readonly-date";
/**
 * @deprecated All members of this namespacing class have been
 * converted to free functions in `@iov/encoding`
 */
export declare class Encoding {
  /** @deprecated use free function toHex from `@iov/encoding` */
  static toHex(data: Uint8Array): string;
  /** @deprecated use free function fromHex from `@iov/encoding` */
  static fromHex(hexstring: string): Uint8Array;
  /** @deprecated use free function toBase64 from `@iov/encoding` */
  static toBase64(data: Uint8Array): string;
  /** @deprecated use free function fromBase64 from `@iov/encoding` */
  static fromBase64(base64String: string): Uint8Array;
  /** @deprecated use free function toAscii from `@iov/encoding` */
  static toAscii(input: string): Uint8Array;
  /** @deprecated use free function fromAscii from `@iov/encoding` */
  static fromAscii(data: Uint8Array): string;
  /** @deprecated use free function toUtf8 from `@iov/encoding` */
  static toUtf8(str: string): Uint8Array;
  /** @deprecated use free function fromUtf8 from `@iov/encoding` */
  static fromUtf8(data: Uint8Array): string;
  /** @deprecated use free function fromRfc3339 from `@iov/encoding` */
  static fromRfc3339(str: string): ReadonlyDate;
  /** @deprecated use free function toRfc3339 from `@iov/encoding` */
  static toRfc3339(date: Date | ReadonlyDate): string;
}
