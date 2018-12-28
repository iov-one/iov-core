export interface JsonRpcRequest {
  readonly jsonrpc: "2.0";
  readonly id: number;
  readonly method: string;
  readonly params: ReadonlyArray<any>;
}

export interface JsonRpcResponse {
  readonly jsonrpc: "2.0";
  readonly id: number;
  readonly result: any;
}

/**
 * And error object as described in https://www.jsonrpc.org/specification#error_object
 */
export interface JsonRpcErrorResponse {
  readonly jsonrpc: "2.0";
  readonly id: number | null;
  readonly error: {
    readonly code: number;
    readonly message: string;
    readonly data?: any;
  };
}

export function isJsonRpcErrorResponse(
  response: JsonRpcResponse | JsonRpcErrorResponse,
): response is JsonRpcErrorResponse {
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
