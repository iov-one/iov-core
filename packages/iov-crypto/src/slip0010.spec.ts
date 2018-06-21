import { Encoding } from "./encoding";
import { Slip0010, Slip0010Curves } from "./slip0010";

const fromHex = Encoding.fromHex;

describe("Slip0010", () => {
  it("can derive ed25519 master key", () => {
    // https://github.com/satoshilabs/slips/blob/master/slip-0010.md#test-vector-1-for-ed25519
    const seed = fromHex("000102030405060708090a0b0c0d0e0f");
    const result = Slip0010.masterKey(Slip0010Curves.Ed25519, seed);
    expect(result).toEqual(fromHex("2b4be7f19ee27bbf30c667b642d5f4aa69fd169872f8fc3059c08ebae2eb19e7"));
  });
});
