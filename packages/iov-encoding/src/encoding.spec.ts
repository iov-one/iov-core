import { Encoding } from "./encoding";

describe("Encoding", () => {
  describe("UTF8 encoding", () => {
    it("encodes ascii strings", () => {
      expect(Encoding.toUtf8("")).toEqual(new Uint8Array([]));
      expect(Encoding.toUtf8("abc")).toEqual(new Uint8Array([0x61, 0x62, 0x63]));
      expect(Encoding.toUtf8(" ?=-n|~+-*/\\")).toEqual(
        new Uint8Array([0x20, 0x3f, 0x3d, 0x2d, 0x6e, 0x7c, 0x7e, 0x2b, 0x2d, 0x2a, 0x2f, 0x5c]),
      );
    });

    it("decodes ascii string", () => {
      expect(Encoding.fromUtf8(new Uint8Array([]))).toEqual("");
      expect(Encoding.fromUtf8(new Uint8Array([0x61, 0x62, 0x63]))).toEqual("abc");
      expect(
        Encoding.fromUtf8(
          new Uint8Array([0x20, 0x3f, 0x3d, 0x2d, 0x6e, 0x7c, 0x7e, 0x2b, 0x2d, 0x2a, 0x2f, 0x5c]),
        ),
      ).toEqual(" ?=-n|~+-*/\\");
    });

    it("encodes null character", () => {
      expect(Encoding.toUtf8("\u0000")).toEqual(new Uint8Array([0x00]));
    });

    it("decodes null byte", () => {
      expect(Encoding.fromUtf8(new Uint8Array([0x00]))).toEqual("\u0000");
    });

    it("encodes Basic Multilingual Plane strings", () => {
      expect(Encoding.toUtf8("ö")).toEqual(new Uint8Array([0xc3, 0xb6]));
      expect(Encoding.toUtf8("¥")).toEqual(new Uint8Array([0xc2, 0xa5]));
      expect(Encoding.toUtf8("Ф")).toEqual(new Uint8Array([0xd0, 0xa4]));
      expect(Encoding.toUtf8("ⱴ")).toEqual(new Uint8Array([0xe2, 0xb1, 0xb4]));
      expect(Encoding.toUtf8("ⵘ")).toEqual(new Uint8Array([0xe2, 0xb5, 0x98]));
    });

    it("decodes Basic Multilingual Plane strings", () => {
      expect(Encoding.fromUtf8(new Uint8Array([0xc3, 0xb6]))).toEqual("ö");
      expect(Encoding.fromUtf8(new Uint8Array([0xc2, 0xa5]))).toEqual("¥");
      expect(Encoding.fromUtf8(new Uint8Array([0xd0, 0xa4]))).toEqual("Ф");
      expect(Encoding.fromUtf8(new Uint8Array([0xe2, 0xb1, 0xb4]))).toEqual("ⱴ");
      expect(Encoding.fromUtf8(new Uint8Array([0xe2, 0xb5, 0x98]))).toEqual("ⵘ");
    });

    it("encodes Supplementary Multilingual Plane strings", () => {
      // U+1F0A1
      expect(Encoding.toUtf8("🂡")).toEqual(new Uint8Array([0xf0, 0x9f, 0x82, 0xa1]));
      // U+1034A
      expect(Encoding.toUtf8("𐍊")).toEqual(new Uint8Array([0xf0, 0x90, 0x8d, 0x8a]));
    });

    it("decodes Supplementary Multilingual Plane strings", () => {
      // U+1F0A1
      expect(Encoding.fromUtf8(new Uint8Array([0xf0, 0x9f, 0x82, 0xa1]))).toEqual("🂡");
      // U+1034A
      expect(Encoding.fromUtf8(new Uint8Array([0xf0, 0x90, 0x8d, 0x8a]))).toEqual("𐍊");
    });

    it("throws on invalid utf8 bytes", () => {
      // Broken UTF8 example from https://github.com/nodejs/node/issues/16894
      expect(() => Encoding.fromUtf8(new Uint8Array([0xf0, 0x80, 0x80]))).toThrow();
    });
  });

  describe("RFC3339", () => {
    it("parses dates with different time zones", () => {
      // time zone +/- 0
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13+00:00")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13-00:00")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13)),
      );

      // time zone positive (full hours)
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13+01:00")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11 - 1, 12, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13+02:00")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11 - 2, 12, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13+03:00")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11 - 3, 12, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13+11:00")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11 - 11, 12, 13)),
      );

      // time zone negative (full hours)
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13-01:00")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11 + 1, 12, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13-02:00")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11 + 2, 12, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13-03:00")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11 + 3, 12, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13-11:00")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11 + 11, 12, 13)),
      );

      // time zone positive (minutes only)
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13+00:01")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12 - 1, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13+00:30")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12 - 30, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13+00:45")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12 - 45, 13)),
      );

      // time zone negative (minutes only)
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13-00:01")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12 + 1, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13-00:30")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12 + 30, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13-00:45")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12 + 45, 13)),
      );

      // time zone positive (hours and minutes)
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13+01:01")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11 - 1, 12 - 1, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13+04:30")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11 - 4, 12 - 30, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13+10:20")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11 - 10, 12 - 20, 13)),
      );

      // time zone negative (hours and minutes)
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13-01:01")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11 + 1, 12 + 1, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13-04:30")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11 + 4, 12 + 30, 13)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13-10:20")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11 + 10, 12 + 20, 13)),
      );
    });

    it("parses dates with milliseconds", () => {
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.000Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 0)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.123Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 123)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.999Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 999)),
      );
    });

    it("parses dates with low precision fractional seconds", () => {
      // 1 digit
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.0Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 0)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.1Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 100)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.9Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 900)),
      );

      // 2 digit
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.00Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 0)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.12Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 120)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.99Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 990)),
      );
    });

    it("parses dates with high precision fractional seconds", () => {
      // everything after the 3rd digit is truncated

      // 4 digits
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.0000Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 0)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.1234Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 123)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.9999Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 999)),
      );

      // 5 digits
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.00000Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 0)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.12345Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 123)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.99999Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 999)),
      );

      // 6 digits
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.000000Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 0)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.123456Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 123)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.999999Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 999)),
      );

      // 7 digits
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.0000000Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 0)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.1234567Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 123)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.9999999Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 999)),
      );

      // 8 digits
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.00000000Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 0)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.12345678Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 123)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.99999999Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 999)),
      );

      // 9 digits
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.000000000Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 0)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.123456789Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 123)),
      );
      expect(Encoding.fromRfc3339("2002-10-02T11:12:13.999999999Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 999)),
      );
    });

    it("accepts space separators", () => {
      // https://tools.ietf.org/html/rfc3339#section-5.6
      // Applications using this syntax may choose, for the sake of readability,
      // to specify a full-date and full-time separated by (say) a space character.
      expect(Encoding.fromRfc3339("2002-10-02 11:12:13Z")).toEqual(
        new Date(Date.UTC(2002, 9, 2, 11, 12, 13)),
      );
    });

    it("throws for invalid format", () => {
      // extra whitespace
      expect(() => Encoding.fromRfc3339(" 2002-10-02T11:12:13Z")).toThrow();
      expect(() => Encoding.fromRfc3339("2002-10-02T11:12:13Z ")).toThrow();
      expect(() => Encoding.fromRfc3339("2002-10-02T11:12:13 Z")).toThrow();

      // wrong date separators
      expect(() => Encoding.fromRfc3339("2002:10-02T11:12:13Z")).toThrow();
      expect(() => Encoding.fromRfc3339("2002-10:02T11:12:13Z")).toThrow();

      // wrong time separators
      expect(() => Encoding.fromRfc3339("2002-10-02T11-12:13Z")).toThrow();
      expect(() => Encoding.fromRfc3339("2002-10-02T11:12-13Z")).toThrow();

      // wrong separator
      expect(() => Encoding.fromRfc3339("2002-10-02TT11:12:13Z")).toThrow();
      expect(() => Encoding.fromRfc3339("2002-10-02 T11:12:13Z")).toThrow();
      expect(() => Encoding.fromRfc3339("2002-10-02T 11:12:13Z")).toThrow();
      expect(() => Encoding.fromRfc3339("2002-10-02t11:12:13Z")).toThrow();
      expect(() => Encoding.fromRfc3339("2002-10-02x11:12:13Z")).toThrow();
      expect(() => Encoding.fromRfc3339("2002-10-02311:12:13Z")).toThrow();
      expect(() => Encoding.fromRfc3339("2002-10-02.11:12:13Z")).toThrow();

      // wrong time zone
      expect(() => Encoding.fromRfc3339("2002-10-02T11:12:13")).toThrow();
      expect(() => Encoding.fromRfc3339("2002-10-02T11:12:13z")).toThrow();
      expect(() => Encoding.fromRfc3339("2002-10-02T11:12:13 00:00")).toThrow();
      expect(() => Encoding.fromRfc3339("2002-10-02T11:12:13+0000")).toThrow();

      // wrong fractional seconds
      expect(() => Encoding.fromRfc3339("2018-07-30T19:21:12345Z")).toThrow();
      expect(() => Encoding.fromRfc3339("2018-07-30T19:21:12.Z")).toThrow();
    });

    it("encodes dates", () => {
      expect(Encoding.toRfc3339(new Date(Date.UTC(0, 0, 1, 0, 0, 0)))).toEqual("1900-01-01T00:00:00.000Z");
      expect(Encoding.toRfc3339(new Date(Date.UTC(2002, 9, 2, 11, 12, 13, 456)))).toEqual(
        "2002-10-02T11:12:13.456Z",
      );
    });
  });
});
