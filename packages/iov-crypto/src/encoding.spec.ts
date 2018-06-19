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
    expect(() => {
      Encoding.fromHex("a");
    }).toThrow();
    expect(() => {
      Encoding.fromHex("aaa");
    }).toThrow();
    expect(() => {
      Encoding.fromHex("a!");
    }).toThrow();
    expect(() => {
      Encoding.fromHex("a ");
    }).toThrow();
    expect(() => {
      Encoding.fromHex("aa ");
    }).toThrow();
    expect(() => {
      Encoding.fromHex(" aa");
    }).toThrow();
    expect(() => {
      Encoding.fromHex("a a");
    }).toThrow();
    expect(() => {
      Encoding.fromHex("gg");
    }).toThrow();
  });
});
