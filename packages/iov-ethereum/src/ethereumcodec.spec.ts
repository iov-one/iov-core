import { Encoding } from "@iov/encoding";
import { Algorithm, PublicKeyBundle, PublicKeyBytes } from "@iov/tendermint-types";
import { ethereumCodec, toChecksumAddress } from "./ethereumcodec";

const { fromHex } = Encoding;

describe("toChecksumAddress", () => {
  it("convert address properly", () => {
    // test cases from https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md#test-cases
    expect(toChecksumAddress("0x52908400098527886E0F7030069857D2E4169EE7")).toEqual(
      "0x52908400098527886E0F7030069857D2E4169EE7",
    );
    expect(toChecksumAddress("0x8617E340B3D01FA5F11F306F4090FD50E238070D")).toEqual(
      "0x8617E340B3D01FA5F11F306F4090FD50E238070D",
    );
    expect(toChecksumAddress("0xde709f2102306220921060314715629080e2fb77")).toEqual(
      "0xde709f2102306220921060314715629080e2fb77",
    );
    expect(toChecksumAddress("0x27b1fdb04752bbc536007a920d24acb045561c26")).toEqual(
      "0x27b1fdb04752bbc536007a920d24acb045561c26",
    );
    expect(toChecksumAddress("0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed")).toEqual(
      "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    );
    expect(toChecksumAddress("0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359")).toEqual(
      "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
    );
  });
});
describe("ethereumCodec", () => {
  it("derives addresses properly", () => {
    // Test cases from https://github.com/MaiaVictor/eth-lib/blob/master/test/test.js#L56
    const pubkey: PublicKeyBundle = {
      algo: Algorithm.Secp256k1,
      data: fromHex(
        "4bc2a31265153f07e70e0bab08724e6b85e217f8cd628ceb62974247bb493382ce28cab79ad7119ee1ad3ebcdb98a16805211530ecc6cfefa1b88e6dff99232a",
      ) as PublicKeyBytes,
    };
    expect(ethereumCodec.keyToAddress(pubkey)).toEqual("0x9d8A62f656a8d1615C1294fd71e9CFb3E4855A4F");
  });
});
