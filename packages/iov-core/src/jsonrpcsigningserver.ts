import { ChainId, isUnsignedTransaction, UnsignedTransaction } from "@iov/bcp";
import { Encoding } from "@iov/encoding";
import {
  isJsonCompatibleDictionary,
  JsonCompatibleValue,
  jsonRpcCode,
  JsonRpcErrorResponse,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcSuccessResponse,
  parseJsonRpcId,
  parseJsonRpcRequest,
} from "@iov/jsonrpc";

import { SigningServerCore } from "./signingservercore";

interface RpcCallGetIdentities {
  readonly name: "getIdentities";
  readonly reason: string;
  readonly chainIds: ReadonlyArray<ChainId>;
}

interface RpcCallSignAndPost {
  readonly name: "signAndPost";
  readonly reason: string;
  readonly transaction: UnsignedTransaction;
}

type RpcCall = RpcCallGetIdentities | RpcCallSignAndPost;

class ParamsError extends Error {}
class MethodNotFoundError extends Error {}

function isArrayOfStrings(array: ReadonlyArray<any>): array is ReadonlyArray<string> {
  return array.every(element => typeof element === "string");
}

function parseRpcCall(data: JsonRpcRequest): RpcCall {
  if (!isJsonCompatibleDictionary(data.params)) {
    throw new Error("Request params are only supported as dictionary");
  }

  switch (data.method) {
    case "getIdentities": {
      const { reason, chainIds } = data.params;
      if (typeof reason !== "string") {
        throw new ParamsError("1st parameter (reason) must be a string");
      }
      if (!Array.isArray(chainIds)) {
        throw new ParamsError("2nd parameter (chainIds) must be an array");
      }
      if (!isArrayOfStrings(chainIds)) {
        throw new ParamsError("Found non-string element in chainIds array");
      }
      return {
        name: "getIdentities",
        reason: reason,
        chainIds: chainIds,
      };
    }
    case "signAndPost": {
      const { reason, transaction } = data.params;
      if (typeof reason !== "string") {
        throw new ParamsError("1st parameter (reason) must be a string");
      }
      if (typeof transaction !== "object") {
        throw new ParamsError("2nd parameter (transaction) must be an object");
      }
      const parsedTransaction = JsonRpcSigningServer.fromJson(transaction);
      if (!isUnsignedTransaction(parsedTransaction)) {
        throw new ParamsError("2nd parameter (transaction) does not look like an unsigned transaction");
      }
      return {
        name: "signAndPost",
        reason: reason,
        transaction: parsedTransaction,
      };
    }
    default:
      throw new MethodNotFoundError("Unknown method name");
  }
}

/**
 * A transport-agnostic JSON-RPC wrapper around SigningServerCore
 */
export class JsonRpcSigningServer {
  /**
   * Encodes a non-recursive JavaScript object as JSON in a way that is
   * 1. compact for binary data
   * 2. supports serializing/deserializing non-JSON types like Uint8Array
   */
  public static toJson(data: unknown): JsonCompatibleValue {
    if (typeof data === "number" || typeof data === "boolean") {
      return data;
    }

    if (data === null) {
      return null;
    }

    if (typeof data === "string") {
      return `string:${data}`;
    }

    if (data instanceof Uint8Array) {
      return `Uint8Array:${Encoding.toHex(data)}`;
    }

    if (Array.isArray(data)) {
      return data.map(JsonRpcSigningServer.toJson);
    }

    // Exclude special kind of objects like Array, Date or Uint8Array
    // Object.prototype.toString() returns a specified value:
    // http://www.ecma-international.org/ecma-262/7.0/index.html#sec-object.prototype.tostring
    if (
      typeof data === "object" &&
      data !== null &&
      Object.prototype.toString.call(data) === "[object Object]"
    ) {
      const out: any = {};
      for (const key of Object.keys(data)) {
        // tslint:disable-next-line: no-object-mutation
        out[key] = JsonRpcSigningServer.toJson((data as any)[key]);
      }
      return out;
    }

    throw new Error("Cannot encode type to JSON");
  }

  public static fromJson(data: JsonCompatibleValue): any {
    if (typeof data === "number" || typeof data === "boolean") {
      return data;
    }

    if (data === null) {
      return null;
    }

    if (typeof data === "string") {
      if (data.startsWith("string:")) {
        return data.slice(7);
      }

      if (data.startsWith("Uint8Array:")) {
        return Encoding.fromHex(data.slice(11));
      }

      throw new Error("Found string with unknown prefix");
    }

    if (Array.isArray(data)) {
      return data.map(JsonRpcSigningServer.fromJson);
    }

    // Exclude special kind of objects like Array, Date or Uint8Array
    // Object.prototype.toString() returns a specified value:
    // http://www.ecma-international.org/ecma-262/7.0/index.html#sec-object.prototype.tostring
    if (
      typeof data === "object" &&
      data !== null &&
      Object.prototype.toString.call(data) === "[object Object]"
    ) {
      const out: any = {};
      for (const key of Object.keys(data)) {
        // tslint:disable-next-line: no-object-mutation
        out[key] = JsonRpcSigningServer.fromJson((data as any)[key]);
      }
      return out;
    }

    throw new Error("Cannot decode type from JSON");
  }

  private readonly core: SigningServerCore;

  constructor(core: SigningServerCore) {
    this.core = core;
  }

  public async handleUnchecked(request: unknown): Promise<JsonRpcResponse> {
    let checkedRequest: JsonRpcRequest;
    try {
      checkedRequest = parseJsonRpcRequest(request);
    } catch (error) {
      const requestId = parseJsonRpcId(request);
      const errorResponse: JsonRpcErrorResponse = {
        jsonrpc: "2.0",
        id: requestId,
        error: {
          code: jsonRpcCode.invalidRequest,
          message: error.toString(),
        },
      };
      return errorResponse;
    }

    return this.handleChecked(checkedRequest);
  }

  /**
   * Handles a checked JsonRpcRequest
   *
   * 1. convert JsRpcRequest into calls to SigningServerCore
   * 2. call SigningServerCore
   * 3. convert result to JSON-RPC format
   */
  public async handleChecked(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    let call: RpcCall;
    try {
      call = parseRpcCall(request);
    } catch (error) {
      const errorResponse: JsonRpcErrorResponse = {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: jsonRpcCode.methodNotFound,
          message: error.toString(),
        },
      };
      return errorResponse;
    }

    try {
      let response: JsonRpcSuccessResponse;
      switch (call.name) {
        case "getIdentities":
          response = {
            jsonrpc: "2.0",
            id: request.id,
            result: JsonRpcSigningServer.toJson(await this.core.getIdentities(call.reason, call.chainIds)),
          };
          break;
        case "signAndPost":
          response = {
            jsonrpc: "2.0",
            id: request.id,
            result: JsonRpcSigningServer.toJson(await this.core.signAndPost(call.reason, call.transaction)),
          };
          break;
        default:
          throw new Error("Unsupported RPC call");
      }
      return response;
    } catch (error) {
      let errorCode: number;
      if (error instanceof ParamsError) {
        errorCode = jsonRpcCode.invalidParams;
      } else if (error instanceof MethodNotFoundError) {
        errorCode = jsonRpcCode.methodNotFound;
      } else {
        errorCode = jsonRpcCode.serverError.default;
      }

      const errorResponse: JsonRpcErrorResponse = {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: errorCode,
          message: error.toString(),
        },
      };
      return errorResponse;
    }
  }

  /**
   * Call this to free ressources when server is not needed anymore
   */
  public shutdown(): void {
    this.core.shutdown();
  }
}
