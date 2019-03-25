import BN = require("bn.js");

import { Address } from "@iov/bcp";
import { Encoding } from "@iov/encoding";
import { isJsonRpcErrorResponse } from "@iov/jsonrpc";

import { Erc20, EthereumRpcClient } from "./erc20";
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
  const ashTokenAddress = "0xCb642A87923580b6F7D07D1471F93361196f2650" as Address;

  it("can query total supply", async () => {
    pendingWithoutEthereum();

    const contract = new Erc20(makeClient(testConfig.base), ashTokenAddress);
    const result = await contract.totalSupply();
    expect(result).toBeTruthy();
    expect(result.gt(new BN(33_445566))).toEqual(true);
    expect(result.lt(new BN(5000_000000))).toEqual(true);
  });

  it("can query symbol", async () => {
    pendingWithoutEthereum();

    const contract = new Erc20(makeClient(testConfig.base), ashTokenAddress);
    const result = await contract.symbol();
    expect(result).toEqual("ASH");
  });

  it("can query name", async () => {
    pendingWithoutEthereum();

    const contract = new Erc20(makeClient(testConfig.base), ashTokenAddress);
    const result = await contract.name();
    expect(result).toEqual("Ash Token");
  });

  it("can query decimals", async () => {
    pendingWithoutEthereum();

    const contract = new Erc20(makeClient(testConfig.base), ashTokenAddress);
    const result = await contract.decimals();
    expect(result!.toNumber()).toEqual(12);
  });
});
