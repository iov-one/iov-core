import { Encoding } from "@iov/encoding";

import {
  Algorithm,
  ChainId,
  Identity,
  isBlockHeightTimeout,
  isIdentity,
  isPubkeyBundle,
  isTimestampTimeout,
  PubkeyBundle,
  PubkeyBytes,
} from "./transactions";

const { fromHex } = Encoding;

describe("transactions", () => {
  describe("isPubkeyBundle", () => {
    it("returns true for valid PubkeyBundle", () => {
      const good: PubkeyBundle = {
        algo: Algorithm.Ed25519,
        data: fromHex("aabbccdd") as PubkeyBytes,
      };
      expect(isPubkeyBundle(good)).toEqual(true);
    });

    it("returns true for PubkeyBundle as deserialized from json", () => {
      const good = {
        algo: "ed25519",
        data: fromHex("aabbccdd"),
      };
      expect(isPubkeyBundle(good)).toEqual(true);
    });

    it("returns false for a bunch of other stuff", () => {
      expect(isPubkeyBundle("abc")).toEqual(false);
      expect(isPubkeyBundle({})).toEqual(false);
      expect(isPubkeyBundle(null)).toEqual(false);
      expect(isPubkeyBundle(undefined)).toEqual(false);
      expect(isPubkeyBundle(fromHex("aabb"))).toEqual(false);
      // TODO: test with missing algo, data once we have TS3.5 omit type
    });
  });

  describe("isIdentity", () => {
    it("returns true for valid Identity", () => {
      const good: Identity = {
        chainId: "foobar" as ChainId,
        pubkey: {
          algo: Algorithm.Ed25519,
          data: fromHex("aabbccdd") as PubkeyBytes,
        },
      };
      expect(isIdentity(good)).toEqual(true);
    });

    it("returns true for Identity as deserialized from json", () => {
      const good = {
        chainId: "foobar",
        pubkey: {
          algo: "ed25519",
          data: fromHex("aabbccdd"),
        },
      };
      expect(isIdentity(good)).toEqual(true);
    });

    it("returns false for a bunch of other stuff", () => {
      expect(isIdentity("abc")).toEqual(false);
      expect(isIdentity({})).toEqual(false);
      expect(isIdentity(null)).toEqual(false);
      expect(isIdentity(undefined)).toEqual(false);
      expect(isIdentity(fromHex("aabb"))).toEqual(false);
      // TODO: test with missing chainId, pubkey once we have TS3.5 omit type
    });
  });

  describe("isBlockHeightTimeout", () => {
    it("returns true for block height timeouts", () => {
      expect(isBlockHeightTimeout({ height: 1 })).toEqual(true);
      expect(isBlockHeightTimeout({ height: Number.MAX_SAFE_INTEGER })).toEqual(true);
    });

    it("returns false other timeouts", () => {
      expect(isBlockHeightTimeout({ timestamp: 1 })).toEqual(false);
      expect(isBlockHeightTimeout({ timestamp: Number.MAX_SAFE_INTEGER })).toEqual(false);
    });
  });

  describe("isTimestampTimeout", () => {
    it("returns true for timestamp timeouts", () => {
      expect(isTimestampTimeout({ timestamp: 1 })).toEqual(true);
      expect(isTimestampTimeout({ timestamp: Number.MAX_SAFE_INTEGER })).toEqual(true);
    });

    it("returns false other timeouts", () => {
      expect(isTimestampTimeout({ height: 1 })).toEqual(false);
      expect(isTimestampTimeout({ height: Number.MAX_SAFE_INTEGER })).toEqual(false);
    });
  });
});
