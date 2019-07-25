import { Slip10RawIndex } from "@iov/crypto";

import { HdPaths } from "./hdpaths";

describe("HdPaths", () => {
  it("has working simple address implementation", () => {
    // tslint:disable-next-line: deprecation
    expect(HdPaths.simpleAddress(0)).toEqual([Slip10RawIndex.hardened(4804438), Slip10RawIndex.hardened(0)]);
    // tslint:disable-next-line: deprecation
    expect(HdPaths.simpleAddress(1)).toEqual([Slip10RawIndex.hardened(4804438), Slip10RawIndex.hardened(1)]);
    // tslint:disable-next-line: deprecation
    expect(HdPaths.simpleAddress(2)).toEqual([Slip10RawIndex.hardened(4804438), Slip10RawIndex.hardened(2)]);
  });

  it("has working bip43 implementation", () => {
    // m/1229936198'/33'/22'
    expect(HdPaths.bip43(1229936198, 33, 22)).toEqual([
      Slip10RawIndex.hardened(1229936198),
      Slip10RawIndex.hardened(33),
      Slip10RawIndex.hardened(22),
    ]);

    // m/5'/6'/7'/8'/9'/10'/11'
    expect(HdPaths.bip43(5, 6, 7, 8, 9, 10, 11)).toEqual([
      Slip10RawIndex.hardened(5),
      Slip10RawIndex.hardened(6),
      Slip10RawIndex.hardened(7),
      Slip10RawIndex.hardened(8),
      Slip10RawIndex.hardened(9),
      Slip10RawIndex.hardened(10),
      Slip10RawIndex.hardened(11),
    ]);
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

  it("has working bip44Like implementation", () => {
    // m/44'/33'/22'
    expect(HdPaths.bip44Like(33, 22)).toEqual([
      Slip10RawIndex.hardened(44),
      Slip10RawIndex.hardened(33),
      Slip10RawIndex.hardened(22),
    ]);
  });

  it("has working iov implementation", () => {
    // m/44'/234'/0'
    expect(HdPaths.iov(0)).toEqual([
      Slip10RawIndex.hardened(44),
      Slip10RawIndex.hardened(234),
      Slip10RawIndex.hardened(0),
    ]);
    // m/44'/234'/1'
    expect(HdPaths.iov(1)).toEqual([
      Slip10RawIndex.hardened(44),
      Slip10RawIndex.hardened(234),
      Slip10RawIndex.hardened(1),
    ]);
  });

  it("has working iovFaucet implementation", () => {
    // m/1229936198'/1'/0'/0'
    expect(HdPaths.iovFaucet()).toEqual([
      Slip10RawIndex.hardened(1229936198),
      Slip10RawIndex.hardened(1),
      Slip10RawIndex.hardened(0),
      Slip10RawIndex.hardened(0),
    ]);
  });

  it("has working Ethereum implementation", () => {
    // m/44'/60'/0'/0/0
    expect(HdPaths.ethereum(0)).toEqual([
      Slip10RawIndex.hardened(44),
      Slip10RawIndex.hardened(60),
      Slip10RawIndex.hardened(0),
      Slip10RawIndex.normal(0),
      Slip10RawIndex.normal(0),
    ]);
    // m/44'/60'/0'/0/123
    expect(HdPaths.ethereum(123)).toEqual([
      Slip10RawIndex.hardened(44),
      Slip10RawIndex.hardened(60),
      Slip10RawIndex.hardened(0),
      Slip10RawIndex.normal(0),
      Slip10RawIndex.normal(123),
    ]);
  });
});
