import { decodeHexQuantity } from "./utils";

describe("Ethereum utils", () => {
  describe("decodeHexQuantity", () => {
    it("verify valid inputs", () => {
      let decStrQty;
      decStrQty = decodeHexQuantity("0x400");
      expect(decStrQty).toEqual(1024);
      decStrQty = decodeHexQuantity("0x41");
      expect(decStrQty).toEqual(65);
      decStrQty = decodeHexQuantity("0x0");
      expect(decStrQty).toEqual(0);
    });

    it("throws error for invalid inputs", () => {
      expect(() => decodeHexQuantity("0x")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantity("0x0400")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantity("ff")).toThrowError(/invalid hex quantity input/);
    });
  });
});
