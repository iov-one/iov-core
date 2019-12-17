import { Amount, TokenTicker } from "@iov/bcp";

import { encodeAmount } from "./encodinghelpers";
import * as codecImpl from "./generated/codecimpl";
import { coinBin, coinJson } from "./testdata.spec";

describe("encodinghelpers", () => {
  describe("encodeAmount", () => {
    it("can encode amount 3.123456789 ASH", () => {
      const amount: Amount = {
        quantity: "3123456789",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      };
      const encoded = encodeAmount(amount);
      expect(encoded).toEqual({
        whole: 3,
        fractional: 123456789,
        ticker: "ASH",
      });
    });

    it("can encode amount 0.000000001 ASH", () => {
      const amount: Amount = {
        quantity: "1",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      };
      const encoded = encodeAmount(amount);
      expect(encoded).toEqual({
        whole: null,
        fractional: 1,
        ticker: "ASH",
      });
    });

    it("can encode max amount 999999999999999.999999999 ASH", () => {
      // https://github.com/iov-one/weave/blob/v0.9.3/x/codec.proto#L15
      const amount: Amount = {
        quantity: "999999999999999999999999",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      };
      const encoded = encodeAmount(amount);
      expect(encoded).toEqual({
        whole: 10 ** 15 - 1,
        fractional: 10 ** 9 - 1,
        ticker: "ASH",
      });
    });

    it("can encode an empty amount", () => {
      // We saw this in the wild. It is still unclear if an instance like this is allowed
      // to exist. But if it is, it needs to be encoded the following way:
      const amount: Amount = {
        quantity: "0",
        fractionalDigits: 9,
        tokenTicker: "" as TokenTicker,
      };
      const encoded = encodeAmount(amount);
      expect(encoded).toEqual({
        whole: null,
        fractional: null,
        ticker: null,
      });
    });

    it("throws for encoding fractional digits other than 9", () => {
      const amount: Amount = {
        quantity: "1",
        fractionalDigits: 6,
        tokenTicker: "SMASH" as TokenTicker,
      };
      expect(() => encodeAmount(amount)).toThrowError(/fractional digits must be 9 but was 6/i);
    });

    it("is compatible to test data", () => {
      const encoded = encodeAmount(coinJson);
      const encodedBinary = Uint8Array.from(codecImpl.coin.Coin.encode(encoded).finish());
      expect(encodedBinary).toEqual(coinBin);
    });
  });
});
