import { ReadonlyDate } from "readonly-date";
export declare class Encoding {
  static toHex(data: Uint8Array): string;
  static fromHex(hexstring: string): Uint8Array;
  static toBase64(data: Uint8Array): string;
  static fromBase64(base64String: string): Uint8Array;
  static toAscii(input: string): Uint8Array;
  static fromAscii(data: Uint8Array): string;
  static toUtf8(str: string): Uint8Array;
  static fromUtf8(data: Uint8Array): string;
  static fromRfc3339(str: string): ReadonlyDate;
  static toRfc3339(date: Date | ReadonlyDate): string;
  private static isValidUtf8;
}
