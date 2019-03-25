import BN = require("bn.js");

import { Address, Algorithm, PublicKeyBytes } from "@iov/bcp";
import { Random, Secp256k1 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { isJsonRpcErrorResponse } from "@iov/jsonrpc";

import { pubkeyToAddress } from "./address";
import { Erc20, Erc20Options, EthereumRpcClient } from "./erc20";
import { HttpJsonRpcClient } from "./httpjsonrpcclient";
import { testConfig } from "./testconfig.spec";
import { normalizeHex } from "./utils";

function skipTests(): boolean {
  return !process.env.ETHEREUM_ENABLED;
}

function pendingWithoutEthereum(): void {
  if (skipTests()) {
    return pending("Set ETHEREUM_ENABLED to enable ethereum-node-based tests");
  }
}

async function randomAddress(): Promise<Address> {
  const keypair = await Secp256k1.makeKeypair(await Random.getBytes(32));
  return pubkeyToAddress({
    algo: Algorithm.Secp256k1,
    data: keypair.pubkey as PublicKeyBytes,
  });
}

function makeClient(baseUrl: string): EthereumRpcClient {
  return {
    ethCall: async (contractAddress: Address, data: Uint8Array) => {
      // see https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_call
      const response = await new HttpJsonRpcClient(baseUrl).run({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{ to: contractAddress, data: `0x${Encoding.toHex(data)}` }, "latest"],
        id: 42,
      });
      if (isJsonRpcErrorResponse(response)) {
        throw new Error(JSON.stringify(response.error));
      }

      return Encoding.fromHex(normalizeHex(response.result));
    },
  };
}

describe("Erc20", () => {
  const ashToken: Erc20Options = {
    contractAddress: "0xCb642A87923580b6F7D07D1471F93361196f2650" as Address,
    hasDecimals: true,
    hasSymbol: true,
    hasName: true,
  };
  const trashToken: Erc20Options = {
    contractAddress: "0x9768ae2339B48643d710B11dDbDb8A7eDBEa15BC" as Address,
    hasDecimals: false,
    hasSymbol: false,
    hasName: false,
  };

  it("can query total supply", async () => {
    pendingWithoutEthereum();

    const contract = new Erc20(makeClient(testConfig.base), ashToken);
    const result = await contract.totalSupply();
    expect(result).toBeTruthy();
    expect(result.gt(new BN(33_445566))).toEqual(true);
    expect(result.lt(new BN(5000_000000))).toEqual(true);
  });

  describe("balanceOf", () => {
    it("works for address with balance", async () => {
      pendingWithoutEthereum();

      const contract = new Erc20(makeClient(testConfig.base), ashToken);
      const result = await contract.balanceOf(testConfig.accountState.address);
      expect(result.toString()).toEqual("33445566");
    });

    it("works for unused address", async () => {
      pendingWithoutEthereum();

      const contract = new Erc20(makeClient(testConfig.base), ashToken);
      const result = await contract.balanceOf(await randomAddress());
      expect(result.toString()).toEqual("0");
    });
  });

  describe("symbol", () => {
    it("works if set on-chain", async () => {
      pendingWithoutEthereum();

      const contract = new Erc20(makeClient(testConfig.base), ashToken);
      const result = await contract.symbol();
      expect(result).toEqual("ASH");
    });

    it("returns undefined if not set on-chain", async () => {
      pendingWithoutEthereum();

      const contract = new Erc20(makeClient(testConfig.base), trashToken);
      const result = await contract.symbol();
      expect(result).toBeUndefined();
    });
  });

  describe("name", () => {
    it("works if set on-chain", async () => {
      pendingWithoutEthereum();

      const contract = new Erc20(makeClient(testConfig.base), ashToken);
      const result = await contract.name();
      expect(result).toEqual("Ash Token");
    });

    it("returns undefined if not set on-chain", async () => {
      pendingWithoutEthereum();

      const contract = new Erc20(makeClient(testConfig.base), trashToken);
      const result = await contract.name();
      expect(result).toBeUndefined();
    });
  });

  describe("decimals", () => {
    it("works if set on-chain", async () => {
      pendingWithoutEthereum();

      const contract = new Erc20(makeClient(testConfig.base), ashToken);
      const result = await contract.decimals();
      expect(result!.toNumber()).toEqual(12);
    });

    it("returns undefined if not set on-chain", async () => {
      pendingWithoutEthereum();

      const contract = new Erc20(makeClient(testConfig.base), trashToken);
      const result = await contract.decimals();
      expect(result).toBeUndefined();
    });
  });
});
