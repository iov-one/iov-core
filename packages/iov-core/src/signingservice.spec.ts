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
import { SimpleMessagingConnection } from "@iov/jsonrpc";
import { firstEvent } from "@iov/stream";
import {
  JsRpcClient,
  JsRpcCompatibleDictionary,
  JsRpcRequest,
  JsRpcResponse,
  parseJsRpcErrorResponse,
  parseJsRpcResponse,
} from "./jsrpc";

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
): SimpleMessagingConnection<JsRpcRequest, JsRpcResponse> {
  const producer: Producer<JsRpcResponse> = {
    start: listener => {
      // tslint:disable-next-line:no-object-mutation
      worker.onmessage = event => {
        // console.log("Got message from connection", event);
        const responseError = parseJsRpcErrorResponse(event.data);
        if (responseError) {
          listener.next(responseError);
        } else {
          const response = parseJsRpcResponse(event.data);
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

    const client = new JsRpcClient(makeSimpleMessagingConnection(worker));
    const response = await client.run({
      id: 123,
      method: "getIdentities",
      params: {
        reason: "Who are you?",
        chainIds: [bnsConnection.chainId()],
      },
    });
    expect(response.id).toEqual(123);
    expect(response.result).toEqual(jasmine.any(Array));
    expect((response.result as ReadonlyArray<any>).length).toEqual(1);
    expect(response.result[0].chainId).toEqual(bnsConnection.chainId());
    expect(response.result[0].pubkey.algo).toEqual("ed25519");
    expect(response.result[0].pubkey.data).toEqual(
      fromHex("533e376559fa551130e721735af5e7c9fcd8869ddd54519ee779fce5984d7898"),
    );

    worker.terminate();
    bnsConnection.disconnect();
  });

  it("can get ethereum identities", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();
    pendingWithoutWorker();

    const worker = new Worker(signingserviceKarmaUrl);
    await sleep(signingserviceBootTime);

    const client = new JsRpcClient(makeSimpleMessagingConnection(worker));
    const response = await client.run({
      id: 123,
      method: "getIdentities",
      params: {
        reason: "Who are you?",
        chainIds: [ganacheChainId],
      },
    });
    expect(response.id).toEqual(123);
    expect(response.result).toEqual(jasmine.any(Array));
    expect((response.result as ReadonlyArray<any>).length).toEqual(1);
    expect(response.result[0]).toEqual(ganacheSecondIdentity);

    worker.terminate();
  });

  it("can get BNS or Ethereum identities", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();
    pendingWithoutWorker();

    const bnsConnection = await bnsConnector(bnsdUrl).client();

    const worker = new Worker(signingserviceKarmaUrl);
    await sleep(signingserviceBootTime);

    const client = new JsRpcClient(makeSimpleMessagingConnection(worker));
    const response = await client.run({
      id: 123,
      method: "getIdentities",
      params: {
        reason: "Who are you?",
        chainIds: [ganacheChainId, bnsConnection.chainId()],
      },
    });
    expect(response.id).toEqual(123);
    expect(response.result).toEqual(jasmine.any(Array));
    expect((response.result as ReadonlyArray<any>).length).toEqual(2);
    expect(response.result[0].chainId).toEqual(bnsConnection.chainId());
    expect(response.result[0].pubkey.algo).toEqual("ed25519");
    expect(response.result[0].pubkey.data).toEqual(
      fromHex("533e376559fa551130e721735af5e7c9fcd8869ddd54519ee779fce5984d7898"),
    );
    expect(response.result[1]).toEqual(ganacheSecondIdentity);

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

    const client = new JsRpcClient(makeSimpleMessagingConnection(worker));

    const identitiesResponse = await client.run({
      id: 1,
      method: "getIdentities",
      params: {
        reason: "Who are you?",
        chainIds: [bnsConnection.chainId()],
      },
    });
    expect(identitiesResponse.result).toEqual(jasmine.any(Array));
    expect((identitiesResponse.result as ReadonlyArray<any>).length).toEqual(1);
    const signer = identitiesResponse.result[0];
    if (!isPublicIdentity(signer)) {
      throw new Error("Identity element is not valid");
    }

    const send = await bnsConnection.withDefaultFee<SendTransaction>({
      kind: "bcp/send",
      creator: signer,
      memo: `Hello ${Math.random()}`,
      amount: defaultAmount,
      recipient: await randomBnsAddress(),
    });

    const signAndPostResponse = await client.run({
      id: 2,
      method: "signAndPost",
      params: {
        reason: "Please sign",
        // Cast needed since type of indices of transaction is not string at compile time.
        // see https://stackoverflow.com/a/37006179/2013738
        transaction: (send as unknown) as JsRpcCompatibleDictionary,
      },
    });
    const transactionId: TransactionId = signAndPostResponse.result;
    expect(transactionId).toMatch(/^[0-9A-F]+$/);

    const result = await firstEvent(bnsConnection.liveTx({ id: transactionId }));
    if (!isConfirmedTransaction(result)) {
      throw new Error("Confirmed transaction extected");
    }
    expect(result.transactionId).toEqual(transactionId);
    expect(result.transaction).toEqual(send);

    worker.terminate();
    bnsConnection.disconnect();
  });
});
