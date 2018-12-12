import { SocketWrapper } from "./socketwrapper";

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

describe("SocketWrapper", () => {
  const tendermintSocketUrl = "ws://localhost:12345/websocket";

  it("can be constructed", () => {
    const socket = new SocketWrapper(tendermintSocketUrl, fail, fail);
    expect(socket).toBeTruthy();
  });

  it("can connect", done => {
    pendingWithoutTendermint();

    const socket = new SocketWrapper(tendermintSocketUrl, fail, fail, done, fail);
    expect(socket).toBeTruthy();
    socket.connect();
  });

  it("can connect and disconnect", done => {
    pendingWithoutTendermint();

    let opened = 0;

    const socket = new SocketWrapper(
      tendermintSocketUrl,
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
    pendingWithoutTendermint();

    const socket = new SocketWrapper(tendermintSocketUrl, fail, fail, fail, closeEvent => {
      expect(closeEvent.wasClean).toEqual(false);
      expect(closeEvent.code).toEqual(4001);
      done();
    });
    socket.connect();
    socket.disconnect();
  });

  it("can send events when connected", done => {
    pendingWithoutTendermint();

    const responseMessages = new Array<string>();

    const socket = new SocketWrapper(
      tendermintSocketUrl,
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
    pendingWithoutTendermint();

    const socket = new SocketWrapper(
      tendermintSocketUrl,
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
