import { ChainId, Identity, isIdentity, isUnsignedTransaction, UnsignedTransaction } from "@iov/bcp";
import { isJsonCompatibleDictionary, TransactionEncoder } from "@iov/encoding";
import {
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
  readonly chainIds: readonly ChainId[];
}

interface RpcCallSignAndPost {
  readonly name: "signAndPost";
  readonly reason: string;
  readonly signer: Identity;
  readonly transaction: UnsignedTransaction;
}

type RpcCall = RpcCallGetIdentities | RpcCallSignAndPost;

class ParamsError extends Error {}
class MethodNotFoundError extends Error {
  public constructor(message?: string) {
    super(message || "Unknown method name");
  }
}

function isArrayOfStrings(array: readonly any[]): array is readonly string[] {
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
      const { signer, reason, transaction } = TransactionEncoder.fromJson(data.params);
      if (!isIdentity(signer)) {
        throw new ParamsError("Parameter 'signer' does not look like an identity");
      }
      if (typeof reason !== "string") {
        throw new ParamsError("Parameter 'reason' must be a string");
      }
      if (!isUnsignedTransaction(transaction)) {
        throw new ParamsError("Parameter 'transaction' does not look like an unsigned transaction");
      }
      return {
        name: "signAndPost",
        reason: reason,
        signer: signer,
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

  public constructor(core: SigningServerCore) {
    this.core = core;
  }

  /**
   * Handles a request from a possibly untrusted source.
   *
   * 1. Parse request as a JSON-RPC request
   * 2. Convert JSON-RPC request into calls to SigningServerCore
   * 3. Call SigningServerCore
   * 4. Convert result to JSON-RPC response
   *
   * @param request The JSON-RPC request to be handled
   * @param meta An arbitrary object that is passed by reference into the autorization callbacks
   */
  public async handleUnchecked(request: unknown, meta?: any): Promise<JsonRpcResponse> {
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

    return this.handleChecked(checkedRequest, meta);
  }

  /**
   * Handles a checked request, i.e. a request that is known to be a valid
   * JSON-RPC "Request object".
   *
   * 1. Convert JSON-RPC request into calls to SigningServerCore
   * 2. Call SigningServerCore
   * 3. Convert result to JSON-RPC response
   *
   * @param request The JSON-RPC request to be handled
   * @param meta An arbitrary object that is passed by reference into the autorization callbacks
   */
  public async handleChecked(request: JsonRpcRequest, meta?: any): Promise<JsonRpcResponse> {
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
        case "getIdentities": {
          const result = await this.core.getIdentities(call.reason, call.chainIds, meta);
          response = {
            jsonrpc: "2.0",
            id: request.id,
            result: TransactionEncoder.toJson(result),
          };
          break;
        }
        case "signAndPost": {
          const result = await this.core.signAndPost(call.signer, call.reason, call.transaction, meta);
          response = {
            jsonrpc: "2.0",
            id: request.id,
            result: TransactionEncoder.toJson(result),
          };
          break;
        }
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
