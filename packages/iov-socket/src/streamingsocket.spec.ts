import { toListPromise } from "@iov/stream";

import { StreamingSocket } from "./streamingsocket";

function skipTests(): boolean {
  return !process.env.SOCKETSERVER_ENABLED;
}

function pendingWithoutSocketServer(): void {
  if (skipTests()) {
    pending("Set SOCKETSERVER_ENABLED to enable socket tests");
  }
}

describe("StreamingSocket", () => {
  const socketServerUrl = "ws://localhost:4444/websocket";

  it("can be constructed", () => {
    const socket = new StreamingSocket(socketServerUrl);
    expect(socket).toBeTruthy();
  });

  it("can connect", async () => {
    pendingWithoutSocketServer();

    const socket = new StreamingSocket(socketServerUrl);
    expect(socket).toBeTruthy();
    socket.connect();
    await socket.connected;
    socket.disconnect();
  });

  it("can send events when connected", async () => {
    pendingWithoutSocketServer();

    const socket = new StreamingSocket(socketServerUrl);

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
    pendingWithoutSocketServer();

    const socket = new StreamingSocket(socketServerUrl);
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
