import { defaultErrorHandler, toJsonRpcResponse } from "./utils";

describe("rpc clients utils", () => {
  describe("defaultErrorHandler", () => {
    it("throws an error", () => {
      const error = new Error("some error");
      expect(defaultErrorHandler.bind(null, error)).toThrowError(/some error/);
    });
  });

  describe("toJsonRpcResponse", () => {
    it("throws if type is not message", () => {
      const message = {
        type: "not message",
        data: "whatever",
      };
      expect(toJsonRpcResponse.bind(null, message)).toThrowError(/unexpected message type on websocket/i);
    });

    it("returns the parsed data", () => {
      const message = {
        type: "message",
        data: '{ "jsonrpc": "2.0", "id": 123, "result": 456 }',
      };
      expect(toJsonRpcResponse(message)).toEqual({ jsonrpc: "2.0", id: 123, result: 456 });
    });
  });
});
