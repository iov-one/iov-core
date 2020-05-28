import { ReadonlyDate } from "readonly-date";

import { fromAscii, toAscii } from "./ascii";
import { fromBase64, toBase64 } from "./base64";
import { fromHex, toHex } from "./hex";

// Global symbols in some environments
// https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
// https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder
declare const TextEncoder: any | undefined;
declare const TextDecoder: any | undefined;

export class Encoding {
  /** @deprecated use free function toHex from @iov/encoding */
  public static toHex(data: Uint8Array): string {
    return toHex(data);
  }

  /** @deprecated use free function fromHex from @iov/encoding */
  public static fromHex(hexstring: string): Uint8Array {
    return fromHex(hexstring);
  }

  /** @deprecated use free function toBase64 from @iov/encoding */
  public static toBase64(data: Uint8Array): string {
    return toBase64(data);
  }

  /** @deprecated use free function fromBase64 from @iov/encoding */
  public static fromBase64(base64String: string): Uint8Array {
    return fromBase64(base64String);
  }

  /** @deprecated use free function toAscii from @iov/encoding */
  public static toAscii(input: string): Uint8Array {
    return toAscii(input);
  }

  /** @deprecated use free function fromAscii from @iov/encoding */
  public static fromAscii(data: Uint8Array): string {
    return fromAscii(data);
  }

  public static toUtf8(str: string): Uint8Array {
    // Browser and future nodejs (https://github.com/nodejs/node/issues/20365)
    if (typeof TextEncoder !== "undefined") {
      return new TextEncoder().encode(str);
    }

    // Use Buffer hack instead of nodejs util.TextEncoder to ensure
    // webpack does not bundle the util module for browsers.
    return new Uint8Array(Buffer.from(str, "utf8"));
  }

  public static fromUtf8(data: Uint8Array): string {
    // Browser and future nodejs (https://github.com/nodejs/node/issues/20365)
    if (typeof TextDecoder !== "undefined") {
      return new TextDecoder("utf-8", { fatal: true }).decode(data);
    }

    // Use Buffer hack instead of nodejs util.TextDecoder to ensure
    // webpack does not bundle the util module for browsers.
    // Buffer.toString has no fatal option
    if (!Encoding.isValidUtf8(data)) {
      throw new Error("Invalid UTF8 data");
    }
    return Buffer.from(data).toString("utf8");
  }

  public static fromRfc3339(str: string): ReadonlyDate {
    const rfc3339Matcher = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(\.\d{1,9})?((?:[+-]\d{2}:\d{2})|Z)$/;

    const matches = rfc3339Matcher.exec(str);
    if (!matches) {
      throw new Error("Date string is not in RFC3339 format");
    }

    const year = +matches[1];
    const month = +matches[2];
    const day = +matches[3];
    const hour = +matches[4];
    const minute = +matches[5];
    const second = +matches[6];

    // fractional seconds match either undefined or a string like ".1", ".123456789"
    const milliSeconds = matches[7] ? Math.floor(+matches[7] * 1000) : 0;

    let tzOffsetSign: number;
    let tzOffsetHours: number;
    let tzOffsetMinutes: number;

    // if timezone is undefined, it must be Z or nothing (otherwise the group would have captured).
    if (matches[8] === "Z") {
      tzOffsetSign = 1;
      tzOffsetHours = 0;
      tzOffsetMinutes = 0;
    } else {
      tzOffsetSign = matches[8].substring(0, 1) === "-" ? -1 : 1;
      tzOffsetHours = +matches[8].substring(1, 3);
      tzOffsetMinutes = +matches[8].substring(4, 6);
    }

    const tzOffset = tzOffsetSign * (tzOffsetHours * 60 + tzOffsetMinutes) * 60; // seconds

    return new ReadonlyDate(
      ReadonlyDate.UTC(year, month - 1, day, hour, minute, second, milliSeconds) - tzOffset * 1000,
    );
  }

  public static toRfc3339(date: Date | ReadonlyDate): string {
    function padded(integer: number, length = 2): string {
      const filled = "00000" + integer.toString();
      return filled.substring(filled.length - length);
    }

    const year = date.getUTCFullYear();
    const month = padded(date.getUTCMonth() + 1);
    const day = padded(date.getUTCDate());
    const hour = padded(date.getUTCHours());
    const minute = padded(date.getUTCMinutes());
    const second = padded(date.getUTCSeconds());
    const ms = padded(date.getUTCMilliseconds(), 3);

    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}Z`;
  }

  private static isValidUtf8(data: Uint8Array): boolean {
    const toStringAndBack = Buffer.from(Buffer.from(data).toString("utf8"), "utf8");
    return Buffer.compare(Buffer.from(data), toStringAndBack) === 0;
  }
}
