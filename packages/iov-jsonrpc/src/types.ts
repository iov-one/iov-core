import {
  JsonCompatibleArray,
  JsonCompatibleDictionary,
  JsonCompatibleValue,
} from "./jsoncompatibledictionary";

export interface JsonRpcRequest {
  readonly jsonrpc: "2.0";
  readonly id: number;
  readonly method: string;
  readonly params: JsonCompatibleArray | JsonCompatibleDictionary;
}

export interface JsonRpcSuccessResponse {
  readonly jsonrpc: "2.0";
  readonly id: number;
  readonly result: any;
}

export interface JsonRpcError {
  readonly code: number;
  readonly message: string;
  readonly data?: JsonCompatibleValue;
}

/**
 * And error object as described in https://www.jsonrpc.org/specification#error_object
 */
export interface JsonRpcErrorResponse {
  readonly jsonrpc: "2.0";
  readonly id: number | null;
  readonly error: JsonRpcError;
}

export type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;

export function isJsonRpcErrorResponse(response: JsonRpcResponse): response is JsonRpcErrorResponse {
  return typeof (response as JsonRpcErrorResponse).error === "object";
}

export const jsonRpcCodeParseError = -32700;
export const jsonRpcCodeInvalidRequest = -32600;
export const jsonRpcCodeMethodNotFound = -32601;
export const jsonRpcCodeInvalidParams = -32602;
export const jsonRpcCodeInternalError = -32603;
// server error (Reserved for implementation-defined server-errors.):
// -32000 to -32099
export const jsonRpcCodeServerErrorDefault = -32000;
