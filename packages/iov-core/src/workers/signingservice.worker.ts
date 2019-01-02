/// <reference lib="webworker" />

/// A proof-of-work RPC server for the out pf process signer

import { ChainId, UnsignedTransaction } from "@iov/bcp-types";
import { bnsConnector } from "@iov/bns";
import { ethereumConnector } from "@iov/ethereum";
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
import { Ed25519HdWallet, HdPaths, Secp256k1HdWallet, UserProfile } from "@iov/keycontrol";

import { MultiChainSigner } from "../multichainsigner";
import { SigningServerCore } from "../signingservercore";

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
      const reason = data.params.reason;
      const chainIds = data.params.chainIds;
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
      const reason = data.params.reason;
      const transaction = data.params.transaction;
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

const bnsdUrl = "ws://localhost:22345";
const bnsdFaucetMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
const ethereumUrl = "http://localhost:8545";
const ganacheMnemonic = "oxygen fall sure lava energy veteran enroll frown question detail include maximum";

async function main(): Promise<void> {
  const profile = new UserProfile();
  const ed25519Wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(bnsdFaucetMnemonic));
  const secp256k1Wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(ganacheMnemonic));
  const signer = new MultiChainSigner(profile);

  const bnsdConnection = (await signer.addChain(bnsConnector(bnsdUrl))).connection;
  const bnsdChainId = bnsdConnection.chainId();
  const ethereumConnection = (await signer.addChain(ethereumConnector(ethereumUrl, undefined))).connection;
  const ethereumChainId = ethereumConnection.chainId();

  // faucet identity
  await profile.createIdentity(ed25519Wallet.id, bnsdChainId, HdPaths.simpleAddress(0));
  // ganache second identity
  await profile.createIdentity(secp256k1Wallet.id, ethereumChainId, HdPaths.bip44(60, 0, 0, 1));

  const serverCore = new SigningServerCore(profile, signer);

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
            result: await serverCore.getIdentities(call.reason, call.chainIds),
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
