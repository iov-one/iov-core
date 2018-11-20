// tslint:disable:no-console
import { JsonRpcEvent, jsonRpcWith } from "./common";
import { Integer } from "./encodings";
import { Method } from "./requests";
import { HttpClient, HttpUriClient, instanceOfRpcStreamingClient, RpcClient, WebsocketClient } from "./rpcclient";

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

  it("has working instanceOfRpcStreamingClient()", () => {
    pendingWithoutTendermint();

    expect(instanceOfRpcStreamingClient(new HttpClient(tendermintUrl))).toEqual(false);
    expect(instanceOfRpcStreamingClient(new HttpUriClient(tendermintUrl))).toEqual(false);
    expect(instanceOfRpcStreamingClient(new WebsocketClient(tendermintUrl))).toEqual(true);
  });

  it("should also work with trailing slashes", async () => {
    pendingWithoutTendermint();

    const status = jsonRpcWith(Method.STATUS);

    const http = new HttpClient(tendermintUrl + "/");
    expect(await http.execute(status)).toBeDefined();

    const uri = new HttpUriClient(tendermintUrl + "/");
    expect(await uri.execute(status)).toBeDefined();

    const ws = new WebsocketClient(tendermintUrl + "/");
    expect(await ws.execute(status)).toBeDefined();
    ws.disconnect();
  });

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

    it("can listen to events", done => {
      pendingWithoutTendermint();

      const client = new WebsocketClient(tendermintUrl);

      const query = "tm.event='NewBlockHeader'";
      const req = jsonRpcWith("subscribe", { query });
      const headers = client.listen(req);

      // tslint:disable-next-line:readonly-array
      const events: JsonRpcEvent[] = [];

      const sub = headers.subscribe({
        error: fail,
        complete: () => fail("subscription should not complete"),
        next: (evt: JsonRpcEvent) => {
          events.push(evt);
          expect(evt.query).toEqual(query);

          if (events.length === 2) {
            // make sure they are consequtive heights
            const height = (i: number) => Integer.parse((events[i].data.value as any).header.height);
            expect(height(1)).toEqual(height(0) + 1);

            sub.unsubscribe();

            // wait 1.5s and check we did not get more events
            setTimeout(() => {
              expect(events.length).toEqual(2);
              done();
            }, 1500);
          }
        },
      });
    });

    it("can execute commands while listening to events", done => {
      pendingWithoutTendermint();

      const client = new WebsocketClient(tendermintUrl);

      const query = "tm.event='NewBlockHeader'";
      const req = jsonRpcWith("subscribe", { query });
      const headers = client.listen(req);

      // tslint:disable-next-line:readonly-array
      const events: JsonRpcEvent[] = [];

      const sub = headers.subscribe({
        error: fail,
        complete: () => fail("subscription should not complete"),
        next: (evt: JsonRpcEvent) => {
          events.push(evt);
          expect(evt.query).toEqual(query);

          if (events.length === 2) {
            sub.unsubscribe();

            // wait 1.5s and check we did not get more events
            setTimeout(() => {
              expect(events.length).toEqual(2);
              done();
            }, 1500);
          }
        },
      });

      const startusResponse = client.execute(jsonRpcWith(Method.STATUS));
      expect(startusResponse).toBeTruthy();
    });

    it("can end event listening by disconnecting", done => {
      pendingWithoutTendermint();

      const ws = new WebsocketClient(tendermintUrl);

      const query = "tm.event='NewBlockHeader'";
      const req = jsonRpcWith("subscribe", { query });
      const headers = ws.listen(req);

      // tslint:disable-next-line:readonly-array
      const receivedEvents: JsonRpcEvent[] = [];

      setTimeout(() => ws.disconnect(), 1500);

      headers.subscribe({
        error: fail,
        next: (event: JsonRpcEvent) => receivedEvents.push(event),
        complete: () => {
          expect(receivedEvents.length).toEqual(1);
          done();
        },
      });
    });

    it("fails when executing on a disconnected client", async () => {
      pendingWithoutTendermint();

      const client = new WebsocketClient(tendermintUrl);
      // dummy command to ensure client is connected
      await client.execute(jsonRpcWith(Method.HEALTH));

      client.disconnect();

      const req = jsonRpcWith(Method.HEALTH);
      await client
        .execute(req)
        .then(fail)
        .catch(error => expect(error).toMatch(/is not open/i));
    });

    it("fails when listening to a disconnected client", done => {
      pendingWithoutTendermint();

      // async and done does not work together with pending() in Jasmine 2.8
      (async () => {
        const client = new WebsocketClient(tendermintUrl);
        // dummy command to ensure client is connected
        await client.execute(jsonRpcWith(Method.HEALTH));

        client.disconnect();

        const query = "tm.event='NewBlockHeader'";
        const req = jsonRpcWith("subscribe", { query });
        client.listen(req).subscribe({
          error: error => {
            expect(error.toString()).toMatch(/is not open/);
            done();
          },
          next: () => fail("No event expected"),
          complete: () => fail("Must not complete"),
        });
      })().catch(fail);
    });

    it("cannot listen to simple requests", () => {
      pendingWithoutTendermint();

      const ws = new WebsocketClient(tendermintUrl);
      const req = jsonRpcWith(Method.HEALTH);
      expect(() => ws.listen(req)).toThrowError(/request method must be "subscribe"/i);
    });
  });
});
