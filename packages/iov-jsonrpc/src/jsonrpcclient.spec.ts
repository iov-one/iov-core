/// <reference lib="dom" />

import { JsonRpcClient } from "./jsonrpcclient";

function pendingWithoutWorker(): void {
  if (typeof Worker === "undefined") {
    pending("Environment without WebWorker support detected. Marked as pending.");
  }
}

describe("JsonRpcClient", () => {
  const dummyserviceKarmaUrl = "/base/dist/web/dummyservice.worker.js";

  it("can be constructed with a Worker", () => {
    pendingWithoutWorker();

    const worker = new Worker(dummyserviceKarmaUrl);
    const client = new JsonRpcClient(worker);
    expect(client).toBeTruthy();
    worker.terminate();
  });

  it("can communicate with worker", async () => {
    pendingWithoutWorker();

    const worker = new Worker(dummyserviceKarmaUrl);

    const client = new JsonRpcClient(worker);
    const response = await client.run({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: ["Who are you?"],
    });
    expect(response.jsonrpc).toEqual("2.0");
    expect(response.id).toEqual(123);
    expect(response.result).toEqual(`Called getIdentities("Who are you?")`);

    worker.terminate();
  });

  it("supports params as dictionary", async () => {
    pendingWithoutWorker();

    const worker = new Worker(dummyserviceKarmaUrl);

    const client = new JsonRpcClient(worker);
    const response = await client.run({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: {
        a: "Who are you?",
      },
    });
    expect(response.jsonrpc).toEqual("2.0");
    expect(response.id).toEqual(123);
    expect(response.result).toEqual(`Called getIdentities({"a":"Who are you?"})`);

    worker.terminate();
  });
});
