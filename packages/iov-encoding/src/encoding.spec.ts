import { Encoding } from "./encoding";

describe("Encoding", () => {
  it("encodes to hex", () => {
    expect(Encoding.toHex(new Uint8Array([]))).toEqual("");
    expect(Encoding.toHex(new Uint8Array([0x00]))).toEqual("00");
    expect(Encoding.toHex(new Uint8Array([0x01]))).toEqual("01");
    expect(Encoding.toHex(new Uint8Array([0x10]))).toEqual("10");
    expect(Encoding.toHex(new Uint8Array([0x11]))).toEqual("11");
    expect(Encoding.toHex(new Uint8Array([0x11, 0x22, 0x33]))).toEqual("112233");
    expect(Encoding.toHex(new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]))).toEqual("0123456789abcdef");
  });

  it("decodes from hex", () => {
    // simple
    expect(Encoding.fromHex("")).toEqual(new Uint8Array([]));
    expect(Encoding.fromHex("00")).toEqual(new Uint8Array([0x00]));
    expect(Encoding.fromHex("01")).toEqual(new Uint8Array([0x01]));
    expect(Encoding.fromHex("10")).toEqual(new Uint8Array([0x10]));
    expect(Encoding.fromHex("11")).toEqual(new Uint8Array([0x11]));
    expect(Encoding.fromHex("112233")).toEqual(new Uint8Array([0x11, 0x22, 0x33]));
    expect(Encoding.fromHex("0123456789abcdef")).toEqual(new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]));

    // capital letters
    expect(Encoding.fromHex("AA")).toEqual(new Uint8Array([0xaa]));
    expect(Encoding.fromHex("aAbBcCdDeEfF")).toEqual(new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff]));

    // error
    expect(() => Encoding.fromHex("a")).toThrow();
    expect(() => Encoding.fromHex("aaa")).toThrow();
    expect(() => Encoding.fromHex("a!")).toThrow();
    expect(() => Encoding.fromHex("a ")).toThrow();
    expect(() => Encoding.fromHex("aa ")).toThrow();
    expect(() => Encoding.fromHex(" aa")).toThrow();
    expect(() => Encoding.fromHex("a a")).toThrow();
    expect(() => Encoding.fromHex("gg")).toThrow();
  });

  it("encodes to base64", () => {
    expect(Encoding.toBase64(new Uint8Array([]))).toEqual("");
    expect(Encoding.toBase64(new Uint8Array([0x00]))).toEqual("AA==");
    expect(Encoding.toBase64(new Uint8Array([0x00, 0x00]))).toEqual("AAA=");
    expect(Encoding.toBase64(new Uint8Array([0x00, 0x00, 0x00]))).toEqual("AAAA");
    expect(Encoding.toBase64(new Uint8Array([0x00, 0x00, 0x00, 0x00]))).toEqual("AAAAAA==");
    expect(Encoding.toBase64(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00]))).toEqual("AAAAAAA=");
    expect(Encoding.toBase64(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))).toEqual("AAAAAAAA");
    expect(Encoding.toBase64(new Uint8Array([0x61]))).toEqual("YQ==");
    expect(Encoding.toBase64(new Uint8Array([0x62]))).toEqual("Yg==");
    expect(Encoding.toBase64(new Uint8Array([0x63]))).toEqual("Yw==");
    expect(Encoding.toBase64(new Uint8Array([0x61, 0x62, 0x63]))).toEqual("YWJj");
  });

  it("decodes from base64", () => {
    expect(Encoding.fromBase64("")).toEqual(new Uint8Array([]));
    expect(Encoding.fromBase64("AA==")).toEqual(new Uint8Array([0x00]));
    expect(Encoding.fromBase64("AAA=")).toEqual(new Uint8Array([0x00, 0x00]));
    expect(Encoding.fromBase64("AAAA")).toEqual(new Uint8Array([0x00, 0x00, 0x00]));
    expect(Encoding.fromBase64("AAAAAA==")).toEqual(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
    expect(Encoding.fromBase64("AAAAAAA=")).toEqual(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00]));
    expect(Encoding.fromBase64("AAAAAAAA")).toEqual(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
    expect(Encoding.fromBase64("YQ==")).toEqual(new Uint8Array([0x61]));
    expect(Encoding.fromBase64("Yg==")).toEqual(new Uint8Array([0x62]));
    expect(Encoding.fromBase64("Yw==")).toEqual(new Uint8Array([0x63]));
    expect(Encoding.fromBase64("YWJj")).toEqual(new Uint8Array([0x61, 0x62, 0x63]));

    // invalid length
    expect(() => Encoding.fromBase64("a")).toThrow();
    expect(() => Encoding.fromBase64("aa")).toThrow();
    expect(() => Encoding.fromBase64("aaa")).toThrow();

    // proper length including invalid character
    expect(() => Encoding.fromBase64("aaa!")).toThrow();
    expect(() => Encoding.fromBase64("aaa*")).toThrow();
    expect(() => Encoding.fromBase64("aaaä")).toThrow();

    // proper length plus invalid character
    expect(() => Encoding.fromBase64("aaaa!")).toThrow();
    expect(() => Encoding.fromBase64("aaaa*")).toThrow();
    expect(() => Encoding.fromBase64("aaaaä")).toThrow();

    // extra spaces
    expect(() => Encoding.fromBase64("aaaa ")).toThrow();
    expect(() => Encoding.fromBase64(" aaaa")).toThrow();
    expect(() => Encoding.fromBase64("aa aa")).toThrow();
    expect(() => Encoding.fromBase64("aaaa\n")).toThrow();
    expect(() => Encoding.fromBase64("\naaaa")).toThrow();
    expect(() => Encoding.fromBase64("aa\naa")).toThrow();

    // position of =
    expect(() => Encoding.fromBase64("=aaa")).toThrow();
    expect(() => Encoding.fromBase64("==aa")).toThrow();

    // concatenated base64 strings should not be supported
    // see https://github.com/beatgammit/base64-js/issues/42
    expect(() => Encoding.fromBase64("AAA=AAA=")).toThrow();

    // wrong number of =
    expect(() => Encoding.fromBase64("a===")).toThrow();
  });

  it("encodes to ascii", () => {
    expect(Encoding.toAscii("")).toEqual(new Uint8Array([]));
    expect(Encoding.toAscii("abc")).toEqual(new Uint8Array([0x61, 0x62, 0x63]));
    expect(Encoding.toAscii(" ?=-n|~+-*/\\")).toEqual(new Uint8Array([0x20, 0x3f, 0x3d, 0x2d, 0x6e, 0x7c, 0x7e, 0x2b, 0x2d, 0x2a, 0x2f, 0x5c]));

    expect(() => Encoding.toAscii("ö")).toThrow();
    expect(() => Encoding.toAscii("ß")).toThrow();
  });

  it("decodes from ascii", () => {
    expect(Encoding.fromAscii(new Uint8Array([]))).toEqual("");
    expect(Encoding.fromAscii(new Uint8Array([0x61, 0x62, 0x63]))).toEqual("abc");
    expect(Encoding.fromAscii(new Uint8Array([0x20, 0x3f, 0x3d, 0x2d, 0x6e, 0x7c, 0x7e, 0x2b, 0x2d, 0x2a, 0x2f, 0x5c]))).toEqual(" ?=-n|~+-*/\\");

    expect(() => Encoding.fromAscii(new Uint8Array([0x00]))).toThrow();
    expect(() => Encoding.fromAscii(new Uint8Array([0x7f]))).toThrow();
    expect(() => Encoding.fromAscii(new Uint8Array([0xff]))).toThrow();
  });
});
