import { jsonRpcWith } from "./common";
import { Method } from "./requests";
import { HttpClient, HttpUriClient, RpcClient, WebsocketClient } from "./rpcclient";

// process.env is undefined in browser....
// but we can shim it in with webpack for the tests.
// good for browser tests, not so good for configuring production
const skipTests = (): boolean => !process.env.TENDERMINT_ENABLED;

const pendingWithoutTendermint = () => {
  if (skipTests()) {
    pending("Set TENDERMINT_ENABLED to enable tendermint-based tests");
  }
};

describe("Ensure RpcClients work", () => {
  // TODO: make flexible, support multiple versions, etc...
  const tendermintUrl = "localhost:12345";

  const shouldPass = async (client: RpcClient) => {
    const req = jsonRpcWith(Method.HEALTH);
    const res = await client.execute(req);
    // expect(res.id).toEqual(req.id);
    expect(res.result).toEqual({});

    const req2 = jsonRpcWith(Method.STATUS);
    const res2 = await client.execute(req2);
    // expect(res2.id).toEqual(req2.id);
    expect(res2.result).toBeTruthy();
    expect((res2.result as any).node_info).toBeTruthy();
  };

  const shouldFail = async (client: RpcClient) => {
    try {
      const req = jsonRpcWith("no-such-method");
      await client.execute(req);
      // this must never succeed
      fail();
    } catch (err) {
      // we want a real error here
      expect(err).toBeTruthy();
    }
  };

  it("HttpClient can make a simple call", async () => {
    pendingWithoutTendermint();
    const poster = new HttpClient(tendermintUrl);

    await shouldPass(poster);
    await shouldFail(poster);
  });

  it("HttpUriClient can make a simple call", async () => {
    pendingWithoutTendermint();
    const uri = new HttpUriClient(tendermintUrl);

    await shouldPass(uri);
    await shouldFail(uri);
  });

  it("WebsocketClient can make a simple call", async () => {
    pendingWithoutTendermint();
    // don't print out WebSocket errors if marked pending
    const onError = skipTests() ? () => 0 : console.log;
    const ws = new WebsocketClient(tendermintUrl, onError);

    await shouldPass(ws);
    await shouldFail(ws);
    await shouldPass(ws);
  });
});
