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

  describe("queueRequest and processQueue", () => {
    it("can queue and process requests with a connection", async () => {
      pendingWithoutSocketServer();
      const socket = new QueueingStreamingSocket(socketServerUrl);
      socket.connect();
      await socket.connected;

      await socket.queueRequest("request 1");
      await socket.queueRequest("request 2");
      await socket.queueRequest("request 3");
      expect(socket.getQueueLength()).toEqual(0);

      socket.disconnect();
    });

    it("can queue requests without a connection and process them later", async () => {
      pendingWithoutSocketServer();
      const socket = new QueueingStreamingSocket(socketServerUrl);

      await socket.queueRequest("request 1");
      await socket.queueRequest("request 2");
      await socket.queueRequest("request 3");
      expect(socket.getQueueLength()).toEqual(3);

      socket.connect();
      await socket.connected;

      await socket.processQueue();
      expect(socket.getQueueLength()).toEqual(0);

      socket.disconnect();
    });
  });
});
