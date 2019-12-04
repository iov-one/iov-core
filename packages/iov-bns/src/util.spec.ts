import { Address, Algorithm, ChainId, PubkeyBundle, PubkeyBytes, TransactionId } from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import * as testdata from "./testdata.spec";
import {
  addressPrefix,
  arraysEqual,
  buildQueryString,
  decodeBnsAddress,
  encodeBnsAddress,
  identityToAddress,
  isHashIdentifier,
  isValidAddress,
  pubkeyToAddress,
} from "./util";

const { fromHex, toAscii, toHex, toUtf8 } = Encoding;

describe("Util", () => {
  describe("addressPrefix", () => {
    it("works for testnet", () => {
      expect(addressPrefix("iov-lovenet" as ChainId)).toEqual("tiov");
    });

    it("works for mainnet", () => {
      expect(addressPrefix("iov-mainnet" as ChainId)).toEqual("iov");
    });
  });

  describe("decodeBnsAddress", () => {
    it("works for simple testnet address", () => {
      // bech32 -e -h tiov aabbaabbaabbccddccddbb3344559900ffffdd22
      expect(decodeBnsAddress("tiov142a64wa2h0xdmnxahve5g4veqrlllhfzwgknfd" as Address)).toEqual({
        prefix: "tiov",
        data: fromHex("aabbaabbaabbccddccddbb3344559900ffffdd22"),
      });
    });

    it("works for simple mainnet address", () => {
      // bech32 -e -h iov aabbaabbaabbccddccddbb3344559900ffffdd22
      expect(decodeBnsAddress("iov142a64wa2h0xdmnxahve5g4veqrlllhfzqalhfu" as Address)).toEqual({
        prefix: "iov",
        data: fromHex("aabbaabbaabbccddccddbb3344559900ffffdd22"),
      });
    });

    it("throws for invalid prefix", () => {
      // bech32 -e -h oiv aabbaabbaabbccddccddbb3344559900ffffdd22
      expect(() => decodeBnsAddress("oiv142a64wa2h0xdmnxahve5g4veqrlllhfz6q2fp9" as Address)).toThrowError(
        /Invalid bech32 prefix. Must be iov or tiov./,
      );
    });

    it("throws for invalid data lengths", () => {
      // bech32 -e -h iov aabbaabbaabbccddccddbb3344559900ffffdd
      expect(() => decodeBnsAddress("iov142a64wa2h0xdmnxahve5g4veqrlllhghgawxy" as Address)).toThrowError(
        /Invalid data length. Expected 20 bytes./,
      );
      // bech32 -e -h iov aabbaabbaabbccddccddbb3344559900ffffdd2233
      expect(() => decodeBnsAddress("iov142a64wa2h0xdmnxahve5g4veqrlllhfzxvuu77m5" as Address)).toThrowError(
        /Invalid data length. Expected 20 bytes./,
      );
    });
  });

  describe("pubkeyToAddress", () => {
    it("is compatible to weave test data", () => {
      const address = pubkeyToAddress(testdata.pubJson, "tiov");
      expect(address).toEqual(testdata.address);
    });

    it("throws when pubkey is not Ed25519", () => {
      const secpPubkey: PubkeyBundle = {
        algo: Algorithm.Secp256k1,
        data: fromHex(
          "044bc2a31265153f07e70e0bab08724e6b85e217f8cd628ceb62974247bb493382ce28cab79ad7119ee1ad3ebcdb98a16805211530ecc6cfefa1b88e6dff99232a",
        ) as PubkeyBytes,
      };
      expect(() => pubkeyToAddress(secpPubkey, "tiov")).toThrowError(/Public key must be Ed25519/i);
    });
  });

  it("has working identityToAddress", () => {
    const address = identityToAddress({ chainId: "testnet123" as ChainId, pubkey: testdata.pubJson });
    expect(address).toEqual(testdata.address);
  });

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
    // bad
    {
      const identifier = isHashIdentifier(fromHex("1234567890abcdef1234567890abcdef"));
      expect(identifier).toEqual(false);
    }
    // good
    {
      const identifier = isHashIdentifier(toUtf8("hash/sha256/@öülä*`5%%&"));
      expect(identifier).toEqual(true);
    }
    // good – but should that one really be good?
    {
      const identifier = isHashIdentifier(toAscii("hash/sha256/"));
      expect(identifier).toEqual(true);
    }
  });

  it("has working encodeBnsAddress", () => {
    // raw data generated using https://github.com/nym-zone/bech32
    // bech32 -e -h tiov f6cade229408c93a2a8d181d62efce46ff60d210
    const raw = fromHex("f6cade229408c93a2a8d181d62efce46ff60d210");
    expect(encodeBnsAddress("tiov", raw)).toEqual("tiov17m9dug55pryn525drqwk9m7wgmlkp5ss4j2mky");
  });

  it("isValidAddress checks valid addresses", () => {
    const good = "tiov17m9dug55pryn525drqwk9m7wgmlkp5ss4j2mky";
    const good2 = encodeBnsAddress("tiov", fromHex("1234567890abcdef1234567890abcdef12345678"));
    const bad = "ti17m9dug55pryn525drqwk9m7wgmlkp5ss4j2m1"; // bad size
    const bad2 = "tiov17m9dug55pryn525drqwk9m7wgmlkp5ss4j2m12"; // bad checksum
    const bad3 = "btc17m9dug55pryn525drqwk9m7wgmlkp5ss4j2mky"; // bad prefix

    expect(isValidAddress(good)).toEqual(true);
    expect(isValidAddress(good2)).toEqual(true);
    expect(isValidAddress(bad)).toEqual(false);
    expect(isValidAddress(bad2)).toEqual(false);
    expect(isValidAddress(bad3)).toEqual(false);
  });

  describe("buildQueryString", () => {
    it("handles empty query", () => {
      const query = buildQueryString({});
      expect(query).toEqual("");
    });

    it("handles sentFromOrTo", () => {
      const query = buildQueryString({
        sentFromOrTo: "tiov142a64wa2hw4th24m42a64wa2hw4th24m593zc3" as Address,
      });
      const expected = `${toHex(toAscii("cash:")).toUpperCase()}AABBAABBAABBAABBAABBAABBAABBAABBAABBAABB='s'`;
      expect(query).toEqual(expected);
    });

    it("handles signedBy", () => {
      const query = buildQueryString({ signedBy: "tiov142a64wa2hw4th24m42a64wa2hw4th24m593zc3" as Address });
      const expected = `${toHex(toAscii("sigs:")).toUpperCase()}AABBAABBAABBAABBAABBAABBAABBAABBAABBAABB='s'`;
      expect(query).toEqual(expected);
    });

    it("handles empty tag list", () => {
      const query = buildQueryString({ tags: [] });
      expect(query).toEqual("");
    });

    it("handles one tags", () => {
      const query = buildQueryString({ tags: [{ key: "abc", value: "def" }] });
      expect(query).toEqual("abc='def'");
    });

    it("handles two tags", () => {
      const query = buildQueryString({
        tags: [
          { key: "k", value: "9" },
          { key: "L", value: "7" },
        ],
      });
      expect(query).toEqual("k='9' AND L='7'");
    });

    it("handles height", () => {
      const query = buildQueryString({ height: 17 });
      expect(query).toEqual("tx.height=17");
    });

    it("handles min and max height", () => {
      const query = buildQueryString({ minHeight: 21, maxHeight: 111 });
      expect(query).toEqual("tx.height>21 AND tx.height<111");
    });

    it("handles height with tags", () => {
      const query = buildQueryString({ minHeight: 77, tags: [{ key: "some", value: "info" }] });
      expect(query).toEqual("some='info' AND tx.height>77");
    });

    it("handles id", () => {
      const query = buildQueryString({ id: "AABB33" as TransactionId });
      expect(query).toEqual("tx.hash='AABB33'");
    });
  });
});
