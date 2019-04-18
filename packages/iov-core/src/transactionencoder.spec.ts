import {
  Address,
  Algorithm,
  ChainId,
  isPublicIdentity,
  PublicKeyBytes,
  SendTransaction,
  TokenTicker,
} from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import { TransactionEncoder } from "./transactionencoder";

const { fromJson, toJson } = TransactionEncoder;

describe("TransactionEncoder", () => {
  describe("toJson", () => {
    it("works for numbers", () => {
      expect(toJson(0)).toEqual(0);
      expect(toJson(1)).toEqual(1);
      expect(toJson(-1)).toEqual(-1);
      expect(toJson(Number.POSITIVE_INFINITY)).toEqual(Number.POSITIVE_INFINITY);
      expect(toJson(Number.NaN)).toEqual(Number.NaN);
    });

    it("works for booleans", () => {
      expect(toJson(true)).toEqual(true);
      expect(toJson(false)).toEqual(false);
    });

    it("works for null", () => {
      expect(toJson(null)).toEqual(null);
    });

    it("works for arrays", () => {
      expect(toJson([])).toEqual([]);
      expect(toJson([1, 2, 3])).toEqual([1, 2, 3]);
      expect(toJson([1, [2, 3]])).toEqual([1, [2, 3]]);
    });

    it("works for dicts", () => {
      expect(toJson({})).toEqual({});
      expect(toJson({ foo: 1 })).toEqual({ foo: 1 });
      expect(toJson({ foo: 1, bar: 2 })).toEqual({ foo: 1, bar: 2 });
      expect(toJson({ foo: { bar: 1 } })).toEqual({ foo: { bar: 1 } });
    });

    it("fails for unsupported objects", () => {
      expect(() => toJson(() => 0)).toThrowError(/Cannot encode type to JSON/i);
      expect(() => toJson(/[0-9]+/)).toThrowError(/Cannot encode type to JSON/i);
      expect(() => toJson(new Uint32Array())).toThrowError(/Cannot encode type to JSON/i);
      expect(() => toJson(undefined)).toThrowError(/Cannot encode type to JSON/i);
    });

    it("prefixes strings", () => {
      expect(toJson("")).toEqual("string:");
      expect(toJson("abc")).toEqual("string:abc");
      expect(toJson("\0")).toEqual("string:\0");
    });

    it("prefixes and hex encodes Uint8Array", () => {
      expect(toJson(new Uint8Array([]))).toEqual("bytes:");
      expect(toJson(new Uint8Array([0x12]))).toEqual("bytes:12");
      expect(toJson(new Uint8Array([0x12, 0xab]))).toEqual("bytes:12ab");
    });

    // Encoding recursive objects is explicitly undefined behavior. Just use this
    // test to play around.
    xit("fails for recursive objects", () => {
      const a: any = {};
      const b: any = {};
      // tslint:disable-next-line: no-object-mutation
      b.neighbour = a;
      // tslint:disable-next-line: no-object-mutation
      a.neighbour = b;
      expect(() => toJson(a)).toThrowError(/Maximum call stack size exceeded/i);
    });
  });

  describe("fromJson", () => {
    it("works for numbers", () => {
      expect(fromJson(0)).toEqual(0);
      expect(fromJson(1)).toEqual(1);
      expect(fromJson(-1)).toEqual(-1);
      expect(fromJson(Number.POSITIVE_INFINITY)).toEqual(Number.POSITIVE_INFINITY);
      expect(fromJson(Number.NaN)).toEqual(Number.NaN);
    });

    it("works for booleans", () => {
      expect(fromJson(true)).toEqual(true);
      expect(fromJson(false)).toEqual(false);
    });

    it("works for null", () => {
      expect(fromJson(null)).toEqual(null);
    });

    it("works for arrays", () => {
      expect(fromJson([])).toEqual([]);
      expect(fromJson([1, 2, 3])).toEqual([1, 2, 3]);
      expect(fromJson([1, [2, 3]])).toEqual([1, [2, 3]]);
    });

    it("works for dicts", () => {
      expect(fromJson({})).toEqual({});
      expect(fromJson({ foo: 1 })).toEqual({ foo: 1 });
      expect(fromJson({ foo: 1, bar: 2 })).toEqual({ foo: 1, bar: 2 });
      expect(fromJson({ foo: { bar: 1 } })).toEqual({ foo: { bar: 1 } });
    });

    it("works for strings", () => {
      // "string:" prefix
      expect(fromJson("string:")).toEqual("");
      expect(fromJson("string:abc")).toEqual("abc");
      expect(fromJson("string:\0")).toEqual("\0");

      // "bytes:" prefix
      expect(fromJson("bytes:")).toEqual(new Uint8Array([]));
      expect(fromJson("bytes:12")).toEqual(new Uint8Array([0x12]));
      expect(fromJson("bytes:aabb")).toEqual(new Uint8Array([0xaa, 0xbb]));

      // other prefixes
      expect(() => fromJson("")).toThrowError(/Found string with unknown prefix/i);
      expect(() => fromJson("abc")).toThrowError(/Found string with unknown prefix/i);
      expect(() => fromJson("Integer:123")).toThrowError(/Found string with unknown prefix/i);
    });

    it("decodes a full send transaction", () => {
      const original: SendTransaction = {
        kind: "bcp/send",
        creator: {
          chainId: "testchain" as ChainId,
          pubkey: {
            algo: Algorithm.Ed25519,
            data: Encoding.fromHex("aabbccdd") as PublicKeyBytes,
          },
        },
        memo: "Hello hello",
        amount: {
          quantity: "123",
          tokenTicker: "CASH" as TokenTicker,
          fractionalDigits: 2,
        },
        recipient: "aabbcc" as Address,
        fee: {
          tokens: {
            quantity: "1",
            tokenTicker: "ASH" as TokenTicker,
            fractionalDigits: 2,
          },
        },
      };

      const restored = fromJson(toJson(original));
      expect(restored).toEqual(original);
      expect(isPublicIdentity(restored.creator)).toEqual(true);
    });
  });
});
