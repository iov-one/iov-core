import { Slip10RawIndex } from "@iov/crypto";

import { HdPaths } from "./hdpaths";

describe("HdPaths", () => {
  it("has working simple address implementation", () => {
    expect(HdPaths.simpleAddress(0)).toEqual([Slip10RawIndex.hardened(4804438), Slip10RawIndex.hardened(0)]);
    expect(HdPaths.simpleAddress(1)).toEqual([Slip10RawIndex.hardened(4804438), Slip10RawIndex.hardened(1)]);
    expect(HdPaths.simpleAddress(2)).toEqual([Slip10RawIndex.hardened(4804438), Slip10RawIndex.hardened(2)]);
  });

  it("has working bip44 implementation", () => {
    // m/44'/1'/2'/3/4
    expect(HdPaths.bip44(1, 2, 3, 4)).toEqual([
      Slip10RawIndex.hardened(44),
      Slip10RawIndex.hardened(1),
      Slip10RawIndex.hardened(2),
      Slip10RawIndex.normal(3),
      Slip10RawIndex.normal(4),
    ]);
  });
});
