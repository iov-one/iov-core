import { Encoding } from "@iov/encoding";

import {
  BlknumForkState,
  decodeHeadTail,
  decodeVariableLength,
  Eip155ChainId,
  eip155V,
  getRecoveryParam,
} from "./encoding";

const { fromHex } = Encoding;

describe("Ethereum encoding", () => {
  describe("eip155V", () => {
    it("works for inputs before fork", () => {
      expect(eip155V({ forkState: BlknumForkState.Before }, 0)).toEqual(27);
      expect(eip155V({ forkState: BlknumForkState.Before }, 1)).toEqual(28);
    });

    it("works for inputs after fork", () => {
      // Ganache test
      let afterForkChain: Eip155ChainId;
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 5777 };
      expect(eip155V(afterForkChain, 0)).toEqual(11589);
      expect(eip155V(afterForkChain, 1)).toEqual(11590);
      // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md#list-of-chain-ids
      // Ethereum mainnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 1 };
      expect(eip155V(afterForkChain, 0)).toEqual(37);
      expect(eip155V(afterForkChain, 1)).toEqual(38);
      // Morden (disused), Expanse mainnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 2 };
      expect(eip155V(afterForkChain, 0)).toEqual(39);
      expect(eip155V(afterForkChain, 1)).toEqual(40);
      // Ropsten
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 3 };
      expect(eip155V(afterForkChain, 0)).toEqual(41);
      expect(eip155V(afterForkChain, 1)).toEqual(42);
      // Rinkeby
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 4 };
      expect(eip155V(afterForkChain, 0)).toEqual(43);
      expect(eip155V(afterForkChain, 1)).toEqual(44);
      // Ubiq mainnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 8 };
      expect(eip155V(afterForkChain, 0)).toEqual(51);
      expect(eip155V(afterForkChain, 1)).toEqual(52);
      // Ubiq testnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 9 };
      expect(eip155V(afterForkChain, 0)).toEqual(53);
      expect(eip155V(afterForkChain, 1)).toEqual(54);
      // Rootstock mainnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 30 };
      expect(eip155V(afterForkChain, 0)).toEqual(95);
      expect(eip155V(afterForkChain, 1)).toEqual(96);
      // Rootstock testnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 31 };
      expect(eip155V(afterForkChain, 0)).toEqual(97);
      expect(eip155V(afterForkChain, 1)).toEqual(98);
      // Kovan
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 42 };
      expect(eip155V(afterForkChain, 0)).toEqual(119);
      expect(eip155V(afterForkChain, 1)).toEqual(120);
      // Ethereum Classic mainnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 61 };
      expect(eip155V(afterForkChain, 0)).toEqual(157);
      expect(eip155V(afterForkChain, 1)).toEqual(158);
      // Ethereum Classic testnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 62 };
      expect(eip155V(afterForkChain, 0)).toEqual(159);
      expect(eip155V(afterForkChain, 1)).toEqual(160);
      // ewasm testnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 66 };
      expect(eip155V(afterForkChain, 0)).toEqual(167);
      expect(eip155V(afterForkChain, 1)).toEqual(168);
      // Geth private chains (default)
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 1337 };
      expect(eip155V(afterForkChain, 0)).toEqual(2709);
      expect(eip155V(afterForkChain, 1)).toEqual(2710);
    });

    it("errors for chain ID 0 after fork", () => {
      // Chain ID must be a number from
      // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md#list-of-chain-ids
      const invalidChain: Eip155ChainId = { forkState: BlknumForkState.Forked, chainId: 0 };
      expect(() => eip155V(invalidChain, 0)).toThrowError(
        /chain ID must be > 0 after eip155 implementation/i,
      );
    });
  });

  describe("getRecoveryParam", () => {
    it("verify valid inputs", () => {
      // Ganache test
      let afterForkChain: Eip155ChainId;
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 5777 };
      expect(getRecoveryParam(afterForkChain, 11589)).toEqual(0);
      expect(getRecoveryParam(afterForkChain, 11590)).toEqual(1);
      // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md#list-of-chain-ids
      // Ethereum mainnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 1 };
      expect(getRecoveryParam(afterForkChain, 37)).toEqual(0);
      expect(getRecoveryParam(afterForkChain, 38)).toEqual(1);
      // Morden (disused), Expanse mainnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 2 };
      expect(getRecoveryParam(afterForkChain, 39)).toEqual(0);
      expect(getRecoveryParam(afterForkChain, 40)).toEqual(1);
      // Ropsten
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 3 };
      expect(getRecoveryParam(afterForkChain, 41)).toEqual(0);
      expect(getRecoveryParam(afterForkChain, 42)).toEqual(1);
      // Rinkeby
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 4 };
      expect(getRecoveryParam(afterForkChain, 43)).toEqual(0);
      expect(getRecoveryParam(afterForkChain, 44)).toEqual(1);
      // Ubiq mainnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 8 };
      expect(getRecoveryParam(afterForkChain, 51)).toEqual(0);
      expect(getRecoveryParam(afterForkChain, 52)).toEqual(1);
      // Ubiq testnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 9 };
      expect(getRecoveryParam(afterForkChain, 53)).toEqual(0);
      expect(getRecoveryParam(afterForkChain, 54)).toEqual(1);
      // Rootstock mainnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 30 };
      expect(getRecoveryParam(afterForkChain, 95)).toEqual(0);
      expect(getRecoveryParam(afterForkChain, 96)).toEqual(1);
      // Rootstock testnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 31 };
      expect(getRecoveryParam(afterForkChain, 97)).toEqual(0);
      expect(getRecoveryParam(afterForkChain, 98)).toEqual(1);
      // Kovan
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 42 };
      expect(getRecoveryParam(afterForkChain, 119)).toEqual(0);
      expect(getRecoveryParam(afterForkChain, 120)).toEqual(1);
      // Ethereum Classic mainnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 61 };
      expect(getRecoveryParam(afterForkChain, 157)).toEqual(0);
      expect(getRecoveryParam(afterForkChain, 158)).toEqual(1);
      // Ethereum Classic testnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 62 };
      expect(getRecoveryParam(afterForkChain, 159)).toEqual(0);
      expect(getRecoveryParam(afterForkChain, 160)).toEqual(1);
      // ewasm testnet
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 66 };
      expect(getRecoveryParam(afterForkChain, 167)).toEqual(0);
      expect(getRecoveryParam(afterForkChain, 168)).toEqual(1);
      // Geth private chains (default)
      afterForkChain = { forkState: BlknumForkState.Forked, chainId: 1337 };
      expect(getRecoveryParam(afterForkChain, 2709)).toEqual(0);
      expect(getRecoveryParam(afterForkChain, 2710)).toEqual(1);
    });

    it("error for invalid inputs", () => {
      // before eip155 implementation
      const previousForkChain: Eip155ChainId = { forkState: BlknumForkState.Before };
      expect(() => getRecoveryParam(previousForkChain, 43)).toThrowError(
        /transaction not supported before eip155 implementation/,
      );
      expect(() => getRecoveryParam(previousForkChain, 44)).toThrowError(
        /transaction not supported before eip155 implementation/,
      );
      // after eip155 implementation but chain id 0
      const invalidChain: Eip155ChainId = { forkState: BlknumForkState.Forked, chainId: 0 };
      expect(() => getRecoveryParam(invalidChain, 43)).toThrowError(
        /transaction not supported before eip155 implementation/,
      );
      expect(() => getRecoveryParam(invalidChain, 44)).toThrowError(
        /transaction not supported before eip155 implementation/,
      );
    });

    it("handles pre-eip255 signatures", () => {
      const rinkeby: Eip155ChainId = { forkState: BlknumForkState.Forked, chainId: 4 };
      expect(getRecoveryParam(rinkeby, 27)).toEqual(0);
      expect(getRecoveryParam(rinkeby, 28)).toEqual(1);
    });
  });

  describe("decodeHeadTail", () => {
    it("works for single string", () => {
      const data = Encoding.fromHex(
        `
        0000000000000000000000000000000000000000000000000000000000000020
        0000000000000000000000000000000000000000000000000000000000000003
        4153480000000000000000000000000000000000000000000000000000000000
      `.replace(/\s+/g, ""),
      );
      const result = decodeHeadTail(data);
      expect(result).toEqual({
        head: [32],
        tail: [
          fromHex(
            "00000000000000000000000000000000000000000000000000000000000000034153480000000000000000000000000000000000000000000000000000000000",
          ),
        ],
      });
    });

    it("works for multiple numbers", () => {
      // data from https://medium.com/@hayeah/how-to-decipher-a-smart-contract-method-call-8ee980311603
      const data = Encoding.fromHex(
        `
          0000000000000000000000000000000000000000000000000000000000000060
          00000000000000000000000000000000000000000000000000000000000000e0
          0000000000000000000000000000000000000000000000000000000000000160
          0000000000000000000000000000000000000000000000000000000000000003
          00000000000000000000000000000000000000000000000000000000000000a1
          00000000000000000000000000000000000000000000000000000000000000a2
          00000000000000000000000000000000000000000000000000000000000000a3
          0000000000000000000000000000000000000000000000000000000000000003
          00000000000000000000000000000000000000000000000000000000000000b1
          00000000000000000000000000000000000000000000000000000000000000b2
          00000000000000000000000000000000000000000000000000000000000000b3
          0000000000000000000000000000000000000000000000000000000000000003
          00000000000000000000000000000000000000000000000000000000000000c1
          00000000000000000000000000000000000000000000000000000000000000c2
          00000000000000000000000000000000000000000000000000000000000000c3
        `.replace(/\s+/g, ""),
      );
      const result = decodeHeadTail(data);
      expect(result).toEqual({
        head: [96, 224, 352],
        tail: [
          fromHex(
            "000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000a100000000000000000000000000000000000000000000000000000000000000a200000000000000000000000000000000000000000000000000000000000000a3",
          ),
          fromHex(
            "000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000b100000000000000000000000000000000000000000000000000000000000000b200000000000000000000000000000000000000000000000000000000000000b3",
          ),
          fromHex(
            "000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000c100000000000000000000000000000000000000000000000000000000000000c200000000000000000000000000000000000000000000000000000000000000c3",
          ),
        ],
      });
    });

    it("throws for empty input", () => {
      expect(() => decodeHeadTail(new Uint8Array([]))).toThrowError(/input data empty/i);
    });

    it("throws for input not divisible by 32", () => {
      // 1, 31, 33
      expect(() => decodeHeadTail(fromHex("00"))).toThrowError(/input data length not divisible by 32/i);
      expect(() =>
        decodeHeadTail(fromHex("00000000000000000000000000000000000000000000000000000000000000")),
      ).toThrowError(/input data length not divisible by 32/i);
      expect(() =>
        decodeHeadTail(fromHex("000000000000000000000000000000000000000000000000000000000000000000")),
      ).toThrowError(/input data length not divisible by 32/i);
    });

    it("throws for invalid head length", () => {
      // 0
      expect(() =>
        decodeHeadTail(fromHex("0000000000000000000000000000000000000000000000000000000000000000")),
      ).toThrowError(/invalid head length/i);
      // not divisible by 32
      expect(() =>
        decodeHeadTail(fromHex("0000000000000000000000000000000000000000000000000000000000000000")),
      ).toThrowError(/invalid head length/i);
      expect(() =>
        decodeHeadTail(fromHex("0000000000000000000000000000000000000000000000000000000000000001")),
      ).toThrowError(/invalid head length/i);
      expect(() =>
        decodeHeadTail(fromHex("0000000000000000000000000000000000000000000000000000000000000019")),
      ).toThrowError(/invalid head length/i);
      // outside of content
      expect(() =>
        decodeHeadTail(fromHex("0000000000000000000000000000000000000000000000000000000000000020")),
      ).toThrowError(/invalid head length/i);
      expect(() =>
        decodeHeadTail(
          fromHex(
            "00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000",
          ),
        ),
      ).toThrowError(/invalid head length/i);
    });

    it("throws for start position inside of header", () => {
      // Second start position 32 (0x20) lower than first argument start position 64 (0x40)
      expect(() =>
        decodeHeadTail(
          fromHex(
            "000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000",
          ),
        ),
      ).toThrowError(/start position inside the header/i);
    });
  });

  describe("decodeVariableLength", () => {
    it("works for a three byte string", () => {
      const data = Encoding.fromHex(
        `
        0000000000000000000000000000000000000000000000000000000000000003
        4153480000000000000000000000000000000000000000000000000000000000
      `.replace(/\s+/g, ""),
      );
      const result = decodeVariableLength(data);
      expect(result).toEqual(fromHex("415348"));
    });

    it("works for 48 byte string", () => {
      const data = Encoding.fromHex(
        `
        0000000000000000000000000000000000000000000000000000000000000030
        6161616161616161616161616161616161616161616161616161616161616161
        6161616161616161616161616161616100000000000000000000000000000000
      `.replace(/\s+/g, ""),
      );
      const result = decodeVariableLength(data);
      expect(result).toEqual(
        fromHex(
          "616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161",
        ),
      );
    });

    it("works for 0 byte string", () => {
      const data = Encoding.fromHex(
        `
        0000000000000000000000000000000000000000000000000000000000000000
      `.replace(/\s+/g, ""),
      );
      const result = decodeVariableLength(data);
      expect(result).toEqual(fromHex(""));
    });
  });
});
