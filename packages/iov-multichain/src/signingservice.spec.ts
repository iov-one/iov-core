/// <reference lib="dom" />

import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  Identity,
  isConfirmedTransaction,
  isIdentity,
  PubkeyBundle,
  PubkeyBytes,
  SendTransaction,
  TokenTicker,
  TransactionId,
} from "@iov/bcp";
import { bnsCodec, createBnsConnector } from "@iov/bns";
import { Ed25519, Random } from "@iov/crypto";
import { fromHex, TransactionEncoder } from "@iov/encoding";
import {
  JsonRpcClient,
  JsonRpcRequest,
  JsonRpcResponse,
  parseJsonRpcResponse,
  SimpleMessagingConnection,
} from "@iov/jsonrpc";
import { firstEvent } from "@iov/stream";
import { sleep } from "@iov/utils";
import { Producer, Stream } from "xstream";

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

async function randomBnsAddress(): Promise<Address> {
  const rawKeypair = await Ed25519.makeKeypair(Random.getBytes(32));
  const randomIdentity: Identity = {
    chainId: "some-testnet" as ChainId,
    pubkey: {
      algo: Algorithm.Ed25519,
      data: rawKeypair.pubkey as PubkeyBytes,
    },
  };
  return bnsCodec.identityToAddress(randomIdentity);
}

function makeSimpleMessagingConnection(
  worker: Worker,
): SimpleMessagingConnection<JsonRpcRequest, JsonRpcResponse> {
  const producer: Producer<JsonRpcResponse> = {
    start: (listener) => {
      // tslint:disable-next-line:no-object-mutation
      worker.onmessage = (event) => {
        listener.next(parseJsonRpcResponse(event.data));
      };
    },
    stop: () => {
      // tslint:disable-next-line:no-object-mutation
      worker.onmessage = null;
    },
  };

  return {
    responseStream: Stream.create(producer),
    sendRequest: (request) => worker.postMessage(request),
  };
}

