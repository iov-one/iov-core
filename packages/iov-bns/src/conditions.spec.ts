import { ChainId, Hash, SwapIdBytes } from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import {
  buildCondition,
  buildEscrowCondition,
  conditionToWeaveAddress,
  electionRuleIdToAddress,
  escrowIdToAddress,
  multisignatureIdToAddress,
  swapToAddress,
} from "./conditions";

const { fromHex, toAscii } = Encoding;

describe("conditions", () => {
  describe("buildCondition", () => {
    it("works", () => {
      const condition = buildCondition("foo", "bar", toAscii("123!"));
      expect(condition).toEqual(toAscii("foo/bar/123!"));
    });
  });

  // TODO: test buildMultisignatureCondition

  describe("buildEscrowCondition", () => {
    it("leads to known address", () => {
      const condition = buildEscrowCondition(1);
      expect(conditionToWeaveAddress(condition)).toEqual(fromHex("f3c0c76deb86274d8bb166fb91d840ffd8ec46c4"));
    });
  });

  describe("swapToAddress", () => {
    it("leads to known address", () => {
      const swap = {
        id: {
          data: fromHex("0000000000000001") as SwapIdBytes,
        },
        hash: fromHex("09d638982fbb9d30e8cb984a6fe65a003851f2cee9e28aacf578d242fc776df4") as Hash,
      };
      const address = swapToAddress("local-iov-devnet" as ChainId, swap);
      expect(address).toEqual("tiov1k7axllrc97mtzcn0nkhtgxjre2gfvm3ua62pu5");
    });
  });

  describe("multisignatureIdToAddress", () => {
    it("leads to known address", () => {
      const address = multisignatureIdToAddress("local-iov-devnet" as ChainId, 2);
      expect(address).toEqual("tiov1zd573wa38pxfvn9mxvpkjm6a8vteqvaryc8xs7");
    });
  });

  describe("escrowIdToAddress", () => {
    it("leads to known address", () => {
      const address = escrowIdToAddress("local-iov-devnet" as ChainId, 1);
      expect(address).toEqual("tiov170qvwm0tscn5mza3vmaerkzqllvwc3kycrz6kr");
    });
  });

  describe("electionRuleIdToAddress", () => {
    it("leads to known address", () => {
      const address = electionRuleIdToAddress("local-iov-devnet" as ChainId, 2);
      expect(address).toEqual("tiov1k0dp2fmdunscuwjjusqtk6mttx5ufk3z0mmp0z");
    });
  });
});
