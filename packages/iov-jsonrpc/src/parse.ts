import {
  isJsonCompatibleDictionary,
  isJsonCompatibleValue,
  JsonCompatibleDictionary,
  JsonCompatibleValue,
} from "./jsoncompatibledictionary";
import { JsonRpcError, JsonRpcErrorResponse, JsonRpcRequest, JsonRpcResponse } from "./types";

export function parseJsonRpcId(data: unknown): number | null {
  if (!isJsonCompatibleDictionary(data)) {
    throw new Error("Data must be JSON compatible dictionary");
  }

  const id = data.id;
  if (typeof id !== "number") {
    return null;
  }
  return id;
}

export function parseJsonRpcRequest(data: unknown): JsonRpcRequest {
  if (!isJsonCompatibleDictionary(data)) {
    throw new Error("Data must be JSON compatible dictionary");
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

function parseError(error: JsonCompatibleDictionary): JsonRpcError {
  if (typeof error.code !== "number") {
    throw new Error("Error property 'code' is not a number");
  }

  if (typeof error.message !== "string") {
    throw new Error("Error property 'message' is not a string");
  }

  let maybeUndefinedData: JsonCompatibleValue | undefined;

  if (error.data === undefined) {
    maybeUndefinedData = undefined;
  } else if (isJsonCompatibleValue(error.data)) {
    maybeUndefinedData = error.data;
  } else {
    throw new Error("Error property 'data' is defined but not a JSON compatible value.");
  }

  return {
    code: error.code,
    message: error.message,
    data: maybeUndefinedData,
  };
}

export function parseJsonRpcError(data: unknown): JsonRpcErrorResponse | undefined {
  if (!isJsonCompatibleDictionary(data)) {
    throw new Error("Data must be JSON compatible dictionary");
  }

  if (data.jsonrpc !== "2.0") {
    throw new Error(`Got unexpected jsonrpc version: ${JSON.stringify(data)}`);
  }

  const id = data.id;
  if (typeof id !== "number") {
    throw new Error("Invalid id field");
  }

  if (typeof data.error === "undefined") {
    return undefined;
  }

  if (!isJsonCompatibleDictionary(data.error)) {
    throw new Error("Property 'error' is defined but not a JSON compatible dictionary");
  }

  return {
    jsonrpc: "2.0",
    id: id,
    error: parseError(data.error),
  };
}

export function parseJsonRpcResponse(data: unknown): JsonRpcResponse {
  if (!isJsonCompatibleDictionary(data)) {
    throw new Error("Data must be JSON compatible dictionary");
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
