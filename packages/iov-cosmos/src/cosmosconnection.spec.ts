import { Address, Algorithm, PubkeyBytes } from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import { CosmosConnection } from "./cosmosconnection";

const { fromBase64 } = Encoding;

function pendingWithoutCosmos(): void {
  if (!process.env.COSMOS_ENABLED) {
    return pending("Set COSMOS_ENABLED to enable Cosmos node-based tests");
  }
}

describe("CosmosConnection", () => {
  const httpUrl = "http://localhost:1317";
  const defaultChainId = "testing";
  const defaultEmptyAddress = "cosmos1h806c7khnvmjlywdrkdgk2vrayy2mmvf9rxk2r" as Address;
  const defaultAddress = "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6" as Address;
  const defaultPubkey = {
    algo: Algorithm.Secp256k1,
    data: fromBase64("A08EGB7ro1ORuFhjOnZcSgwYlpe0DSFjVNUIkNNQxwKQ") as PubkeyBytes,
  };

  describe("establish", () => {
    it("can connect to Cosmos via http", async () => {
      pendingWithoutCosmos();
      const connection = await CosmosConnection.establish(httpUrl);
      expect(connection).toBeTruthy();
      connection.disconnect();
    });
  });

  describe("chainId", () => {
    it("displays the chain ID", async () => {
      pendingWithoutCosmos();
      const connection = await CosmosConnection.establish(httpUrl);
      const chainId = connection.chainId();
      expect(chainId).toEqual(defaultChainId);
      connection.disconnect();
    });
  });

  describe("height", () => {
    it("displays the current height", async () => {
      pendingWithoutCosmos();
      const connection = await CosmosConnection.establish(httpUrl);
      const height = await connection.height();
      expect(height).toBeGreaterThan(0);
      connection.disconnect();
    });
  });

  describe("getAccount", () => {
    it("gets an empty account by address", async () => {
      pendingWithoutCosmos();
      const connection = await CosmosConnection.establish(httpUrl);
      const account = await connection.getAccount({ address: defaultEmptyAddress });
      expect(account).toBeUndefined();
      connection.disconnect();
    });

    it("gets an account by address", async () => {
      pendingWithoutCosmos();
      const connection = await CosmosConnection.establish(httpUrl);
      const account = await connection.getAccount({ address: defaultAddress });
      if (account === undefined) {
        throw new Error("Expected account not to be undefined");
      }
      expect(account.address).toEqual(defaultAddress);
      expect(account.pubkey).toEqual(defaultPubkey);
      expect(account.balance.length).toEqual(2);
      connection.disconnect();
    });

    it("gets an account by pubkey", async () => {
      pendingWithoutCosmos();
      const connection = await CosmosConnection.establish(httpUrl);
      const account = await connection.getAccount({ pubkey: defaultPubkey });
      if (account === undefined) {
        throw new Error("Expected account not to be undefined");
      }
      expect(account.address).toEqual(defaultAddress);
      expect(account.pubkey).toEqual({
        algo: Algorithm.Secp256k1,
        data: fromBase64("A08EGB7ro1ORuFhjOnZcSgwYlpe0DSFjVNUIkNNQxwKQ"),
      });
      expect(account.balance.length).toEqual(2);
      connection.disconnect();
    });
  });
});
