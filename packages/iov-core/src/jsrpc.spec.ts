import { isJsRpcCompatibleArray, isJsRpcCompatibleDictionary, isJsRpcCompatibleValue } from "./jsrpc";

describe("jsrpc", () => {
  describe("isJsRpcCompatibleValue", () => {
    it("works", () => {
      expect(isJsRpcCompatibleValue("a")).toEqual(true);
      expect(isJsRpcCompatibleValue(1)).toEqual(true);
      expect(isJsRpcCompatibleValue(true)).toEqual(true);
      expect(isJsRpcCompatibleValue({})).toEqual(true);
      expect(isJsRpcCompatibleValue({ foo: "bar" })).toEqual(true);
      expect(isJsRpcCompatibleValue(null)).toEqual(true);
      expect(isJsRpcCompatibleValue(new Uint8Array([0x00, 0x11]))).toEqual(true);

      // arrays
      expect(isJsRpcCompatibleValue([])).toEqual(true);
      expect(isJsRpcCompatibleValue(["a", "b", "c"])).toEqual(true);
      expect(isJsRpcCompatibleValue([new Uint8Array([0x00, 0x11])])).toEqual(true);

      expect(isJsRpcCompatibleValue(undefined)).toEqual(false);
      expect(isJsRpcCompatibleValue(() => 0)).toEqual(false);
    });
  });

  describe("isJsRpcCompatibleArray", () => {
    it("works", () => {
      // ok
      expect(isJsRpcCompatibleArray([])).toEqual(true);
      expect(isJsRpcCompatibleArray(["a", "b", "c"])).toEqual(true);

      // array with wrong element type
      expect(isJsRpcCompatibleArray([() => 0])).toEqual(false);
      expect(isJsRpcCompatibleArray(["a", "b", () => 0])).toEqual(false);

      // other
      expect(isJsRpcCompatibleArray("a")).toEqual(false);
      expect(isJsRpcCompatibleArray(1)).toEqual(false);
      expect(isJsRpcCompatibleArray(true)).toEqual(false);
      expect(isJsRpcCompatibleArray({})).toEqual(false);
      expect(isJsRpcCompatibleArray({ foo: "bar" })).toEqual(false);
      expect(isJsRpcCompatibleArray(null)).toEqual(false);
      expect(isJsRpcCompatibleArray(new Uint8Array([0x00, 0x11]))).toEqual(false);
      expect(isJsRpcCompatibleValue(undefined)).toEqual(false);
      expect(isJsRpcCompatibleValue(() => 0)).toEqual(false);
    });
  });

  describe("isJsRpcCompatibleDictionary", () => {
    it("works", () => {
      // ok
      expect(isJsRpcCompatibleDictionary({})).toEqual(true);
      expect(isJsRpcCompatibleDictionary({ foo: "bar" })).toEqual(true);
      expect(isJsRpcCompatibleDictionary({ foo: [1, 2, 3] })).toEqual(true);
      expect(isJsRpcCompatibleDictionary({ foo: new Uint8Array([0x00, 0x11]) })).toEqual(true);

      // directory with wrong element value
      expect(isJsRpcCompatibleDictionary({ func: () => 0 })).toEqual(false);

      // other
      expect(isJsRpcCompatibleDictionary("a")).toEqual(false);
      expect(isJsRpcCompatibleDictionary(1)).toEqual(false);
      expect(isJsRpcCompatibleDictionary(true)).toEqual(false);
      expect(isJsRpcCompatibleDictionary(null)).toEqual(false);
      expect(isJsRpcCompatibleDictionary(new Uint8Array([0x00, 0x11]))).toEqual(false);
      expect(isJsRpcCompatibleDictionary(undefined)).toEqual(false);
      expect(isJsRpcCompatibleDictionary(() => 0)).toEqual(false);
      expect(isJsRpcCompatibleDictionary([])).toEqual(false);
      expect(isJsRpcCompatibleDictionary(["a", "b", "c"])).toEqual(false);
    });
  });
});
