import { Encoding } from "@iov/encoding";

import { buildEscrowCondition, conditionToWeaveAddress } from "./conditions";

const { fromHex } = Encoding;

describe("conditions", () => {
  describe("buildEscrowCondition", () => {
    it("leads to known address", () => {
      const condition = buildEscrowCondition(fromHex("0000000000000001"));
      expect(conditionToWeaveAddress(condition)).toEqual(fromHex("f3c0c76deb86274d8bb166fb91d840ffd8ec46c4"));
    });
  });
});