describe("signingservice.worker", () => {
  const bnsdUrl = "ws://localhost:23456";
  const bnsChainId = "local-iov-devnet";

  const signingserviceKarmaUrl = "/base/dist/web/signingservice.worker.js";
  // time to wait until service is initialized and connected to chain
  const signingserviceBootTime = 2_000;

  const bnsdFaucetPubkey: PubkeyBundle = {
    algo: Algorithm.Ed25519,
    data: fromHex("e05f47e7639b47625c23738e2e46d092819abd6039c5fc550d9aa37f1a2556a1") as PubkeyBytes,
  };

  const ganacheChainId = "ethereum-eip155-5777" as ChainId;
  const ganacheSecondIdentity: Identity = {
    chainId: ganacheChainId,
    pubkey: {
      algo: Algorithm.Secp256k1,
      data: fromHex(
        "041d4c015b00cbd914e280b871d3c6ae2a047ca650d3ecea4b5246bb3036d4d74960b7feb09068164d2b82f1c7df9e95839b29ae38e90d60578b2318a54e108cf8",
      ) as PubkeyBytes,
    },
  };

  const defaultAmount: Amount = {
    quantity: "1",
    fractionalDigits: 9,
    tokenTicker: "CASH" as TokenTicker,
  };

  it("can get bnsd identities", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();
    pendingWithoutWorker();

    const worker = new Worker(signingserviceKarmaUrl);
    await sleep(signingserviceBootTime);

    const client = new JsonRpcClient(makeSimpleMessagingConnection(worker));
    const response = await client.run({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: {
        reason: "string:Who are you?",
        chainIds: [`string:${bnsChainId}`],
      },
    });
    expect(response.id).toEqual(123);
    const result = TransactionEncoder.fromJson(response.result);
    expect(result).toEqual(jasmine.any(Array));
    expect((result as readonly any[]).length).toEqual(1);
    expect(result[0]).toEqual({
      chainId: bnsChainId,
      pubkey: bnsdFaucetPubkey,
    });

    worker.terminate();
  });

  it("can get ethereum identities", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();
    pendingWithoutWorker();

    const worker = new Worker(signingserviceKarmaUrl);
    await sleep(signingserviceBootTime);

    const client = new JsonRpcClient(makeSimpleMessagingConnection(worker));
    const response = await client.run({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: {
        reason: "string:Who are you?",
        chainIds: [`string:${ganacheChainId}`],
      },
    });
    expect(response.id).toEqual(123);
    const result = TransactionEncoder.fromJson(response.result);
    expect(result).toEqual(jasmine.any(Array));
    expect((result as readonly any[]).length).toEqual(1);
    expect(result[0]).toEqual(ganacheSecondIdentity);

    worker.terminate();
  });

  it("can get BNS or Ethereum identities", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();
    pendingWithoutWorker();

    const worker = new Worker(signingserviceKarmaUrl);
    await sleep(signingserviceBootTime);

    const client = new JsonRpcClient(makeSimpleMessagingConnection(worker));
    const response = await client.run({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: {
        reason: "string:Who are you?",
        chainIds: [`string:${ganacheChainId}`, `string:${bnsChainId}`],
      },
    });
    expect(response.id).toEqual(123);

    const result = TransactionEncoder.fromJson(response.result);
    expect(result).toEqual(jasmine.any(Array));
    expect((result as readonly any[]).length).toEqual(2);
    expect(result[0]).toEqual({
      chainId: bnsChainId,
      pubkey: bnsdFaucetPubkey,
    });
    expect(result[1]).toEqual(ganacheSecondIdentity);

    worker.terminate();
  });

  it("handles signing requests", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();
    pendingWithoutWorker();

    const bnsConnection = await createBnsConnector(bnsdUrl).establishConnection();

    const worker = new Worker(signingserviceKarmaUrl);
    await sleep(signingserviceBootTime);

    const client = new JsonRpcClient(makeSimpleMessagingConnection(worker));

    const identitiesResponse = await client.run({
      jsonrpc: "2.0",
      id: 1,
      method: "getIdentities",
      params: {
        reason: "string:Who are you?",
        chainIds: [`string:${bnsConnection.chainId}`],
      },
    });

    const result = TransactionEncoder.fromJson(identitiesResponse.result);
    expect(result).toEqual(jasmine.any(Array));
    expect((result as readonly any[]).length).toEqual(1);
    const signer = result[0];
    if (!isIdentity(signer)) {
      throw new Error("Identity element is not valid");
    }

    const send = await bnsConnection.withDefaultFee<SendTransaction>(
      {
        kind: "bcp/send",
        chainId: signer.chainId,
        sender: bnsCodec.identityToAddress(signer),
        memo: `Hello ${Math.random()}`,
        amount: defaultAmount,
        recipient: await randomBnsAddress(),
      },
      "tiov1q5lyl7asgr2dcweqrhlfyexqpkgcuzrm4e0cku" as Address,
    );

    const signAndPostResponse = await client.run({
      jsonrpc: "2.0",
      id: 2,
      method: "signAndPost",
      params: {
        reason: "string:Please sign",
        signer: TransactionEncoder.toJson(signer),
        transaction: TransactionEncoder.toJson(send),
      },
    });
    const transactionId: TransactionId = TransactionEncoder.fromJson(signAndPostResponse.result);
    expect(transactionId).toMatch(/^[0-9A-F]+$/);

    const transactionResult = await firstEvent(bnsConnection.liveTx({ id: transactionId }));
    if (!isConfirmedTransaction(transactionResult)) {
      throw new Error("Expected confirmed transaction");
    }
    expect(transactionResult.transactionId).toEqual(transactionId);
    expect(transactionResult.transaction).toEqual(send);

    worker.terminate();
    bnsConnection.disconnect();
  });
});
