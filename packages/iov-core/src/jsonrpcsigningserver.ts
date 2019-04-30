import { ChainId, isUnsignedTransaction, UnsignedTransaction } from "@iov/bcp";
import {
  isJsonCompatibleDictionary,
  jsonRpcCode,
  JsonRpcErrorResponse,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcSuccessResponse,
  parseJsonRpcId,
  parseJsonRpcRequest,
} from "@iov/jsonrpc";

import { SigningServerCore } from "./signingservercore";
import { TransactionEncoder } from "./transactionencoder";

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
class MethodNotFoundError extends Error {
  constructor(message?: string) {
    super(message || "Unknown method name");
  }
}

function isArrayOfStrings(array: ReadonlyArray<any>): array is ReadonlyArray<string> {
  return array.every(element => typeof element === "string");
}

function parseRpcCall(data: JsonRpcRequest): RpcCall {
  if (!isJsonCompatibleDictionary(data.params)) {
    throw new Error("Request params are only supported as dictionary");
  }

  switch (data.method) {
    case "getIdentities": {
      const { reason, chainIds } = TransactionEncoder.fromJson(data.params);
      if (typeof reason !== "string") {
        throw new ParamsError("Parameter 'reason' must be a string");
      }
      if (!Array.isArray(chainIds) || !isArrayOfStrings(chainIds)) {
        throw new ParamsError("Parameter 'chainIds' must be an array of strings");
      }
      return {
        name: "getIdentities",
        reason: reason,
        chainIds: chainIds,
      };
    }
    case "signAndPost": {
      const { reason, transaction } = TransactionEncoder.fromJson(data.params);
      if (typeof reason !== "string") {
        throw new ParamsError("Parameter 'reason' must be a string");
      }
      if (!isUnsignedTransaction(transaction)) {
        throw new ParamsError("Parameter 'transaction' does not look like an unsigned transaction");
      }
      return {
        name: "signAndPost",
        reason: reason,
        transaction: transaction,
      };
    }
    default:
      throw new MethodNotFoundError();
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

  /**
   * Handles a request from a possible untrusted source.
   */
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
   * Handles a checked request, i.e. a request that is known to be a valid
   * JSON-RPC "Request object".
   *
   * 1. convert JsonRpcRequest into calls to SigningServerCore
   * 2. call SigningServerCore
   * 3. convert result to JSON-RPC format
   */
  public async handleChecked(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    let call: RpcCall;
    try {
      call = parseRpcCall(request);
    } catch (error) {
      let errorCode: number;
      if (error instanceof MethodNotFoundError) {
        errorCode = jsonRpcCode.methodNotFound;
      } else if (error instanceof ParamsError) {
        errorCode = jsonRpcCode.invalidParams;
      } else {
        // An unexpected error is the server's fault
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

    try {
      let response: JsonRpcSuccessResponse;
      switch (call.name) {
        case "getIdentities":
          response = {
            jsonrpc: "2.0",
            id: request.id,
            result: TransactionEncoder.toJson(await this.core.getIdentities(call.reason, call.chainIds)),
          };
          break;
        case "signAndPost":
          // Simplify when https://github.com/iov-one/iov-core/issues/929 is done
          const result = (await this.core.signAndPost(call.reason, call.transaction)) || null;
          response = {
            jsonrpc: "2.0",
            id: request.id,
            result: TransactionEncoder.toJson(result),
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
