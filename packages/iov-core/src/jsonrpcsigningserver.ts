import { ChainId, UnsignedTransaction } from "@iov/bcp-types";
import {
  isJsonCompatibleDictionary,
  jsonRpcCodeInvalidParams,
  jsonRpcCodeInvalidRequest,
  jsonRpcCodeMethodNotFound,
  jsonRpcCodeServerErrorDefault,
  JsonRpcErrorResponse,
  JsonRpcRequest,
  JsonRpcResponse,
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
      return {
        name: "signAndPost",
        reason: reason,
        transaction: (transaction as unknown) as UnsignedTransaction,
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
  private readonly core: SigningServerCore;

  constructor(core: SigningServerCore) {
    this.core = core;
  }

  public async handleUnchecked(request: unknown): Promise<JsonRpcResponse | JsonRpcErrorResponse> {
    let checkedRequest: JsonRpcRequest;
    try {
      checkedRequest = parseJsonRpcRequest(request);
    } catch (error) {
      const requestId = parseJsonRpcId(request);
      const errorResponse: JsonRpcErrorResponse = {
        jsonrpc: "2.0",
        id: requestId,
        error: {
          code: jsonRpcCodeInvalidRequest,
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
   * 1. convert JsonRpcRequest into calls to SigningServerCore
   * 2. call SigningServerCore
   * 3. convert result to JSON-RPC format
   */
  public async handleChecked(request: JsonRpcRequest): Promise<JsonRpcResponse | JsonRpcErrorResponse> {
    let call: RpcCall;
    try {
      call = parseRpcCall(request);
    } catch (error) {
      const errorResponse: JsonRpcErrorResponse = {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: jsonRpcCodeMethodNotFound,
          message: error.toString(),
        },
      };
      return errorResponse;
    }

    try {
      let response: JsonRpcResponse;
      switch (call.name) {
        case "getIdentities":
          response = {
            jsonrpc: "2.0",
            id: request.id,
            result: await this.core.getIdentities(call.reason, call.chainIds),
          };
          break;
        case "signAndPost":
          response = {
            jsonrpc: "2.0",
            id: request.id,
            result: await this.core.signAndPost(call.reason, call.transaction),
          };
          break;
        default:
          throw new Error("Unsupported RPC call");
      }
      return response;
    } catch (error) {
      let errorCode: number;
      if (error instanceof ParamsError) {
        errorCode = jsonRpcCodeInvalidParams;
      } else if (error instanceof MethodNotFoundError) {
        errorCode = jsonRpcCodeMethodNotFound;
      } else {
        errorCode = jsonRpcCodeServerErrorDefault;
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
