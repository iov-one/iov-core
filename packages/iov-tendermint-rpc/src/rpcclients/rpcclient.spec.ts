import { jsonRpcWith } from "../jsonrpc";
import { Method } from "../requests";

import { HttpClient } from "./httpclient";
import { instanceOfRpcStreamingClient } from "./rpcclient";
import { WebsocketClient } from "./websocketclient";

function skipTests(): boolean {
  return !process.env.TENDERMINT_ENABLED;
}

function pendingWithoutTendermint(): void {
  if (skipTests()) {
    pending("Set TENDERMINT_ENABLED to enable tendermint rpc tests");
  }
}

describe("RpcClient", () => {
  const tendermintUrl = "localhost:12345";

  it("has working instanceOfRpcStreamingClient()", () => {
    pendingWithoutTendermint();

    expect(instanceOfRpcStreamingClient(new HttpClient(tendermintUrl))).toEqual(false);
    expect(instanceOfRpcStreamingClient(new WebsocketClient(tendermintUrl))).toEqual(true);
  });

  it("should also work with trailing slashes", async () => {
    pendingWithoutTendermint();

    const status = jsonRpcWith(Method.Status);

    const http = new HttpClient(tendermintUrl + "/");
    expect(await http.execute(status)).toBeDefined();

    const ws = new WebsocketClient(tendermintUrl + "/");
    expect(await ws.execute(status)).toBeDefined();
    ws.disconnect();
  });
});
