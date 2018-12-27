import { JsonRpcClient } from "./jsonrpcclient";

describe("JsonRpcClient", () => {
  const workerKarmaUrl = "/base/dist/web/worker.js";

  it("can be constructed with a Worker", () => {
    const worker = new Worker(workerKarmaUrl);
    const client = new JsonRpcClient(worker);
    expect(client).toBeTruthy();
    worker.terminate();
  });

  it("can communicate with worker", async () => {
    const worker = new Worker(workerKarmaUrl);

    const client = new JsonRpcClient(worker);
    const response = await client.run({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: ["Who are you?"],
    });
    expect(response.jsonrpc).toEqual("2.0");
    expect(response.id).toEqual(123);

    worker.terminate();
  });
});
