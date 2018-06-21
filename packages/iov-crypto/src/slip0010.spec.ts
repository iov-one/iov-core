import BN = require("bn.js");

import { Encoding } from "./encoding";
import { Slip0010, Slip0010Curves } from "./slip0010";

const fromHex = Encoding.fromHex;

describe("Slip0010", () => {
  it("can derive ed25519 master key", () => {
    // https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-1-for-ed25519
    const seed = fromHex("000102030405060708090a0b0c0d0e0f");
    const result = Slip0010.master(Slip0010Curves.Ed25519, seed);
    expect(result.chainCode).toEqual(fromHex("90046a93de5380a72b5e45010748567d5ea02bbf6522f979e05c0d8d8ca9fffb"));
    expect(result.privkey).toEqual(fromHex("2b4be7f19ee27bbf30c667b642d5f4aa69fd169872f8fc3059c08ebae2eb19e7"));
  });

  it("can derive ed25519 child", () => {
    // https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-1-for-ed25519
    const seed = fromHex("000102030405060708090a0b0c0d0e0f");
    const master = Slip0010.master(Slip0010Curves.Ed25519, seed);

    const index = Slip0010.hardenedKeyIndex(0);
    const derived = Slip0010.childPrivkey(Slip0010Curves.Ed25519, master.privkey, master.chainCode, index);

    expect(derived.chainCode).toEqual(fromHex("8b59aa11380b624e81507a27fedda59fea6d0b779a778918a2fd3590e16e9c69"));
    expect(derived.privkey).toEqual(fromHex("68e0fe46dfb67e368c75379acec591dad19df3cde26e63b93a8e704f1dade7a3"));
  });

  it("can derive ed25519 path 0_H/1_H", () => {
    // https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-1-for-ed25519
    const seed = fromHex("000102030405060708090a0b0c0d0e0f");
    const path: ReadonlyArray<BN> = [Slip0010.hardenedKeyIndex(0), Slip0010.hardenedKeyIndex(1)];
    const derived = Slip0010.derivePath(Slip0010Curves.Ed25519, seed, path);
    expect(derived.chainCode).toEqual(fromHex("a320425f77d1b5c2505a6b1b27382b37368ee640e3557c315416801243552f14"));
    expect(derived.privkey).toEqual(fromHex("b1d0bad404bf35da785a64ca1ac54b2617211d2777696fbffaf208f746ae84f2"));
  });
});
