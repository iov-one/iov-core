/// <reference lib="dom" />

import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  PublicIdentity,
  PublicKeyBytes,
  SendTransaction,
  TokenTicker,
  TransactionId,
} from "@iov/bcp-types";
import { bnsCodec, bnsConnector } from "@iov/bns";
import { Ed25519, Random } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { JsonRpcClient } from "@iov/jsonrpc";
import { toListPromise } from "@iov/stream";

const { fromHex } = Encoding;

function pendingWithoutBnsd(): void {
  if (!process.env.BNSD_ENABLED) {
    pending("Set BNSD_ENABLED to enable bnsd-based tests");
  }
}

function pendingWithoutEthereum(): void {
  if (!process.env.ETHEREUM_ENABLED) {
    pending("Set ETHEREUM_ENABLED to enable ethereum-based tests");
  }
}

function pendingWithoutWorker(): void {
  if (typeof Worker === "undefined") {
    pending("Environment without WebWorker support detected. Marked as pending.");
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function randomBnsAddress(): Promise<Address> {
  const rawKeypair = await Ed25519.makeKeypair(await Random.getBytes(32));
  const randomIdentity: PublicIdentity = {
    chainId: "some-testnet" as ChainId,
    pubkey: {
      algo: Algorithm.Ed25519,
      data: rawKeypair.pubkey as PublicKeyBytes,
    },
  };
  return bnsCodec.identityToAddress(randomIdentity);
}

describe("signingservice.worker", () => {
  const bnsdUrl = "ws://localhost:22345";
  const signingserviceKarmaUrl = "/base/dist/web/signingservice.worker.js";
  // time to wait until service is initialized and conected to chain
  const signingserviceBootTime = 1_500;

  const ganacheChainId = "5777" as ChainId;
  const ganacheSecondIdentity: PublicIdentity = {
    chainId: ganacheChainId,
    pubkey: {
      algo: Algorithm.Secp256k1,
      data: Encoding.fromHex(
        "041d4c015b00cbd914e280b871d3c6ae2a047ca650d3ecea4b5246bb3036d4d74960b7feb09068164d2b82f1c7df9e95839b29ae38e90d60578b2318a54e108cf8",
      ) as PublicKeyBytes,
    },
  };

  const defaultAmount: Amount = {
    quantity: "1",
    fractionalDigits: 9,
    tokenTicker: "CASH" as TokenTicker,
  };

  it("can get bnsd identities", async () => {
    pendingWithoutBnsd();
    pendingWithoutWorker();

    const bnsChain = (await bnsConnector(bnsdUrl).client()).chainId();

    const worker = new Worker(signingserviceKarmaUrl);
    await sleep(signingserviceBootTime);

    const client = new JsonRpcClient(worker);
    const response = await client.run({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: ["Who are you?", bnsChain],
    });
    expect(response.jsonrpc).toEqual("2.0");
    expect(response.id).toEqual(123);
    expect(response.result).toEqual(jasmine.any(Array));
    expect((response.result as ReadonlyArray<any>).length).toEqual(1);
    expect(response.result[0].chainId).toEqual(bnsChain);
    expect(response.result[0].pubkey.algo).toEqual("ed25519");
    expect(response.result[0].pubkey.data).toEqual(
      fromHex("533e376559fa551130e721735af5e7c9fcd8869ddd54519ee779fce5984d7898"),
    );

    worker.terminate();
  });

  it("can get ethereum identities", async () => {
    pendingWithoutEthereum();
    pendingWithoutWorker();

    const worker = new Worker(signingserviceKarmaUrl);
    await sleep(signingserviceBootTime);

    const client = new JsonRpcClient(worker);
    const response = await client.run({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: ["Who are you?", ganacheChainId],
    });
    expect(response.jsonrpc).toEqual("2.0");
    expect(response.id).toEqual(123);
    expect(response.result).toEqual(jasmine.any(Array));
    expect((response.result as ReadonlyArray<any>).length).toEqual(1);
    expect(response.result[0]).toEqual(ganacheSecondIdentity);

    worker.terminate();
  });

  it("send a signing request to service", async () => {
    pendingWithoutBnsd();
    pendingWithoutWorker();

    const bnsConnection = await bnsConnector(bnsdUrl).client();

    const worker = new Worker(signingserviceKarmaUrl);
    await sleep(signingserviceBootTime);

    const client = new JsonRpcClient(worker);

    const identitiesResponse = await client.run({
      jsonrpc: "2.0",
      id: 1,
      method: "getIdentities",
      params: ["Who are you?", bnsConnection.chainId()],
    });
    const signer: PublicIdentity = identitiesResponse.result[0];

    const send: SendTransaction = {
      kind: "bcp/send",
      chainId: bnsConnection.chainId(),
      signer: signer.pubkey,
      memo: `Hello ${Math.random()}`,
      amount: defaultAmount,
      recipient: await randomBnsAddress(),
    };

    const signAndPostResponse = await client.run({
      jsonrpc: "2.0",
      id: 2,
      method: "signAndPost",
      params: ["Please sign", send],
    });
    const transactionId: TransactionId = signAndPostResponse.result;
    expect(transactionId).toMatch(/^[0-9A-F]+$/);

    const transactionSearch = await toListPromise(bnsConnection.liveTx({ id: transactionId }), 1);
    expect(transactionSearch[0].transactionId).toEqual(transactionId);
    expect(transactionSearch[0].transaction).toEqual(send);

    worker.terminate();
  });
});
