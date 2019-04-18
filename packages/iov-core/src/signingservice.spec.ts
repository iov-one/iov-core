/// <reference lib="dom" />

import { Producer, Stream } from "xstream";

import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  isConfirmedTransaction,
  isPublicIdentity,
  PublicIdentity,
  PublicKeyBytes,
  SendTransaction,
  TokenTicker,
  TransactionId,
} from "@iov/bcp";
import { bnsCodec, bnsConnector } from "@iov/bns";
import { Ed25519, Random } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import {
  JsonRpcClient,
  JsonRpcRequest,
  JsonRpcResponse,
  parseJsonRpcError,
  parseJsonRpcResponse,
  SimpleMessagingConnection,
} from "@iov/jsonrpc";
import { firstEvent } from "@iov/stream";

import { TransactionEncoder } from "./transactionencoder";

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

async function sleep(ms: number): Promise<void> {
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

function makeSimpleMessagingConnection(
  worker: Worker,
): SimpleMessagingConnection<JsonRpcRequest, JsonRpcResponse> {
  const producer: Producer<JsonRpcResponse> = {
    start: listener => {
      // tslint:disable-next-line:no-object-mutation
      worker.onmessage = event => {
        // console.log("Got message from connection", event);
        const responseError = parseJsonRpcError(event.data);
        if (responseError) {
          listener.next(responseError);
        } else {
          const response = parseJsonRpcResponse(event.data);
          listener.next(response);
        }
      };
    },
    stop: () => {
      // tslint:disable-next-line:no-object-mutation
      worker.onmessage = null;
    },
  };

  return {
    responseStream: Stream.create(producer),
    sendRequest: request => worker.postMessage(request),
  };
}

describe("signingservice.worker", () => {
  const bnsdUrl = "ws://localhost:23456";
  const signingserviceKarmaUrl = "/base/dist/web/signingservice.worker.js";
  // time to wait until service is initialized and conected to chain
  const signingserviceBootTime = 1_500;

  const ganacheChainId = "ethereum-eip155-5777" as ChainId;
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
    pendingWithoutEthereum();
    pendingWithoutWorker();

    const bnsConnection = await bnsConnector(bnsdUrl).client();

    const worker = new Worker(signingserviceKarmaUrl);
    await sleep(signingserviceBootTime);

    const client = new JsonRpcClient(makeSimpleMessagingConnection(worker));
    const response = await client.run({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: {
        reason: "Who are you?",
        chainIds: [bnsConnection.chainId()],
      },
    });
    expect(response.id).toEqual(123);
    const result = TransactionEncoder.fromJson(response.result);
    expect(result).toEqual(jasmine.any(Array));
    expect((result as ReadonlyArray<any>).length).toEqual(1);
    expect(result[0].chainId).toEqual(bnsConnection.chainId());
    expect(result[0].pubkey).toEqual({
      algo: Algorithm.Ed25519,
      data: fromHex("533e376559fa551130e721735af5e7c9fcd8869ddd54519ee779fce5984d7898"),
    });

    worker.terminate();
    bnsConnection.disconnect();
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
        reason: "Who are you?",
        chainIds: [ganacheChainId],
      },
    });
    expect(response.id).toEqual(123);
    const result = TransactionEncoder.fromJson(response.result);
    expect(result).toEqual(jasmine.any(Array));
    expect((result as ReadonlyArray<any>).length).toEqual(1);
    expect(result[0]).toEqual(ganacheSecondIdentity);

    worker.terminate();
  });

  it("can get BNS or Ethereum identities", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();
    pendingWithoutWorker();

    const bnsConnection = await bnsConnector(bnsdUrl).client();

    const worker = new Worker(signingserviceKarmaUrl);
    await sleep(signingserviceBootTime);

    const client = new JsonRpcClient(makeSimpleMessagingConnection(worker));
    const response = await client.run({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: {
        reason: "Who are you?",
        chainIds: [ganacheChainId, bnsConnection.chainId()],
      },
    });
    expect(response.id).toEqual(123);

    const result = TransactionEncoder.fromJson(response.result);
    expect(result).toEqual(jasmine.any(Array));
    expect((result as ReadonlyArray<any>).length).toEqual(2);
    expect(result[0].chainId).toEqual(bnsConnection.chainId());
    expect(result[0].pubkey).toEqual({
      algo: Algorithm.Ed25519,
      data: fromHex("533e376559fa551130e721735af5e7c9fcd8869ddd54519ee779fce5984d7898"),
    });
    expect(result[1]).toEqual(ganacheSecondIdentity);

    worker.terminate();
    bnsConnection.disconnect();
  });

  it("send a signing request to service", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();
    pendingWithoutWorker();

    const bnsConnection = await bnsConnector(bnsdUrl).client();

    const worker = new Worker(signingserviceKarmaUrl);
    await sleep(signingserviceBootTime);

    const client = new JsonRpcClient(makeSimpleMessagingConnection(worker));

    const identitiesResponse = await client.run({
      jsonrpc: "2.0",
      id: 1,
      method: "getIdentities",
      params: {
        reason: "Who are you?",
        chainIds: [bnsConnection.chainId()],
      },
    });

    const result = TransactionEncoder.fromJson(identitiesResponse.result);
    expect(result).toEqual(jasmine.any(Array));
    expect((result as ReadonlyArray<any>).length).toEqual(1);
    const signer = result[0];
    if (!isPublicIdentity(signer)) {
      throw new Error("Identity element is not valid");
    }

    const send: SendTransaction = {
      kind: "bcp/send",
      creator: signer,
      memo: `Hello ${Math.random()}`,
      amount: defaultAmount,
      recipient: await randomBnsAddress(),
    };

    const signAndPostResponse = await client.run({
      jsonrpc: "2.0",
      id: 2,
      method: "signAndPost",
      params: {
        reason: "Please sign",
        transaction: TransactionEncoder.toJson(send),
      },
    });
    const transactionId: TransactionId = TransactionEncoder.fromJson(signAndPostResponse.result);
    expect(transactionId).toMatch(/^[0-9A-F]+$/);

    const trandactionResult = await firstEvent(bnsConnection.liveTx({ id: transactionId }));
    if (!isConfirmedTransaction(trandactionResult)) {
      throw new Error("Confirmed transaction extected");
    }
    expect(trandactionResult.transactionId).toEqual(transactionId);
    expect(trandactionResult.transaction).toEqual(send);

    worker.terminate();
    bnsConnection.disconnect();
  });
});
