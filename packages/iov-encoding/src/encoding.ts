import { ReadonlyDate } from "readonly-date";

import { fromAscii, toAscii } from "./ascii";
import { fromBase64, toBase64 } from "./base64";
import { fromHex, toHex } from "./hex";
import { fromRfc3339, toRfc3339 } from "./rfc3339";
import { fromUtf8, toUtf8 } from "./utf8";

/**
 * @deprecated All members of this namespacing class have been
 * converted to free functions in `@iov/encoding`
 */
export class Encoding {
  /** @deprecated use free function toHex from `@iov/encoding` */
  public static toHex(data: Uint8Array): string {
    return toHex(data);
  }

  /** @deprecated use free function fromHex from `@iov/encoding` */
  public static fromHex(hexstring: string): Uint8Array {
    return fromHex(hexstring);
  }

  /** @deprecated use free function toBase64 from `@iov/encoding` */
  public static toBase64(data: Uint8Array): string {
    return toBase64(data);
  }

  /** @deprecated use free function fromBase64 from `@iov/encoding` */
  public static fromBase64(base64String: string): Uint8Array {
    return fromBase64(base64String);
  }

  /** @deprecated use free function toAscii from `@iov/encoding` */
  public static toAscii(input: string): Uint8Array {
    return toAscii(input);
  }

  /** @deprecated use free function fromAscii from `@iov/encoding` */
  public static fromAscii(data: Uint8Array): string {
    return fromAscii(data);
  }

  /** @deprecated use free function toUtf8 from `@iov/encoding` */
  public static toUtf8(str: string): Uint8Array {
    return toUtf8(str);
  }

  /** @deprecated use free function fromUtf8 from `@iov/encoding` */
  public static fromUtf8(data: Uint8Array): string {
    return fromUtf8(data);
  }

  /** @deprecated use free function fromRfc3339 from `@iov/encoding` */
  public static fromRfc3339(str: string): ReadonlyDate {
    return fromRfc3339(str);
  }

  /** @deprecated use free function toRfc3339 from `@iov/encoding` */
  public static toRfc3339(date: Date | ReadonlyDate): string {
    return toRfc3339(date);
  }
}
