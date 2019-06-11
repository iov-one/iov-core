import { QueueingStreamingSocket } from "./queueingstreamingsocket";

function pendingWithoutSocketServer(): void {
  if (!process.env.SOCKETSERVER_ENABLED) {
    pending("Set SOCKETSERVER_ENABLED to enable socket tests");
  }
}

describe("QueueingStreamingSocket", () => {
  const socketServerUrl = "ws://localhost:4444/websocket";

  it("can be constructed", () => {
    const socket = new QueueingStreamingSocket(socketServerUrl);
    expect(socket).toBeTruthy();
  });

  describe("queueRequest", () => {
    it("can queue and process requests with a connection", done => {
      pendingWithoutSocketServer();
      const socket = new QueueingStreamingSocket(socketServerUrl);
      const requests: readonly string[] = ["request 1", "request 2", "request 3"];
      let eventsSeen = 0;
      socket.events.subscribe({
        next: event => {
          expect(event.data).toEqual(requests[eventsSeen++]);
          if (eventsSeen === requests.length) {
            expect(socket.getQueueLength()).toEqual(0);
            socket.disconnect();
            done();
          }
        },
      });

      socket.connect();
      // tslint:disable-next-line:no-floating-promises
      socket.connected.then(() => {
        requests.forEach(request => socket.queueRequest(request));
      });
    });

    it("can queue requests without a connection and process them later", done => {
      pendingWithoutSocketServer();
      const socket = new QueueingStreamingSocket(socketServerUrl);
      const requests: readonly string[] = ["request 1", "request 2", "request 3"];
      let eventsSeen = 0;
      socket.events.subscribe({
        next: event => {
          expect(event.data).toEqual(requests[eventsSeen++]);
          if (eventsSeen === requests.length) {
            expect(socket.getQueueLength()).toEqual(0);
            socket.disconnect();
            done();
          }
        },
      });

      requests.forEach(request => socket.queueRequest(request));
      setTimeout(() => {
        expect(socket.getQueueLength()).toEqual(3);
        socket.connect();
      }, 5_000);
    });
  });

  describe("reconnect", () => {
    it("can reconnect and process remaining queue", done => {
      pendingWithoutSocketServer();
      const socket = new QueueingStreamingSocket(socketServerUrl);
      const requests: readonly string[] = ["request 1", "request 2", "request 3"];
      let eventsSeen = 0;

      socket.connect();
      socket.disconnect();

      requests.forEach(request => socket.queueRequest(request));

      socket.events.subscribe({
        next: event => {
          expect(event.data).toEqual(requests[eventsSeen++]);
          if (eventsSeen === requests.length) {
            expect(socket.getQueueLength()).toEqual(0);
            socket.disconnect();
            done();
          }
        },
      });
      socket.reconnect();
    });
  });
});
