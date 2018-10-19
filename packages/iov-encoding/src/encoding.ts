import * as base64js from "base64-js";
import * as bech32 from "bech32";
import { ReadonlyDate } from "readonly-date";

export class Encoding {
  public static toHex(data: Uint8Array): string {
    let out: string = "";
    for (const byte of data) {
      out += ("0" + byte.toString(16)).slice(-2);
    }
    return out;
  }

  public static fromHex(hexstring: string): Uint8Array {
    if (hexstring.length % 2 !== 0) {
      throw new Error("hex string length must be a multiple of 2");
    }

    // tslint:disable-next-line:readonly-array
    const listOfInts: number[] = [];
    for (let i = 0; i < hexstring.length; i += 2) {
      const hexByteAsString = hexstring.substr(i, 2);
      if (!hexByteAsString.match(/[0-9a-f]{2}/i)) {
        throw new Error("hex string contains invalid characters");
      }
      listOfInts.push(parseInt(hexByteAsString, 16));
    }
    return new Uint8Array(listOfInts);
  }

  public static toBase64(data: Uint8Array): string {
    return base64js.fromByteArray(data);
  }

  public static fromBase64(base64String: string): Uint8Array {
    if (!base64String.match(/^[a-zA-Z0-9+/]*={0,2}$/)) {
      throw new Error("Invalid base64 string format");
    }
    return base64js.toByteArray(base64String);
  }

  public static toAscii(input: string): Uint8Array {
    const toNums = (str: string) =>
      str.split("").map((x: string) => {
        const charCode = x.charCodeAt(0);
        // 0x00–0x1F control characters
        // 0x20–0x7E printable characters
        // 0x7F delete character
        // 0x80–0xFF out of 7 bit ascii range
        if (charCode < 0x20 || charCode > 0x7e) {
          throw new Error("Cannot encode character that is out of printable ASCII range: " + charCode);
        }
        return charCode;
      });
    return Uint8Array.from(toNums(input));
  }

  public static fromAscii(data: Uint8Array): string {
    const fromNums = (listOfNumbers: ReadonlyArray<number>) =>
      listOfNumbers.map(
        (x: number): string => {
          // 0x00–0x1F control characters
          // 0x20–0x7E printable characters
          // 0x7F delete character
          // 0x80–0xFF out of 7 bit ascii range
          if (x < 0x20 || x > 0x7e) {
            throw new Error("Cannot decode character that is out of printable ASCII range: " + x);
          }
          return String.fromCharCode(x);
        },
      );

    return fromNums(Array.from(data)).join("");
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
    function padded(integer: number, length: number = 2): string {
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

export class Bech32 {
  public static encode(prefix: string, data: Uint8Array): string {
    const dataToWords = bech32.toWords(Buffer.from(data));
    const encodedData = bech32.encode(prefix, dataToWords);
    return encodedData;
  }

  public static decode(address: string): { readonly prefix: string; readonly data: Uint8Array } {
    const decodedAddress = bech32.decode(address);
    return {
      prefix: decodedAddress.prefix,
      data: new Uint8Array(bech32.fromWords(decodedAddress.words)),
    };
  }
}
