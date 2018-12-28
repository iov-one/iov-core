/// <reference lib="dom" />

import { JsonRpcClient } from "./jsonrpcclient";

describe("JsonRpcClient", () => {
  const dummyserviceKarmaUrl = "/base/dist/web/dummyservice.worker.js";

  it("can be constructed with a Worker", () => {
    const worker = new Worker(dummyserviceKarmaUrl);
    const client = new JsonRpcClient(worker);
    expect(client).toBeTruthy();
    worker.terminate();
  });

  it("can communicate with worker", async () => {
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
});
