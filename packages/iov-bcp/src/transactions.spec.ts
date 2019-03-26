import { isBlockHeightTimeout, isTimestampTimeout } from "./transactions";

describe("transactions", () => {
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
