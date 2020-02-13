import { Encoding } from "@iov/encoding";

import {
  Algorithm,
  ChainId,
  FullSignature,
  Identity,
  isBlockHeightTimeout,
  isFullSignature,
  isIdentity,
  isPubkeyBundle,
  isSignedTransaction,
  isTimestampTimeout,
  Nonce,
  PubkeyBundle,
  PubkeyBytes,
  SignatureBytes,
  SignedTransaction,
  UnsignedTransaction,
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

    it("ignores additional fields", () => {
      const withOtherData: PubkeyBundle & { readonly other: number } = {
        algo: Algorithm.Ed25519,
        data: fromHex("aabbccdd") as PubkeyBytes,
        other: 123,
      };
      expect(isPubkeyBundle(withOtherData)).toEqual(true);
    });

    it("returns false for a bunch of other stuff", () => {
      expect(isPubkeyBundle("abc")).toEqual(false);
      expect(isPubkeyBundle({})).toEqual(false);
      expect(isPubkeyBundle(null)).toEqual(false);
      expect(isPubkeyBundle(undefined)).toEqual(false);
      expect(isPubkeyBundle(fromHex("aabb"))).toEqual(false);

      const missingAlgo: Omit<PubkeyBundle, "algo"> = {
        data: fromHex("aabbccdd") as PubkeyBytes,
      };
      expect(isPubkeyBundle(missingAlgo)).toEqual(false);

      const missingData: Omit<PubkeyBundle, "data"> = {
        algo: Algorithm.Ed25519,
      };
      expect(isPubkeyBundle(missingData)).toEqual(false);
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

    it("ignores additional fields", () => {
      const withOtherData: Identity & { readonly other: number } = {
        chainId: "foobar" as ChainId,
        pubkey: {
          algo: Algorithm.Ed25519,
          data: fromHex("aabbccdd") as PubkeyBytes,
        },
        other: 123,
      };
      expect(isIdentity(withOtherData)).toEqual(true);
    });

    it("returns false for a bunch of other stuff", () => {
      expect(isIdentity("abc")).toEqual(false);
      expect(isIdentity({})).toEqual(false);
      expect(isIdentity(null)).toEqual(false);
      expect(isIdentity(undefined)).toEqual(false);
      expect(isIdentity(fromHex("aabb"))).toEqual(false);

      const missingChainId: Omit<Identity, "chainId"> = {
        pubkey: {
          algo: Algorithm.Ed25519,
          data: fromHex("aabbccdd") as PubkeyBytes,
        },
      };
      expect(isIdentity(missingChainId)).toEqual(false);

      const missingPubkey: Omit<Identity, "pubkey"> = {
        chainId: "foobar" as ChainId,
      };
      expect(isIdentity(missingPubkey)).toEqual(false);
    });
  });

  describe("isFullSignature", () => {
    it("returns true for valid FullSignature", () => {
      const good: FullSignature = {
        nonce: 66 as Nonce,
        pubkey: {
          algo: Algorithm.Ed25519,
          data: fromHex("aabbccdd") as PubkeyBytes,
        },
        signature: fromHex("eeff0011") as SignatureBytes,
      };
      expect(isFullSignature(good)).toEqual(true);
    });

    it("returns true for FullSignature as deserialized from json", () => {
      const good = {
        nonce: 66,
        pubkey: {
          algo: Algorithm.Ed25519,
          data: fromHex("aabbccdd"),
        },
        signature: fromHex("eeff0011"),
      };
      expect(isFullSignature(good)).toEqual(true);
    });

    it("ignores additional fields", () => {
      const withOtherData: FullSignature & { readonly other: number } = {
        nonce: 66 as Nonce,
        pubkey: {
          algo: Algorithm.Ed25519,
          data: fromHex("aabbccdd") as PubkeyBytes,
        },
        signature: fromHex("eeff0011") as SignatureBytes,
        other: 123,
      };
      expect(isFullSignature(withOtherData)).toEqual(true);
    });

    it("returns false for a bunch of other stuff", () => {
      expect(isFullSignature("abc")).toEqual(false);
      expect(isFullSignature({})).toEqual(false);
      expect(isFullSignature(null)).toEqual(false);
      expect(isFullSignature(undefined)).toEqual(false);
      expect(isFullSignature(fromHex("aabb"))).toEqual(false);

      const missingNonce: Omit<FullSignature, "nonce"> = {
        pubkey: {
          algo: Algorithm.Ed25519,
          data: fromHex("aabbccdd") as PubkeyBytes,
        },
        signature: fromHex("eeff0011") as SignatureBytes,
      };
      expect(isFullSignature(missingNonce)).toEqual(false);

      const missingPubkey: Omit<FullSignature, "pubkey"> = {
        nonce: 66 as Nonce,
        signature: fromHex("eeff0011") as SignatureBytes,
      };
      expect(isFullSignature(missingPubkey)).toEqual(false);

      const missingSignature: Omit<FullSignature, "signature"> = {
        nonce: 66 as Nonce,
        pubkey: {
          algo: Algorithm.Ed25519,
          data: fromHex("aabbccdd") as PubkeyBytes,
        },
      };
      expect(isFullSignature(missingSignature)).toEqual(false);
    });
  });

  describe("isSignedTransaction", () => {
    const goodTransaction: UnsignedTransaction = {
      kind: "foo/bar",
      chainId: "local-blubb-devnet" as ChainId,
    };

    const goodSignature: FullSignature = {
      nonce: 66 as Nonce,
      pubkey: {
        algo: Algorithm.Ed25519,
        data: fromHex("aabbccdd") as PubkeyBytes,
      },
      signature: fromHex("eeff0011") as SignatureBytes,
    };

    it("returns true for valid SignedTransaction", () => {
      const good: SignedTransaction = {
        transaction: goodTransaction,
        signatures: [goodSignature],
      };
      expect(isSignedTransaction(good)).toEqual(true);
    });

    it("ignores additional fields", () => {
      const withOtherData: SignedTransaction & { readonly other: number } = {
        transaction: goodTransaction,
        signatures: [goodSignature],
        other: 123,
      };
      expect(isSignedTransaction(withOtherData)).toEqual(true);
    });

    it("returns false for empty signatures list", () => {
      const emptySignatures: Omit<SignedTransaction, "signatures"> & {
        readonly signatures: readonly FullSignature[];
      } = {
        transaction: goodTransaction,
        signatures: [],
      };
      expect(isSignedTransaction(emptySignatures)).toEqual(false);
    });

    it("returns false for a bunch of other stuff", () => {
      expect(isSignedTransaction("abc")).toEqual(false);
      expect(isSignedTransaction({})).toEqual(false);
      expect(isSignedTransaction(null)).toEqual(false);
      expect(isSignedTransaction(undefined)).toEqual(false);
      expect(isSignedTransaction(fromHex("aabb"))).toEqual(false);

      const missingSignatures: Omit<SignedTransaction, "signatures"> = {
        transaction: goodTransaction,
      };
      expect(isSignedTransaction(missingSignatures)).toEqual(false);

      const missingTransaction: Omit<SignedTransaction, "transaction"> = {
        signatures: [goodSignature],
      };
      expect(isSignedTransaction(missingTransaction)).toEqual(false);
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
