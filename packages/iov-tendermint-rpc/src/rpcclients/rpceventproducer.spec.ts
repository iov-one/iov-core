import { ReconnectingSocket } from "@iov/socket";

import { defaultInstance } from "../config.spec";
import { RpcEventProducer } from "./rpceventproducer";

function pendingWithoutTendermint(): void {
  if (!process.env.TENDERMINT_ENABLED) {
    pending("Set TENDERMINT_ENABLED to enable tendermint rpc tests");
  }
}

describe("RpcEventProducer", () => {
  const defaultUrl = defaultInstance.url;
  const defaultRequest = {
    jsonrpc: "2.0" as const,
    id: 12345,
    method: "subscribe",
    params: { some: "query" },
  };
  const defaultListener = {
    next: () => 0,
    error: () => 0,
    complete: () => 0,
  };

  it("can be constructed", () => {
    const socket = new ReconnectingSocket(defaultUrl);
    const producer = new RpcEventProducer(defaultRequest, socket);
    expect(producer).toBeTruthy();
  });

  it("can start", () => {
    pendingWithoutTendermint();
    const socket = new ReconnectingSocket(defaultUrl);
    const producer = new RpcEventProducer(defaultRequest, socket);
    expect(() => producer.start(defaultListener)).not.toThrow();
  });

  it("can stop", () => {
    pendingWithoutTendermint();
    const socket = new ReconnectingSocket(defaultUrl);
    const producer = new RpcEventProducer(defaultRequest, socket);
    producer.start(defaultListener);
    expect(() => producer.stop()).not.toThrow();
  });

  it("throws if started more than once", () => {
    pendingWithoutTendermint();
    const socket = new ReconnectingSocket(defaultUrl);
    const producer = new RpcEventProducer(defaultRequest, socket);
    producer.start(defaultListener);
    expect(() => producer.start(defaultListener)).toThrowError(/already started/i);
  });

  it("can be restarted if stopped", () => {
    pendingWithoutTendermint();
    const socket = new ReconnectingSocket(defaultUrl);
    const producer = new RpcEventProducer(defaultRequest, socket);
    producer.start(defaultListener);
    producer.stop();
    expect(() => producer.start(defaultListener)).not.toThrow();
  });
});
