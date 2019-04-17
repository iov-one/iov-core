// tslint:disable: deprecation
import { ChainId, isUnsignedTransaction, UnsignedTransaction } from "@iov/bcp";
import { parseJsonRpcId } from "@iov/jsonrpc";

import {
  isJsRpcCompatibleDictionary,
  jsRpcCode,
  JsRpcErrorResponse,
  JsRpcRequest,
  JsRpcResponse,
  JsRpcSuccessResponse,
  parseJsRpcRequest,
} from "./jsrpc";
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

function parseRpcCall(data: JsRpcRequest): RpcCall {
  if (!isJsRpcCompatibleDictionary(data.params)) {
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
      if (!isUnsignedTransaction(transaction)) {
        throw new ParamsError("2nd parameter (transaction) does not look like an unsigned transaction");
      }
      return {
        name: "signAndPost",
        reason: reason,
        transaction: transaction,
      };
    }
    default:
      throw new MethodNotFoundError("Unknown method name");
  }
}

/**
 * A transport-agnostic JavaScript RPC wrapper around SigningServerCore
 *
 * @deprecated use JsonRpcSigningServer and friends
 */
export class JsRpcSigningServer {
  private readonly core: SigningServerCore;

  constructor(core: SigningServerCore) {
    this.core = core;
  }

  public async handleUnchecked(request: unknown): Promise<JsRpcResponse> {
    let checkedRequest: JsRpcRequest;
    try {
      checkedRequest = parseJsRpcRequest(request);
    } catch (error) {
      const requestId = parseJsonRpcId(request);
      const errorResponse: JsRpcErrorResponse = {
        id: requestId,
        error: {
          code: jsRpcCode.invalidRequest,
          message: error.toString(),
        },
      };
      return errorResponse;
    }

    return this.handleChecked(checkedRequest);
  }

  /**
   * Handles a checked JsRpcRequest
   *
   * 1. convert JsRpcRequest into calls to SigningServerCore
   * 2. call SigningServerCore
   * 3. convert result to JS RPC format
   */
  public async handleChecked(request: JsRpcRequest): Promise<JsRpcResponse> {
    let call: RpcCall;
    try {
      call = parseRpcCall(request);
    } catch (error) {
      const errorResponse: JsRpcErrorResponse = {
        id: request.id,
        error: {
          code: jsRpcCode.methodNotFound,
          message: error.toString(),
        },
      };
      return errorResponse;
    }

    try {
      let response: JsRpcSuccessResponse;
      switch (call.name) {
        case "getIdentities":
          response = {
            id: request.id,
            result: await this.core.getIdentities(call.reason, call.chainIds),
          };
          break;
        case "signAndPost":
          response = {
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
        errorCode = jsRpcCode.invalidParams;
      } else if (error instanceof MethodNotFoundError) {
        errorCode = jsRpcCode.methodNotFound;
      } else {
        errorCode = jsRpcCode.serverErrorDefault;
      }

      const errorResponse: JsRpcErrorResponse = {
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
