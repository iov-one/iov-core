import { Address } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

import { hashCode } from "./testdata";
import { arraysEqual, decodeBnsAddress, encodeBnsAddress, isHashIdentifier } from "./util";

const { fromHex } = Encoding;

describe("Verify util functions", () => {
  it("verify array comparison", () => {
    const a = fromHex("12345678");
    const b = fromHex("000012345678");
    const same = arraysEqual(a, b.slice(2));
    expect(same).toEqual(true);

    const different = arraysEqual(a, a.slice(0, 2));
    expect(different).toEqual(false);
    const diff2 = arraysEqual(a.slice(0, 2), a);
    expect(diff2).toEqual(false);
    const diff3 = arraysEqual(a, fromHex("12335678"));
    expect(diff3).toEqual(false);
  });

  it("arraysEqual works", () => {
    // simple equality
    expect(arraysEqual(new Uint8Array([]), new Uint8Array([]))).toEqual(true);
    expect(arraysEqual(new Uint8Array([0x11]), new Uint8Array([0x11]))).toEqual(true);
    expect(arraysEqual(new Uint8Array([0xaa, 0x77, 0x99]), new Uint8Array([0xaa, 0x77, 0x99]))).toEqual(true);

    // identity
    const array1 = new Uint8Array([]);
    const array2 = new Uint8Array([0x11]);
    const array3 = new Uint8Array([0xaa, 0x77, 0x99]);
    const array3a = new Uint8Array([0xaa, 0x77, 0x99]);
    expect(arraysEqual(array1, array1)).toEqual(true);
    expect(arraysEqual(array2, array2)).toEqual(true);
    expect(arraysEqual(array3, array3)).toEqual(true);
    expect(arraysEqual(array3, array3a)).toEqual(true);

    // unequal length
    expect(arraysEqual(new Uint8Array([]), new Uint8Array([0x11]))).toEqual(false);
    expect(arraysEqual(new Uint8Array([0xaa, 0xbb]), new Uint8Array([0xaa]))).toEqual(false);
    expect(arraysEqual(new Uint8Array([0xaa]), new Uint8Array([0xaa, 0xbb]))).toEqual(false);

    // unequal data (front, middle, end)
    expect(arraysEqual(new Uint8Array([0xaa, 0xbb, 0xcc]), new Uint8Array([0x00, 0xbb, 0xcc]))).toEqual(
      false,
    );
    expect(arraysEqual(new Uint8Array([0xaa, 0xbb, 0xcc]), new Uint8Array([0xaa, 0x00, 0xcc]))).toEqual(
      false,
    );
    expect(arraysEqual(new Uint8Array([0xaa, 0xbb, 0xcc]), new Uint8Array([0xaa, 0xbb, 0x00]))).toEqual(
      false,
    );
  });

  it("verify hash checks out", () => {
    const a = fromHex("1234567890abcdef1234567890abcdef");
    const badHash = isHashIdentifier(a);
    expect(badHash).toEqual(false);
    const goodHash = isHashIdentifier(hashCode);
    expect(goodHash).toEqual(true);
  });

  it("has working encodeBnsAddress", () => {
    // raw data generated using https://github.com/nym-zone/bech32
    // bech32 -e -h tiov f6cade229408c93a2a8d181d62efce46ff60d210
    const raw = fromHex("f6cade229408c93a2a8d181d62efce46ff60d210");
    expect(encodeBnsAddress(raw)).toEqual("tiov17m9dug55pryn525drqwk9m7wgmlkp5ss4j2mky");
  });

  it("has working decodeBnsAddress", () => {
    const address = "tiov17m9dug55pryn525drqwk9m7wgmlkp5ss4j2mky" as Address;
    expect(decodeBnsAddress(address)).toEqual({
      prefix: "tiov",
      data: fromHex("f6cade229408c93a2a8d181d62efce46ff60d210"),
    });
  });
});
