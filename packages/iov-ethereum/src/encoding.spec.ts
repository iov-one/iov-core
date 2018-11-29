import { BlknumForkState, Eip155ChainId, eip155V } from "./encoding";

describe("Ethereum encoding", () => {
  describe("eip155V", () => {
    it("verify valid inputs", () => {
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
    it("error for invalid inputs", () => {
      // before eip155 implementation
      const previousForkChain: Eip155ChainId = { forkState: BlknumForkState.Before };
      expect(() => eip155V(previousForkChain, 0)).toThrowError(
        /transaction not supported before eip155 implementation/,
      );
      expect(() => eip155V(previousForkChain, 1)).toThrowError(
        /transaction not supported before eip155 implementation/,
      );
      // after eip155 implementation but chain id 0
      const invalidChain: Eip155ChainId = { forkState: BlknumForkState.Forked, chainId: 0 };
      expect(() => eip155V(invalidChain, 0)).toThrowError(
        /transaction not supported before eip155 implementation/,
      );
      expect(() => eip155V(invalidChain, 1)).toThrowError(
        /transaction not supported before eip155 implementation/,
      );
    });
  });
});
