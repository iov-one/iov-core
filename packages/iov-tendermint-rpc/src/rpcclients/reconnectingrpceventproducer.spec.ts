import { ReconnectingSocket } from "@iov/socket";

import { defaultInstance } from "../config.spec";
import { ReconnectingRpcEventProducer } from "./reconnectingrpceventproducer";

function pendingWithoutTendermint(): void {
  if (!process.env.TENDERMINT_ENABLED) {
    pending("Set TENDERMINT_ENABLED to enable tendermint rpc tests");
  }
}

describe("ReconnectingRpcEventProducer", () => {
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
    const producer = new ReconnectingRpcEventProducer(defaultRequest, socket);
    expect(producer).toBeTruthy();
  });

  it("can start", () => {
    pendingWithoutTendermint();
    const socket = new ReconnectingSocket(defaultUrl);
    const producer = new ReconnectingRpcEventProducer(defaultRequest, socket);
    expect(() => producer.start(defaultListener)).not.toThrow();
  });

  it("can stop", () => {
    pendingWithoutTendermint();
    const socket = new ReconnectingSocket(defaultUrl);
    const producer = new ReconnectingRpcEventProducer(defaultRequest, socket);
    producer.start(defaultListener);
    expect(() => producer.stop()).not.toThrow();
  });

  it("can reconnect", () => {
    pendingWithoutTendermint();
    const socket = new ReconnectingSocket(defaultUrl);
    const producer = new ReconnectingRpcEventProducer(defaultRequest, socket);
    producer.start(defaultListener);
    expect(() => producer.reconnect()).not.toThrow();
  });
});
