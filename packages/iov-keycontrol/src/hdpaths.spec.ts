import { Slip10RawIndex } from "@iov/crypto";

import { HdPaths } from "./hdpaths";

describe("HdPaths", () => {
  describe("bip44", () => {
    it("works", () => {
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

  describe("bip44Like", () => {
    it("works", () => {
      // m/44'/33'/22'
      expect(HdPaths.bip44Like(33, 22)).toEqual([
        Slip10RawIndex.hardened(44),
        Slip10RawIndex.hardened(33),
        Slip10RawIndex.hardened(22),
      ]);
    });
  });

  describe("iov", () => {
    it("works", () => {
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
  });

  describe("iovSecondGen", () => {
    it("works", () => {
      // m/44'/234'/0'/0/0
      expect(HdPaths.iovSecondGen(0)).toEqual([
        Slip10RawIndex.hardened(44),
        Slip10RawIndex.hardened(234),
        Slip10RawIndex.hardened(0),
        Slip10RawIndex.normal(0),
        Slip10RawIndex.normal(0),
      ]);
      // m/44'/234'/0'/0/123
      expect(HdPaths.iovSecondGen(123)).toEqual([
        Slip10RawIndex.hardened(44),
        Slip10RawIndex.hardened(234),
        Slip10RawIndex.hardened(0),
        Slip10RawIndex.normal(0),
        Slip10RawIndex.normal(123),
      ]);
    });
  });

  describe("iovFaucet", () => {
    it("returns token holder account for instance 0 when called with no arguments", () => {
      // m/1229936198'/1'/0'/0'
      // tslint:disable-next-line: deprecation
      expect(HdPaths.iovFaucet()).toEqual([
        Slip10RawIndex.hardened(1229936198),
        Slip10RawIndex.hardened(1),
        Slip10RawIndex.hardened(0),
        Slip10RawIndex.hardened(0),
      ]);
    });

    it("allows setting custom coin type, instance index and account index", () => {
      // m/1229936198'/33'/44'/55'
      // tslint:disable-next-line: deprecation
      expect(HdPaths.iovFaucet(33, 44, 55)).toEqual([
        Slip10RawIndex.hardened(1229936198),
        Slip10RawIndex.hardened(33),
        Slip10RawIndex.hardened(44),
        Slip10RawIndex.hardened(55),
      ]);
    });
  });

  describe("ethereum", () => {
    it("works", () => {
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

  describe("cosmosHub", () => {
    it("works", () => {
      // m/44'/118'/0'/0/0
      expect(HdPaths.cosmosHub(0)).toEqual([
        Slip10RawIndex.hardened(44),
        Slip10RawIndex.hardened(118),
        Slip10RawIndex.hardened(0),
        Slip10RawIndex.normal(0),
        Slip10RawIndex.normal(0),
      ]);
      // m/44'/118'/0'/0/123
      expect(HdPaths.cosmosHub(123)).toEqual([
        Slip10RawIndex.hardened(44),
        Slip10RawIndex.hardened(118),
        Slip10RawIndex.hardened(0),
        Slip10RawIndex.normal(0),
        Slip10RawIndex.normal(123),
      ]);
    });
  });
});
