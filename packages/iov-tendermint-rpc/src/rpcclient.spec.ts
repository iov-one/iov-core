import { jsonRpcWith } from "./common";
import { Method } from "./requests";
import { HttpClient, HttpUriClient, RpcClient, WebsocketClient } from "./rpcclient";

// process.env is undefined in browser....
// but we can shim it in with webpack for the tests.
// good for browser tests, not so good for configuring production
const skipTests = (): boolean => !process.env.TENDERMINT_ENABLED;

describe("Ensure RpcClients work", () => {
  // TODO: make flexible, support multiple versions, etc...
  const tendermintUrl = "http://localhost:12345";
  const wsTendermintUrl = "ws://localhost:12345";

  if (skipTests()) {
    it("Tests need flag to enable", () => {
      pending("Set TENDERMINT_ENABLED to run tendermint rpc tests");
    });
    return;
  }

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
    const req = jsonRpcWith("no-such-method");
    await client.execute(req);
  };

  it("HttpClient can make a simple call", () => {
    const poster = new HttpClient(tendermintUrl);

    return shouldPass(poster)
      .catch(fail)
      .then(() => shouldFail(poster))
      .then(fail)
      .catch(() => 0);
  });

  it("HttpUriClient can make a simple call", () => {
    const uri = new HttpUriClient(tendermintUrl);

    return shouldPass(uri)
      .catch(fail)
      .then(() => shouldFail(uri))
      .then(fail)
      .catch(() => 0);
  });

  it("WebsocketClient can make a simple call", () => {
    const ws = new WebsocketClient(wsTendermintUrl);

    return (
      shouldPass(ws)
        .catch(fail)
        .then(() => shouldFail(ws))
        .then(fail)
        .catch(() => 0)
        // should be able to handle a good response after a failure
        .then(() => shouldPass(ws))
        .catch(fail)
    );
  });
});
