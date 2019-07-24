import { Encoding, isUint8Array } from "@iov/encoding";

import { TransactionEncoder } from "./transactionencoder";

const { fromJson, toJson } = TransactionEncoder;

/** and example of how this could potentially be used */
interface TestTransaction {
  readonly creator: {
    readonly chainId: string;
    readonly pubkey: {
      readonly algo: string;
      readonly data: Uint8Array;
    };
  };
  readonly kind: "send_transaction";
  readonly fee?: {
    readonly tokens?: {
      readonly quantity: string;
      readonly fractionalDigits: number;
      readonly tokenTicker: string;
    };
    readonly gasPrice?: {
      readonly quantity: string;
      readonly fractionalDigits: number;
      readonly tokenTicker: string;
    };
    readonly gasLimit?: string;
  };
  readonly amount: {
    readonly quantity: string;
    readonly fractionalDigits: number;
    readonly tokenTicker: string;
  };
  readonly sender: string;
  readonly recipient: string;
  readonly memo?: string;
}

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
      const expectedError = /Cannot encode type to JSON/i;
      expect(() => toJson(() => 0)).toThrowError(expectedError);
      expect(() => toJson(/[0-9]+/)).toThrowError(expectedError);
      expect(() => toJson(new Uint32Array())).toThrowError(expectedError);
      expect(() => toJson(undefined)).toThrowError(expectedError);
    });

    it("prefixes strings", () => {
      expect(toJson("")).toEqual("string:");
      expect(toJson("abc")).toEqual("string:abc");
      expect(toJson("\0")).toEqual("string:\0");
      expect(toJson("string:abc")).toEqual("string:string:abc");
    });

    it("prefixes and hex encodes Uint8Array", () => {
      expect(toJson(new Uint8Array([]))).toEqual("bytes:");
      expect(toJson(new Uint8Array([0x12]))).toEqual("bytes:12");
      expect(toJson(new Uint8Array([0x12, 0xab]))).toEqual("bytes:12ab");
    });

    // Encoding circular objects is explicitly undefined behavior. Just use this
    // test to play around.
    xit("fails for circular objects", () => {
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
      expect(fromJson(Number.MAX_SAFE_INTEGER)).toEqual(Number.MAX_SAFE_INTEGER);
      expect(fromJson(2 * Number.MAX_SAFE_INTEGER)).toEqual(2 * Number.MAX_SAFE_INTEGER);
      expect(fromJson(Number.MAX_SAFE_INTEGER + 10_000000)).toEqual(Number.MAX_SAFE_INTEGER + 10_000000);
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
      const expectedError = /Found string with unknown prefix/i;
      expect(() => fromJson("")).toThrowError(expectedError);
      expect(() => fromJson("abc")).toThrowError(expectedError);
      expect(() => fromJson("Integer:123")).toThrowError(expectedError);
    });

    it("decodes a full send transaction", () => {
      const original: TestTransaction = {
        kind: "send_transaction",
        creator: {
          chainId: "testchain",
          pubkey: {
            algo: "ed25519",
            data: Encoding.fromHex("aabbccdd"),
          },
        },
        memo: "Hello hello",
        amount: {
          quantity: "123",
          tokenTicker: "CASH",
          fractionalDigits: 2,
        },
        sender: "not used",
        recipient: "aabbcc",
        fee: {
          tokens: {
            quantity: "1",
            tokenTicker: "ASH",
            fractionalDigits: 2,
          },
        },
      };

      const restored = fromJson(toJson(original));
      expect(restored).toEqual(original);
      expect(isUint8Array(restored.creator.pubkey.data)).toEqual(true);
    });
  });
});
