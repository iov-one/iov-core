import { ChainId, Nonce } from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import { Abi } from "./abi";
import {
  decodeHexQuantity,
  decodeHexQuantityNonce,
  decodeHexQuantityString,
  encodeQuantity,
  encodeQuantityString,
  fromBcpChainId,
  normalizeHex,
  shouldBeInterpretedAsErc20Transfer,
  toBcpChainId,
} from "./utils";

const { fromHex } = Encoding;

describe("Ethereum utils", () => {
  describe("decodeHexQuantity", () => {
    it("verify valid inputs", () => {
      let decStrQty;
      decStrQty = decodeHexQuantity("0x9184e72a000");
      expect(decStrQty).toEqual(10000000000000);
      decStrQty = decodeHexQuantity("0x400");
      expect(decStrQty).toEqual(1024);
      decStrQty = decodeHexQuantity("0x41");
      expect(decStrQty).toEqual(65);
      decStrQty = decodeHexQuantity("0x2");
      expect(decStrQty).toEqual(2);
      decStrQty = decodeHexQuantity("0x0");
      expect(decStrQty).toEqual(0);
    });

    it("throws error for invalid inputs", () => {
      expect(() => decodeHexQuantity("0x")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantity("ff")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantity("0xa0xa0xa0xa0xa")).toThrowError(/invalid hex quantity input/);
      // turn on when ganache fix the issue
      // expect(() => decodeHexQuantity("0x0400")).toThrowError(/invalid hex quantity input/);
    });
  });

  describe("decodeHexQuantityString", () => {
    it("verify valid inputs", () => {
      let decStrQty;
      decStrQty = decodeHexQuantityString("0xd3c21bcecceda0ffffff");
      expect(decStrQty).toEqual("999999999999999999999999");
      decStrQty = decodeHexQuantityString("0xde0b6b3a763ffff");
      expect(decStrQty).toEqual("999999999999999999");
      decStrQty = decodeHexQuantityString("0x38d7ea4c67fff");
      expect(decStrQty).toEqual("999999999999999");
      decStrQty = decodeHexQuantityString("0x09184e72a000");
      expect(decStrQty).toEqual("10000000000000");
      decStrQty = decodeHexQuantityString("0x400");
      expect(decStrQty).toEqual("1024");
      decStrQty = decodeHexQuantityString("0x41");
      expect(decStrQty).toEqual("65");
      decStrQty = decodeHexQuantityString("0x2");
      expect(decStrQty).toEqual("2");
      decStrQty = decodeHexQuantityString("0x0");
      expect(decStrQty).toEqual("0");
    });

    it("throws error for invalid inputs", () => {
      expect(() => decodeHexQuantity("0x")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantity("ff")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantity("0xa0xa0xa0xa0xa")).toThrowError(/invalid hex quantity input/);
    });
  });

  describe("decodeHexQuantityNonce", () => {
    it("verify valid inputs", () => {
      let decStrQty;
      decStrQty = decodeHexQuantityNonce("0x38d7ea4c67fff");
      expect(decStrQty).toEqual(999999999999999 as Nonce);
      decStrQty = decodeHexQuantityNonce("0x9184e72a000");
      expect(decStrQty).toEqual(10000000000000 as Nonce);
      decStrQty = decodeHexQuantityNonce("0x400");
      expect(decStrQty).toEqual(1024 as Nonce);
      decStrQty = decodeHexQuantityNonce("0x41");
      expect(decStrQty).toEqual(65 as Nonce);
      decStrQty = decodeHexQuantityNonce("0x2");
      expect(decStrQty).toEqual(2 as Nonce);
      decStrQty = decodeHexQuantityNonce("0x0");
      expect(decStrQty).toEqual(0 as Nonce);
    });

    it("throws error for invalid inputs", () => {
      expect(() => decodeHexQuantity("0x")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantity("ff")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantity("0xa0xa0xa0xa0xa")).toThrowError(/invalid hex quantity input/);
      expect(() => decodeHexQuantityNonce("0xd3c21bcecceda0ffffff")).toThrowError(/Input not in int53 range/);
      expect(() => decodeHexQuantityNonce("0xde0b6b3a763ffff")).toThrowError(/Input not in int53 range/);
      // turn on when ganache fix the issue
      // expect(() => decodeHexQuantityNonce("0x0400")).toThrowError(/invalid hex quantity input/);
    });
  });

  describe("encodeQuantity", () => {
    it("verify valid inputs", () => {
      let encQtyHex;
      encQtyHex = encodeQuantity(10000000000000);
      expect(encQtyHex).toEqual("0x9184e72a000");
      encQtyHex = encodeQuantity(1024);
      expect(encQtyHex).toEqual("0x400");
      encQtyHex = encodeQuantity(65);
      expect(encQtyHex).toEqual("0x41");
      encQtyHex = encodeQuantity(2);
      expect(encQtyHex).toEqual("0x2");
      encQtyHex = encodeQuantity(0);
      expect(encQtyHex).toEqual("0x0");
    });

    it("throws error for invalid inputs", () => {
      expect(() => encodeQuantity(NaN)).toThrowError(/input is not a unsigned safe integer/i);
      expect(() => encodeQuantity(12345678901234567)).toThrowError(/input is not a unsigned safe integer/i);
      expect(() => encodeQuantity(-1234)).toThrowError(/input is not a unsigned safe integer/i);
      expect(() => encodeQuantity(1.234)).toThrowError(/input is not a unsigned safe integer/i);
    });
  });

  describe("encodeQuantityString", () => {
    it("verify valid inputs", () => {
      let encQtyHex;
      encQtyHex = encodeQuantityString("10000000000000");
      expect(encQtyHex).toEqual("0x9184e72a000");
      encQtyHex = encodeQuantityString("1024");
      expect(encQtyHex).toEqual("0x400");
      encQtyHex = encodeQuantityString("65");
      expect(encQtyHex).toEqual("0x41");
      encQtyHex = encodeQuantityString("2");
      expect(encQtyHex).toEqual("0x2");
      encQtyHex = encodeQuantityString("0");
      expect(encQtyHex).toEqual("0x0");
    });

    it("throws error for invalid inputs", () => {
      expect(() => encodeQuantityString("1234abc")).toThrowError(/Input is not a valid string number/);
    });
  });

  describe("normalizeHex", () => {
    it("drops prefixes", () => {
      expect(normalizeHex("0x")).toEqual("");
      expect(normalizeHex("0x01")).toEqual("01");
      expect(normalizeHex("0x52ab")).toEqual("52ab");
    });

    it("padds to even hex character count", () => {
      expect(normalizeHex("2")).toEqual("02");
      expect(normalizeHex("0x2")).toEqual("02");
      expect(normalizeHex("0x0")).toEqual("00");
      expect(normalizeHex("2ab")).toEqual("02ab");
      expect(normalizeHex("0x2ab")).toEqual("02ab");
    });

    it("converts to lower case", () => {
      expect(normalizeHex("AB")).toEqual("ab");
      expect(normalizeHex("Ab")).toEqual("ab");
      expect(normalizeHex("aB")).toEqual("ab");
      expect(normalizeHex("ab")).toEqual("ab");
    });
  });

  describe("toBcpChainId", () => {
    it("works for simple values", () => {
      expect(toBcpChainId(1)).toEqual("ethereum-eip155-1");
      expect(toBcpChainId(2)).toEqual("ethereum-eip155-2");
      expect(toBcpChainId(314158)).toEqual("ethereum-eip155-314158");

      // 0 must be supported to work with pre-eip155 test vectors
      expect(toBcpChainId(0)).toEqual("ethereum-eip155-0");
    });

    it("throws for values less than 0", () => {
      expect(() => toBcpChainId(-1)).toThrowError();
    });
  });

  describe("fromBcpChainId", () => {
    it("works for simple values", () => {
      expect(fromBcpChainId("ethereum-eip155-1" as ChainId)).toEqual(1);
      expect(fromBcpChainId("ethereum-eip155-2" as ChainId)).toEqual(2);
      expect(fromBcpChainId("ethereum-eip155-314158" as ChainId)).toEqual(314158);

      // 0 must be supported to work with pre-eip155 test vectors
      expect(fromBcpChainId("ethereum-eip155-0" as ChainId)).toEqual(0);
    });

    it("throws for invalid prefix", () => {
      expect(() => fromBcpChainId("ethereum-1" as ChainId)).toThrowError(/Expected chain ID to start with/i);
      expect(() => fromBcpChainId("eip155-1" as ChainId)).toThrowError(/Expected chain ID to start with/i);
      expect(() => fromBcpChainId("1" as ChainId)).toThrowError(/Expected chain ID to start with/i);

      expect(() => fromBcpChainId("Ethereum-eip155-1" as ChainId)).toThrowError(
        /Expected chain ID to start with/i,
      );
    });

    it("throws for invalid number", () => {
      expect(() => fromBcpChainId("ethereum-eip155-a" as ChainId)).toThrowError(
        /Invalid format of EIP155 chain ID/i,
      );
      expect(() => fromBcpChainId("ethereum-eip155--1" as ChainId)).toThrowError(
        /Invalid format of EIP155 chain ID/i,
      );
      expect(() => fromBcpChainId("ethereum-eip155-01" as ChainId)).toThrowError(
        /Invalid format of EIP155 chain ID/i,
      );
      expect(() => fromBcpChainId("ethereum-eip155-1.1" as ChainId)).toThrowError(
        /Invalid format of EIP155 chain ID/i,
      );
    });
  });

  describe("shouldBeInterpretedAsErc20Transfer", () => {
    // https://rinkeby.etherscan.io/tx/0x5c3cda91447e749c6133ad26ab93a95dfb8d5e4a899e324a5cc74f5e19780c96
    const erc20Input = fromHex(
      "a9059cbb0000000000000000000000003b8a67ad64160e0b977b6dd877e0fb98878ab9020000000000000000000000003b8a67ad64160e0b977b6dd877e0fb98878ab902",
    );

    it("should work for ERC20 transfers", () => {
      const ethValue = "0";
      expect(shouldBeInterpretedAsErc20Transfer(erc20Input, ethValue)).toEqual(true);
    });

    it("should return false when ETH value is non-zero", () => {
      const ethValue = "1";
      expect(shouldBeInterpretedAsErc20Transfer(erc20Input, ethValue)).toEqual(false);
    });

    it("should return false for input other than 68 bytes", () => {
      {
        // 67 bytes
        const input = erc20Input.slice(0, -1);
        const ethValue = "0";
        expect(shouldBeInterpretedAsErc20Transfer(input, ethValue)).toEqual(false);
      }
      {
        // 69 bytes
        const input = new Uint8Array([...erc20Input, 0x00]);
        const ethValue = "0";
        expect(shouldBeInterpretedAsErc20Transfer(input, ethValue)).toEqual(false);
      }
    });

    it("should return false for other signature than transfer(address,uint256)", () => {
      const otherMethodId = Abi.calculateMethodId("depositTokens(address,uint256)");

      const input = new Uint8Array([...otherMethodId, ...erc20Input.slice(4)]);
      const ethValue = "0";
      expect(shouldBeInterpretedAsErc20Transfer(input, ethValue)).toEqual(false);
    });
  });
});
