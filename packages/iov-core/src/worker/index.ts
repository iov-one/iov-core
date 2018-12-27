/// <reference lib="webworker" />

import { ChainId, UnsignedTransaction } from "@iov/bcp-types";
import { UserProfile } from "@iov/keycontrol";

import {
  jsonRpcCodeInvalidRequest,
  jsonRpcCodeMethodNotFound,
  jsonRpcCodeServerErrorDefault,
  JsonRpcErrorResponse,
  JsonRpcRequest,
  JsonRpcResponse,
} from "../jsonrpcclient";
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

function parseJsonRpcId(data: any): number | null {
  const id = data.id;
  if (typeof id !== "number") {
    return null;
  }
  return id;
}

function parseJsonRpc(data: any): JsonRpcRequest {
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

function parseRpcCall(data: JsonRpcRequest): RpcCall {
  switch (data.method) {
    case "getIdentities":
      return {
        name: "getIdentities",
        reason: data.params[0],
        chainId: data.params[1],
      };
    case "signAndPost":
      return {
        name: "signAndPost",
        reason: data.params[0],
        transaction: data.params[1],
      };
    default:
      throw new Error("Unknown method name");
  }
}

console.log("Starting worker");

const profile = new UserProfile();
const signer = new MultiChainSigner(profile);
const serverCore = new ServerCore(profile, signer);

onmessage = async event => {
  console.log("Received message", JSON.stringify(event));

  // filter out empty {"isTrusted":true} events
  if (!event.data) {
    return;
  }

  const requestId = parseJsonRpcId(event.data);

  let request: JsonRpcRequest;
  try {
    request = parseJsonRpc(event.data);
  } catch (error) {
    const errorResponse: JsonRpcErrorResponse = {
      jsonrpc: "2.0",
      id: requestId,
      error: {
        code: jsonRpcCodeInvalidRequest,
        message: error.toString(),
      },
    };
    postMessage(errorResponse);
    return;
  }

  let call: RpcCall;
  try {
    call = parseRpcCall(request);
  } catch (error) {
    const errorResponse: JsonRpcErrorResponse = {
      jsonrpc: "2.0",
      id: requestId,
      error: {
        code: jsonRpcCodeMethodNotFound,
        message: error.toString(),
      },
    };
    postMessage(errorResponse);
    return;
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
    postMessage(response);
    return;
  } catch (error) {
    console.error(error);
    const errorResponse: JsonRpcErrorResponse = {
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: jsonRpcCodeServerErrorDefault,
        message: error.toString(),
      },
    };
    postMessage(errorResponse);
    return;
  }
};
