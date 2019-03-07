import { Stream } from "xstream";

import { toListPromise } from "@iov/stream";

import { defaultInstance } from "../config.spec";
import { Integer } from "../encodings";
import { JsonRpcEvent, jsonRpcWith } from "../jsonrpc";
import { Method } from "../requests";

import { WebsocketClient } from "./websocketclient";

function skipTests(): boolean {
  return !process.env.TENDERMINT_ENABLED;
}

function pendingWithoutTendermint(): void {
  if (skipTests()) {
    pending("Set TENDERMINT_ENABLED to enable tendermint rpc tests");
  }
}

describe("WebsocketClient", () => {
  const tendermintUrl = defaultInstance.url;

  it("can make a simple call", async () => {
    pendingWithoutTendermint();

    const client = new WebsocketClient(tendermintUrl);

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

  it("can listen to events", done => {
    pendingWithoutTendermint();

    const client = new WebsocketClient(tendermintUrl);

    const query = "tm.event='NewBlockHeader'";
    const req = jsonRpcWith("subscribe", { query: query });
    const headers = client.listen(req);

    // tslint:disable-next-line:readonly-array
    const events: JsonRpcEvent[] = [];

    const sub = headers.subscribe({
      error: done.fail,
      complete: () => done.fail("subscription should not complete"),
      next: (evt: JsonRpcEvent) => {
        events.push(evt);
        expect(evt.query).toEqual(query);

        if (events.length === 2) {
          // make sure they are consequtive heights
          const height = (i: number) => Integer.parse(events[i].data.value.header.height);
          expect(height(1)).toEqual(height(0) + 1);

          sub.unsubscribe();

          // wait 1.5s and check we did not get more events
          setTimeout(() => {
            expect(events.length).toEqual(2);

            client.disconnect();
            done();
          }, 1500);
        }
      },
    });
  });

  it("can listen to the same query twice", async () => {
    pendingWithoutTendermint();

    const client = new WebsocketClient(tendermintUrl);

    const newBlockHeaderQuery = "tm.event='NewBlockHeader'";

    // we need two requests with unique IDs
    const request1 = jsonRpcWith("subscribe", { query: newBlockHeaderQuery });
    const request2 = jsonRpcWith("subscribe", { query: newBlockHeaderQuery });
    const stream1 = client.listen(request1);
    const stream2 = client.listen(request2);

    const eventHeights = await toListPromise(
      Stream.merge(stream1, stream2).map(event => {
        // height is string or number, depending on Tendermint version. But we don't care in this case
        return event.data.value.header.height;
      }),
      4,
    );
    expect(new Set(eventHeights).size).toEqual(2);

    client.disconnect();
  });

  it("can execute commands while listening to events", done => {
    pendingWithoutTendermint();

    const client = new WebsocketClient(tendermintUrl);

    const query = "tm.event='NewBlockHeader'";
    const req = jsonRpcWith("subscribe", { query: query });
    const headers = client.listen(req);

    // tslint:disable-next-line:readonly-array
    const events: JsonRpcEvent[] = [];

    const sub = headers.subscribe({
      error: done.fail,
      complete: () => done.fail("subscription should not complete"),
      next: (evt: JsonRpcEvent) => {
        events.push(evt);
        expect(evt.query).toEqual(query);

        if (events.length === 2) {
          sub.unsubscribe();

          // wait 1.5s and check we did not get more events
          setTimeout(() => {
            expect(events.length).toEqual(2);

            client.disconnect();
            done();
          }, 1500);
        }
      },
    });

    client
      .execute(jsonRpcWith(Method.Status))
      .then(startusResponse => expect(startusResponse).toBeTruthy())
      .catch(done.fail);
  });

  it("can end event listening by disconnecting", done => {
    pendingWithoutTendermint();

    const client = new WebsocketClient(tendermintUrl);

    const query = "tm.event='NewBlockHeader'";
    const req = jsonRpcWith("subscribe", { query: query });
    const headers = client.listen(req);

    // tslint:disable-next-line:readonly-array
    const receivedEvents: JsonRpcEvent[] = [];

    setTimeout(() => client.disconnect(), 1500);

    headers.subscribe({
      error: done.fail,
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
    await client.execute(jsonRpcWith(Method.Health));

    client.disconnect();

    await client
      .execute(jsonRpcWith(Method.Health))
      .then(() => fail("must not resolve"))
      .catch(error => expect(error).toMatch(/is not open/i));
  });

  it("fails when listening to a disconnected client", done => {
    pendingWithoutTendermint();

    // async and done does not work together with pending() in Jasmine 2.8
    (async () => {
      const client = new WebsocketClient(tendermintUrl);
      // dummy command to ensure client is connected
      await client.execute(jsonRpcWith(Method.Health));

      client.disconnect();

      const query = "tm.event='NewBlockHeader'";
      const req = jsonRpcWith("subscribe", { query: query });
      client.listen(req).subscribe({
        error: error => {
          expect(error.toString()).toMatch(/is not open/);
          done();
        },
        next: () => done.fail("No event expected"),
        complete: () => done.fail("Must not complete"),
      });
    })().catch(done.fail);
  });

  it("cannot listen to simple requests", async () => {
    pendingWithoutTendermint();

    const client = new WebsocketClient(tendermintUrl);

    const req = jsonRpcWith(Method.Health);
    expect(() => client.listen(req)).toThrowError(/request method must be "subscribe"/i);

    await client.connected();
    client.disconnect();
  });
});
