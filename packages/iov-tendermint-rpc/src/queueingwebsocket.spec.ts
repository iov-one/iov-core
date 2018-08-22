import WebSocket from "isomorphic-ws";

import { QueueingWebSocket } from "./queueingwebsocket";

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

describe("QueueingWebSocket", () => {
  const tendermintSocketUrl = "ws://localhost:12345/websocket";

  it("can be constructed", () => {
    const socket = new QueueingWebSocket(tendermintSocketUrl, fail, fail);
    expect(socket).toBeTruthy();
  });

  it("can connect", done => {
    pendingWithoutTendermint();

    const socket = new QueueingWebSocket(tendermintSocketUrl, fail, fail, done, fail);
    expect(socket).toBeTruthy();
    socket.connect();
  });

  it("can connect and disconnect", done => {
    pendingWithoutTendermint();

    // tslint:disable-next-line:no-let
    let opened = 0;

    const socket = new QueueingWebSocket(
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

  // Websockets do not support aborting the conecting process
  it("cannot disconnect before waiting for open", done => {
    pendingWithoutTendermint();

    const socket = new QueueingWebSocket(
      tendermintSocketUrl,
      fail,
      errorEvent => {
        if (typeof errorEvent.isTrusted === "boolean") {
          // We're in a browser and don't get error details. Why?
          expect(errorEvent.isTrusted).toEqual(true);
        } else {
          expect(errorEvent.message).toMatch(/was closed before the connection was established/);
        }
        done();
      },
      fail,
      undefined,
    );
    socket.connect();
    socket.disconnect();
  });

  it("can send events when connected", done => {
    pendingWithoutTendermint();

    const responses = new Array<WebSocket.Data>();

    const socket = new QueueingWebSocket(
      tendermintSocketUrl,
      response => {
        expect(response.type).toEqual("message");
        responses.push(response.data);

        if (responses.length === 3) {
          socket.disconnect();
        }
      },
      fail,
      () => {
        socket.sendQueued("aabbccdd");
        socket.sendQueued("whatever");
        socket.sendQueued("lalala");
      },
      () => {
        expect(responses.length).toEqual(3);
        done();
      },
    );
    socket.connect();
  });

  it("can send events before connecting", done => {
    pendingWithoutTendermint();

    const responses = new Array<WebSocket.Data>();

    const socket = new QueueingWebSocket(
      tendermintSocketUrl,
      response => {
        expect(response.type).toEqual("message");
        responses.push(response.data);

        if (responses.length === 3) {
          socket.disconnect();
        }
      },
      fail,
      undefined,
      () => {
        expect(responses.length).toEqual(3);
        done();
      },
    );

    socket.sendQueued("aabbccdd");
    socket.sendQueued("whatever");
    socket.sendQueued("lalala");

    socket.connect();
  });

  it("cannot send on a disconnect socket (it will never come back)", done => {
    pendingWithoutTendermint();

    const socket = new QueueingWebSocket(
      tendermintSocketUrl,
      fail,
      fail,
      () => {
        socket.disconnect();
      },
      () => {
        expect(() => socket.sendQueued("la li lu")).toThrowError(/was closed/);
        done();
      },
    );
    socket.connect();
  });
});
