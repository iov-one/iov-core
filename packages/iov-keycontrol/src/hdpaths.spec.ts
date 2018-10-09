import { Slip10RawIndex } from "@iov/crypto";

import { HdPaths } from "./hdpaths";

describe("HdPaths", () => {
  it("has working simple address implementation", () => {
    expect(HdPaths.simpleAddress(0)).toEqual([Slip10RawIndex.hardened(4804438), Slip10RawIndex.hardened(0)]);
    expect(HdPaths.simpleAddress(1)).toEqual([Slip10RawIndex.hardened(4804438), Slip10RawIndex.hardened(1)]);
    expect(HdPaths.simpleAddress(2)).toEqual([Slip10RawIndex.hardened(4804438), Slip10RawIndex.hardened(2)]);
  });
});
