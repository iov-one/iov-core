import { Encoding } from "@iov/crypto";

import { hashCode } from "./testdata";
import { arraysEqual, isHashIdentifier } from "./util";

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
});
