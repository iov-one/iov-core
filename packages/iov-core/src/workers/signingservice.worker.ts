/// <reference lib="webworker" />

/// A proof-of-work RPC server for the out pf process signer

import { ChainId, UnsignedTransaction } from "@iov/bcp-types";
import { bnsConnector } from "@iov/bns";
import {
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
import { Ed25519HdWallet, HdPaths, UserProfile } from "@iov/keycontrol";

import { MultiChainSigner } from "../multichainsigner";
import { ServerCore } from "../servercore";

interface RpcCallGetIdentities {
  readonly name: "getIdentities";
  readonly reason: string;
  readonly chainId: ChainId;
}

interface RpcCallSignAndPost {
  readonly name: "signAndPost";
  readonly reason: string;
  readonly transaction: UnsignedTransaction;
}

type RpcCall = RpcCallGetIdentities | RpcCallSignAndPost;

class ParamsError extends Error {}
class MethodNotFoundError extends Error {}

function parseRpcCall(data: JsonRpcRequest): RpcCall {
  const params: ReadonlyArray<unknown> = data.params;

  switch (data.method) {
    case "getIdentities": {
      const reason = params[0];
      const chainId = params[1];
      if (typeof reason !== "string") {
        throw new ParamsError("1st parameter (reason) must be a string");
      }
      if (typeof chainId !== "string") {
        throw new ParamsError("2nd parameter (chainId) must be a string");
      }
      return {
        name: "getIdentities",
        reason: reason,
        chainId: chainId as ChainId,
      };
    }
    case "signAndPost": {
      const reason = params[0];
      const transaction = params[1];
      if (typeof reason !== "string") {
        throw new ParamsError("1st parameter (reason) must be a string");
      }
      if (typeof transaction !== "object") {
        throw new ParamsError("2nd parameter (transaction) must be an object");
      }
      return {
        name: "signAndPost",
        reason: reason,
        transaction: transaction as UnsignedTransaction,
      };
    }
    default:
      throw new MethodNotFoundError("Unknown method name");
  }
}

const bnsdUrl = "ws://localhost:22345";
const defaultMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";

async function main(): Promise<void> {
  const profile = new UserProfile();
  const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(defaultMnemonic));
  const signer = new MultiChainSigner(profile);
  const { connection } = await signer.addChain(bnsConnector(bnsdUrl));
  const chainId = connection.chainId();
  const serverCore = new ServerCore(profile, signer);
  // faucet identity
  await profile.createIdentity(wallet.id, chainId, HdPaths.simpleAddress(0));

  async function handleRequest(event: any): Promise<JsonRpcResponse | JsonRpcErrorResponse> {
    let request: JsonRpcRequest;
    try {
      request = parseJsonRpcRequest(event.data);
    } catch (error) {
      const requestId = parseJsonRpcId(event.data);
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
            result: await serverCore.getIdentities(call.reason, call.chainId),
          };
          break;
        case "signAndPost":
          response = {
            jsonrpc: "2.0",
            id: request.id,
            result: await serverCore.signAndPost(call.reason, call.transaction),
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

  onmessage = async event => {
    // console.log("Received message", JSON.stringify(event));

    // filter out empty {"isTrusted":true} events
    if (!event.data) {
      return;
    }

    const response = await handleRequest(event);
    postMessage(response);
  };
}

main();
