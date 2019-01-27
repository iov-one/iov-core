import { SocketWrapper } from "./socketwrapper";

function skipTests(): boolean {
  return !process.env.SOCKETSERVER_ENABLED;
}

function pendingWithoutSocketServer(): void {
  if (skipTests()) {
    pending("Set SOCKETSERVER_ENABLED to enable socket tests");
  }
}

describe("SocketWrapper", () => {
  const socketServerUrl = "ws://localhost:4444/websocket";

  it("can be constructed", () => {
    const socket = new SocketWrapper(socketServerUrl, fail, fail);
    expect(socket).toBeTruthy();
  });

  it("can connect", done => {
    pendingWithoutSocketServer();

    const socket = new SocketWrapper(socketServerUrl, fail, fail, done, fail);
    expect(socket).toBeTruthy();
    socket.connect();
  });

  it("can connect and disconnect", done => {
    pendingWithoutSocketServer();

    let opened = 0;

    const socket = new SocketWrapper(
      socketServerUrl,
      fail,
      fail,
      () => {
        opened += 1;
        socket.disconnect();
      },
      closeEvent => {
        expect(closeEvent.wasClean).toEqual(true);
        expect(closeEvent.code).toEqual(1000 /* Normal Closure */);

        expect(opened).toEqual(1);
        done();
      },
    );
    socket.connect();
  });

  it("can disconnect before waiting for open", done => {
    pendingWithoutSocketServer();

    const socket = new SocketWrapper(socketServerUrl, fail, fail, fail, closeEvent => {
      expect(closeEvent.wasClean).toEqual(false);
      expect(closeEvent.code).toEqual(4001);
      done();
    });
    socket.connect();
    socket.disconnect();
  });

  it("can send events when connected", done => {
    pendingWithoutSocketServer();

    const responseMessages = new Array<string>();

    const socket = new SocketWrapper(
      socketServerUrl,
      response => {
        expect(response.type).toEqual("message");
        responseMessages.push(response.data);

        if (responseMessages.length === 3) {
          socket.disconnect();
        }
      },
      fail,
      () => {
        socket.send("aabbccdd");
        socket.send("whatever");
        socket.send("lalala");
      },
      () => {
        expect(responseMessages.length).toEqual(3);
        done();
      },
    );
    socket.connect();
  });

  it("cannot send on a disconnect socket (it will never come back)", done => {
    pendingWithoutSocketServer();

    const socket = new SocketWrapper(
      socketServerUrl,
      fail,
      fail,
      () => {
        socket.disconnect();
      },
      () => {
        socket
          .send("la li lu")
          .then(() => fail("must not resolve"))
          .catch(error => {
            expect(error).toMatch(/socket was closed/i);
            done();
          });
      },
    );
    socket.connect();
  });
});
