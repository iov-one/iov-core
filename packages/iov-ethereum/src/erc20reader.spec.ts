import { Address, Algorithm, PubkeyBytes } from "@iov/bcp";
import { Random, Secp256k1 } from "@iov/crypto";
import { fromHex } from "@iov/encoding";
import { isJsonRpcErrorResponse } from "@iov/jsonrpc";
import BN from "bn.js";

import { pubkeyToAddress } from "./address";
import { Erc20Options } from "./erc20";
import { Erc20Reader, EthereumRpcClient } from "./erc20reader";
import { HttpEthereumRpcClient } from "./httpethereumrpcclient";
import { testConfig } from "./testconfig.spec";
import { normalizeHex, toEthereumHex } from "./utils";

function skipTests(): boolean {
  return !process.env.ETHEREUM_ENABLED;
}

function pendingWithoutEthereum(): void {
  if (skipTests()) {
    return pending("Set ETHEREUM_ENABLED to enable ethereum-node-based tests");
  }
}

async function randomAddress(): Promise<Address> {
  const keypair = await Secp256k1.makeKeypair(Random.getBytes(32));
  return pubkeyToAddress({
    algo: Algorithm.Secp256k1,
    data: keypair.pubkey as PubkeyBytes,
  });
}

function makeClient(baseUrl: string): EthereumRpcClient {
  return {
    ethCall: async (contractAddress: Address, data: Uint8Array) => {
      // see https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_call
      const response = await new HttpEthereumRpcClient(baseUrl).run({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{ to: contractAddress, data: toEthereumHex(data) }, "latest"],
        id: 42,
      });
      if (isJsonRpcErrorResponse(response)) {
        throw new Error(JSON.stringify(response.error));
      }

      return fromHex(normalizeHex(response.result));
    },
  };
}

describe("Erc20Reader", () => {
  const ashToken: Erc20Options = {
    contractAddress: "0xCb642A87923580b6F7D07D1471F93361196f2650" as Address,
    decimals: 12,
    symbol: "ASH",
  };
  const trashToken: Erc20Options = {
    contractAddress: "0xF01231195AE56d38fa03F5F2933863A2606A6052" as Address,
    decimals: 9,
    symbol: "TRASH",
    name: "Trash Token",
  };

  it("can query total supply", async () => {
    pendingWithoutEthereum();

    const reader = new Erc20Reader(makeClient(testConfig.baseHttp), ashToken);
    const result = await reader.totalSupply();
    expect(result).toBeTruthy();
    expect(result.gt(new BN(33_445566))).toEqual(true);
    expect(result.lt(new BN(5000_000000))).toEqual(true);
  });

  describe("balanceOf", () => {
    it("works for address with balance", async () => {
      pendingWithoutEthereum();

      const reader = new Erc20Reader(makeClient(testConfig.baseHttp), ashToken);
      const result = await reader.balanceOf(testConfig.accountStates.default.address);
      expect(result.toString()).toEqual("33445566");
    });

    it("works for unused address", async () => {
      pendingWithoutEthereum();

      const reader = new Erc20Reader(makeClient(testConfig.baseHttp), ashToken);
      const result = await reader.balanceOf(await randomAddress());
      expect(result.toString()).toEqual("0");
    });
  });

  describe("symbol", () => {
    it("works if set on-chain", async () => {
      pendingWithoutEthereum();

      const reader = new Erc20Reader(makeClient(testConfig.baseHttp), ashToken);
      const result = await reader.symbol();
      expect(result).toEqual("ASH");
    });

    it("returns configured value if set", async () => {
      pendingWithoutEthereum();

      const reader = new Erc20Reader(makeClient(testConfig.baseHttp), trashToken);
      const result = await reader.symbol();
      expect(result).toEqual("TRASH");
    });
  });

  describe("name", () => {
    it("works if set on-chain", async () => {
      pendingWithoutEthereum();

      const reader = new Erc20Reader(makeClient(testConfig.baseHttp), ashToken);
      const result = await reader.name();
      expect(result).toEqual("Ash Token");
    });

    it("returns configured value if set", async () => {
      pendingWithoutEthereum();

      const reader = new Erc20Reader(makeClient(testConfig.baseHttp), trashToken);
      const result = await reader.name();
      expect(result).toEqual("Trash Token");
    });
  });

  describe("decimals", () => {
    it("works if set on-chain", async () => {
      pendingWithoutEthereum();

      const reader = new Erc20Reader(makeClient(testConfig.baseHttp), ashToken);
      const result = await reader.decimals();
      expect(result).toEqual(12);
    });

    it("returns configured value if set", async () => {
      pendingWithoutEthereum();

      const reader = new Erc20Reader(makeClient(testConfig.baseHttp), trashToken);
      const result = await reader.decimals();
      expect(result).toEqual(9);
    });
  });
});
