import { JsonRpcErrorResponse, JsonRpcRequest, JsonRpcResponse } from "./types";

export function parseJsonRpcId(data: any): number | null {
  const id = data.id;
  if (typeof id !== "number") {
    return null;
  }
  return id;
}

export function parseJsonRpcRequest(data: any): JsonRpcRequest {
  if (typeof data !== "object") {
    throw new Error("Data must be an object");
  }

  if (data.jsonrpc !== "2.0") {
    throw new Error(`Got unexpected jsonrpc version: ${data.jsonrpc}`);
  }

  const id = parseJsonRpcId(data);
  if (id === null) {
    throw new Error("Invalid id field");
  }

  const method = data.method;
  if (typeof method !== "string") {
    throw new Error("Invalid method field");
  }

  const params = data.params;
  if (!Array.isArray(params)) {
    throw new Error("Invalid params field");
  }

  return {
    jsonrpc: "2.0",
    id: id,
    method: method,
    params: params,
  };
}

export function parseJsonRpcError(data: any): JsonRpcErrorResponse | undefined {
  if (typeof data !== "object") {
    throw new Error("Data must be an object");
  }

  if (data.jsonrpc !== "2.0") {
    throw new Error(`Got unexpected jsonrpc version: ${JSON.stringify(data)}`);
  }

  const id = data.id;
  if (typeof id !== "number") {
    throw new Error("Invalid id field");
  }

  const error = data.error;
  if (typeof error === "undefined") {
    return undefined;
  }

  return {
    jsonrpc: "2.0",
    id: id,
    error: error,
  };
}

export function parseJsonRpcResponse(data: any): JsonRpcResponse {
  if (typeof data !== "object") {
    throw new Error("Data must be an object");
  }

  if (data.jsonrpc !== "2.0") {
    throw new Error(`Got unexpected jsonrpc version: ${JSON.stringify(data)}`);
  }

  const id = data.id;
  if (typeof id !== "number") {
    throw new Error("Invalid id field");
  }

  const result = data.result;

  return {
    jsonrpc: "2.0",
    id: id,
    result: result,
  };
}
