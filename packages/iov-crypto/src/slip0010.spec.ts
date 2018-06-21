import BN = require("bn.js");

import { Encoding } from "./encoding";
import { Slip0010, Slip0010Curve } from "./slip0010";

const fromHex = Encoding.fromHex;

describe("Slip0010", () => {
  describe("Test vector 1 for ed25519", () => {
    // https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-1-for-ed25519
    const seed = fromHex("000102030405060708090a0b0c0d0e0f");

    it("can derive path /", () => {
      const path: ReadonlyArray<BN> = [];
      const derived = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, path);
      expect(derived.chainCode).toEqual(fromHex("90046a93de5380a72b5e45010748567d5ea02bbf6522f979e05c0d8d8ca9fffb"));
      expect(derived.privkey).toEqual(fromHex("2b4be7f19ee27bbf30c667b642d5f4aa69fd169872f8fc3059c08ebae2eb19e7"));
    });

    it("can derive path /0_H", () => {
      const path: ReadonlyArray<BN> = [Slip0010.hardenedIndex(0)];
      const derived = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, path);
      expect(derived.chainCode).toEqual(fromHex("8b59aa11380b624e81507a27fedda59fea6d0b779a778918a2fd3590e16e9c69"));
      expect(derived.privkey).toEqual(fromHex("68e0fe46dfb67e368c75379acec591dad19df3cde26e63b93a8e704f1dade7a3"));
    });

    it("can derive path /0_H/1_H", () => {
      const path: ReadonlyArray<BN> = [Slip0010.hardenedIndex(0), Slip0010.hardenedIndex(1)];
      const derived = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, path);
      expect(derived.chainCode).toEqual(fromHex("a320425f77d1b5c2505a6b1b27382b37368ee640e3557c315416801243552f14"));
      expect(derived.privkey).toEqual(fromHex("b1d0bad404bf35da785a64ca1ac54b2617211d2777696fbffaf208f746ae84f2"));
    });

    it("can derive path /0_H/1_H/2_H", () => {
      const path: ReadonlyArray<BN> = [Slip0010.hardenedIndex(0), Slip0010.hardenedIndex(1), Slip0010.hardenedIndex(2)];
      const derived = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, path);
      expect(derived.chainCode).toEqual(fromHex("2e69929e00b5ab250f49c3fb1c12f252de4fed2c1db88387094a0f8c4c9ccd6c"));
      expect(derived.privkey).toEqual(fromHex("92a5b23c0b8a99e37d07df3fb9966917f5d06e02ddbd909c7e184371463e9fc9"));
    });

    it("can derive path /0_H/1_H/2_H/2_H", () => {
      const path: ReadonlyArray<BN> = [Slip0010.hardenedIndex(0), Slip0010.hardenedIndex(1), Slip0010.hardenedIndex(2), Slip0010.hardenedIndex(2)];
      const derived = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, path);
      expect(derived.chainCode).toEqual(fromHex("8f6d87f93d750e0efccda017d662a1b31a266e4a6f5993b15f5c1f07f74dd5cc"));
      expect(derived.privkey).toEqual(fromHex("30d1dc7e5fc04c31219ab25a27ae00b50f6fd66622f6e9c913253d6511d1e662"));
    });

    it("can derive path /0_H/1_H/2_H/2_H/1000000000_H", () => {
      const path: ReadonlyArray<BN> = [Slip0010.hardenedIndex(0), Slip0010.hardenedIndex(1), Slip0010.hardenedIndex(2), Slip0010.hardenedIndex(2), Slip0010.hardenedIndex(1000000000)];
      const derived = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, path);
      expect(derived.chainCode).toEqual(fromHex("68789923a0cac2cd5a29172a475fe9e0fb14cd6adb5ad98a3fa70333e7afa230"));
      expect(derived.privkey).toEqual(fromHex("8f94d394a8e8fd6b1bc2f3f49f5c47e385281d5c17e65324b0f62483e37e8793"));
    });
  });
});
