import { ReadonlyDate } from "readonly-date";

import { fromAscii, toAscii } from "./ascii";
import { fromBase64, toBase64 } from "./base64";
import { fromHex, toHex } from "./hex";
import { fromUtf8, toUtf8 } from "./utf8";

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

  /** @deprecated use free function toUtf8 from @iov/encoding */
  public static toUtf8(str: string): Uint8Array {
    return toUtf8(str);
  }

  /** @deprecated use free function fromUtf8 from @iov/encoding */
  public static fromUtf8(data: Uint8Array): string {
    return fromUtf8(data);
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
}
