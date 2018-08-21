// tslint:disable:no-console
import { JsonRpcEvent, jsonRpcWith } from "./common";
import { Method } from "./requests";
import { HttpClient, HttpUriClient, RpcClient, WebsocketClient } from "./rpcclient";

function skipTests(): boolean {
  // process.env is undefined in browser....
  // but we can shim it in with webpack for the tests.
  // good for browser tests, not so good for configuring production
  return !process.env.TENDERMINT_ENABLED;
}

function pendingWithoutTendermint(): void {
  if (skipTests()) {
    pending("Set TENDERMINT_ENABLED to enable tendermint rpc tests");
  }
}

async function shouldPass(client: RpcClient): Promise<void> {
  const req = jsonRpcWith(Method.HEALTH);
  const res = await client.execute(req);
  // expect(res.id).toEqual(req.id);
  expect(res.result).toEqual({});

  const req2 = jsonRpcWith(Method.STATUS);
  const res2 = await client.execute(req2);
  // expect(res2.id).toEqual(req2.id);
  expect(res2.result).toBeTruthy();
  expect((res2.result as any).node_info).toBeTruthy();
}

async function shouldFail(client: RpcClient): Promise<void> {
  try {
    const req = jsonRpcWith("no-such-method");
    await client.execute(req);
    // this must never succeed
    fail();
  } catch (err) {
    // we want a real error here
    expect(err).toBeTruthy();
  }
}

describe("RpcClient", () => {
  const tendermintUrl = "localhost:12345";

  describe("HttpClient", () => {
    it("can make a simple call", async () => {
      pendingWithoutTendermint();
      const poster = new HttpClient(tendermintUrl);

      await shouldPass(poster);
      await shouldFail(poster);
    });
  });

  describe("HttpUriClient", () => {
    it("can make a simple call", async () => {
      pendingWithoutTendermint();
      const uri = new HttpUriClient(tendermintUrl);

      await shouldPass(uri);
      await shouldFail(uri);
    });
  });

  describe("WebsocketClient", () => {
    it("can make a simple call", async () => {
      pendingWithoutTendermint();
      // don't print out WebSocket errors if marked pending
      const onError = skipTests() ? () => 0 : console.log;
      const ws = new WebsocketClient(tendermintUrl, onError);

      await shouldPass(ws);
      await shouldFail(ws);
      await shouldPass(ws);
    });

    it(
      "can listen to events",
      done => {
        pendingWithoutTendermint();

        const ws = new WebsocketClient(tendermintUrl);

        const query = "tm.event='NewBlockHeader'";
        const req = jsonRpcWith("subscribe", { query });
        const headers = ws.listen(req);

        // tslint:disable-next-line:readonly-array
        const events: JsonRpcEvent[] = [];

        const sub = headers.subscribe({
          error: fail,
          complete: () => fail("subscription should not complete"),
          next: (evt: JsonRpcEvent) => {
            events.push(evt);
            expect(evt.query).toEqual(query);

            if (events.length === 3) {
              // make sure they are consequtive heights
              const height = (i: number) => (events[i].data.value as any).header.height as number;
              expect(height(1)).toEqual(height(0) + 1);
              expect(height(2)).toEqual(height(1) + 1);

              // now unsubscribe and error if another one arrives
              sub.unsubscribe();
              // wait 2.5s for finish
              setTimeout(done, 2500);
            } else if (events.length === 4) {
              fail("unsubscribe didn't work");
            }
          },
        });
      },
      10000,
    );

    it("cannot listen to simple requests", () => {
      pendingWithoutTendermint();

      const ws = new WebsocketClient(tendermintUrl);
      const req = jsonRpcWith(Method.HEALTH);
      expect(() => ws.listen(req)).toThrowError(/request method must be "subscribe"/i);
    });
  });
});
