import { toListPromise } from "@iov/stream";

import { StreamingSocket } from "./streamingsocket";

function skipTests(): boolean {
  return !process.env.TENDERMINT_ENABLED;
}

function pendingWithoutTendermint(): void {
  if (skipTests()) {
    pending("Set TENDERMINT_ENABLED to enable tendermint rpc tests");
  }
}

describe("StreamingSocket", () => {
  const tendermintSocketUrl = "ws://localhost:12345/websocket";

  it("can be constructed", () => {
    const socket = new StreamingSocket(tendermintSocketUrl);
    expect(socket).toBeTruthy();
  });

  it("can connect", async () => {
    pendingWithoutTendermint();

    const socket = new StreamingSocket(tendermintSocketUrl);
    expect(socket).toBeTruthy();
    socket.connect();
    await socket.connected;
    socket.disconnect();
  });

  it("can send events when connected", async () => {
    pendingWithoutTendermint();

    const socket = new StreamingSocket(tendermintSocketUrl);

    const responsePromise = toListPromise(socket.events, 3);

    socket.connect();
    await socket.connected;

    socket.send("aabbccdd");
    socket.send("whatever");
    socket.send("lalala");

    const response = await responsePromise;
    expect(response.length).toEqual(3);

    socket.disconnect();
  });

  it("completes stream when disconnected", done => {
    pendingWithoutTendermint();

    const socket = new StreamingSocket(tendermintSocketUrl);
    const subscription = socket.events.subscribe({
      complete: () => {
        subscription.unsubscribe();
        done();
      },
    });

    (async () => {
      socket.connect();
      await socket.connected;
      socket.send("aabbccdd");
      socket.send("whatever");
      socket.send("lalala");
      socket.disconnect();
    })().catch(done.fail);
  });
});
