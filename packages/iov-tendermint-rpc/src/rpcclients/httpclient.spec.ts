import { jsonRpcWith } from "../jsonrpc";
import { Method } from "../requests";

import { HttpClient, HttpUriClient } from "./httpclient";

function skipTests(): boolean {
  return !process.env.TENDERMINT_ENABLED;
}

function pendingWithoutTendermint(): void {
  if (skipTests()) {
    pending("Set TENDERMINT_ENABLED to enable tendermint rpc tests");
  }
}

const tendermintUrl = "localhost:12345";

describe("HttpClient", () => {
  it("can make a simple call", async () => {
    pendingWithoutTendermint();
    const client = new HttpClient(tendermintUrl);

    const healthResponse = await client.execute(jsonRpcWith(Method.Health));
    expect(healthResponse.result).toEqual({});

    const statusResponse = await client.execute(jsonRpcWith(Method.Status));
    expect(statusResponse.result).toBeTruthy();
    expect(statusResponse.result.node_info).toBeTruthy();

    await client
      .execute(jsonRpcWith("no-such-method"))
      .then(() => fail("must not resolve"))
      .catch(error => expect(error).toBeTruthy());

    client.disconnect();
  });
});

describe("HttpUriClient", () => {
  it("can make a simple call", async () => {
    pendingWithoutTendermint();
    const client = new HttpUriClient(tendermintUrl);

    const healthResponse = await client.execute(jsonRpcWith(Method.Health));
    expect(healthResponse.result).toEqual({});

    const statusResponse = await client.execute(jsonRpcWith(Method.Status));
    expect(statusResponse.result).toBeTruthy();
    expect(statusResponse.result.node_info).toBeTruthy();

    await client
      .execute(jsonRpcWith("no-such-method"))
      .then(() => fail("must not resolve"))
      .catch(error => expect(error).toBeTruthy());

    client.disconnect();
  });
});
