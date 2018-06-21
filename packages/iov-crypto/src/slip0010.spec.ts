import BN = require("bn.js");

import { Encoding } from "./encoding";
import { Slip0010, Slip0010Curve } from "./slip0010";

const fromHex = Encoding.fromHex;

describe("Slip0010", () => {
  describe("Test vector 1 for secp256k1", () => {
    // https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-1-for-secp256k1
    const seed = fromHex("000102030405060708090a0b0c0d0e0f");

    it("can derive path /", () => {
      const path: ReadonlyArray<BN> = [];
      const derived = Slip0010.derivePath(Slip0010Curve.Secp256k1, seed, path);
      expect(derived.chainCode).toEqual(fromHex("873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d508"));
      expect(derived.privkey).toEqual(fromHex("e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35"));
    });

    it("can derive path /0_H", () => {
      const path: ReadonlyArray<BN> = [Slip0010.hardenedIndex(0)];
      const derived = Slip0010.derivePath(Slip0010Curve.Secp256k1, seed, path);
      expect(derived.chainCode).toEqual(fromHex("47fdacbd0f1097043b78c63c20c34ef4ed9a111d980047ad16282c7ae6236141"));
      expect(derived.privkey).toEqual(fromHex("edb2e14f9ee77d26dd93b4ecede8d16ed408ce149b6cd80b0715a2d911a0afea"));
    });

    // Normal indices are not yet implemented because they require some non-trivial
    // elliptic curve operations
    //
    // it("can derive path /0_H/1", () => {
    //   const path: ReadonlyArray<BN> = [Slip0010.hardenedIndex(0), Slip0010.normalIndex(1)];
    //   const derived = Slip0010.derivePath(Slip0010Curve.Secp256k1, seed, path);
    //   expect(derived.chainCode).toEqual(fromHex("2a7857631386ba23dacac34180dd1983734e444fdbf774041578e9b6adb37c19"));
    //   expect(derived.privkey).toEqual(fromHex("3c6cb8d0f6a264c91ea8b5030fadaa8e538b020f0a387421a12de9319dc93368"));
    // });
  });

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

  describe("Test vector 2 for ed25519", () => {
    // https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-2-for-ed25519
    const seed = fromHex("fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542");

    it("can derive path /", () => {
      const path: ReadonlyArray<BN> = [];
      const derived = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, path);
      expect(derived.chainCode).toEqual(fromHex("ef70a74db9c3a5af931b5fe73ed8e1a53464133654fd55e7a66f8570b8e33c3b"));
      expect(derived.privkey).toEqual(fromHex("171cb88b1b3c1db25add599712e36245d75bc65a1a5c9e18d76f9f2b1eab4012"));
    });

    it("can derive path /0_H", () => {
      const path: ReadonlyArray<BN> = [Slip0010.hardenedIndex(0)];
      const derived = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, path);
      expect(derived.chainCode).toEqual(fromHex("0b78a3226f915c082bf118f83618a618ab6dec793752624cbeb622acb562862d"));
      expect(derived.privkey).toEqual(fromHex("1559eb2bbec5790b0c65d8693e4d0875b1747f4970ae8b650486ed7470845635"));
    });

    it("can derive path /0_H/2147483647_H", () => {
      const path: ReadonlyArray<BN> = [Slip0010.hardenedIndex(0), Slip0010.hardenedIndex(2147483647)];
      const derived = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, path);
      expect(derived.chainCode).toEqual(fromHex("138f0b2551bcafeca6ff2aa88ba8ed0ed8de070841f0c4ef0165df8181eaad7f"));
      expect(derived.privkey).toEqual(fromHex("ea4f5bfe8694d8bb74b7b59404632fd5968b774ed545e810de9c32a4fb4192f4"));
    });

    it("can derive path /0_H/2147483647_H/1_H", () => {
      const path: ReadonlyArray<BN> = [Slip0010.hardenedIndex(0), Slip0010.hardenedIndex(2147483647), Slip0010.hardenedIndex(1)];
      const derived = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, path);
      expect(derived.chainCode).toEqual(fromHex("73bd9fff1cfbde33a1b846c27085f711c0fe2d66fd32e139d3ebc28e5a4a6b90"));
      expect(derived.privkey).toEqual(fromHex("3757c7577170179c7868353ada796c839135b3d30554bbb74a4b1e4a5a58505c"));
    });

    it("can derive path /0_H/2147483647_H/1_H/2147483646_H", () => {
      const path: ReadonlyArray<BN> = [Slip0010.hardenedIndex(0), Slip0010.hardenedIndex(2147483647), Slip0010.hardenedIndex(1), Slip0010.hardenedIndex(2147483646)];
      const derived = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, path);
      expect(derived.chainCode).toEqual(fromHex("0902fe8a29f9140480a00ef244bd183e8a13288e4412d8389d140aac1794825a"));
      expect(derived.privkey).toEqual(fromHex("5837736c89570de861ebc173b1086da4f505d4adb387c6a1b1342d5e4ac9ec72"));
    });

    it("can derive path /0_H/2147483647_H/1_H/2147483646_H/2_H", () => {
      const path: ReadonlyArray<BN> = [Slip0010.hardenedIndex(0), Slip0010.hardenedIndex(2147483647), Slip0010.hardenedIndex(1), Slip0010.hardenedIndex(2147483646), Slip0010.hardenedIndex(2)];
      const derived = Slip0010.derivePath(Slip0010Curve.Ed25519, seed, path);
      expect(derived.chainCode).toEqual(fromHex("5d70af781f3a37b829f0d060924d5e960bdc02e85423494afc0b1a41bbe196d4"));
      expect(derived.privkey).toEqual(fromHex("551d333177df541ad876a60ea71f00447931c0a9da16f227c11ea080d7391b8d"));
    });
  });
});
