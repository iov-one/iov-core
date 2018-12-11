import { Encoding } from "@iov/encoding";

import { Base64, Base64String, HexString, Integer, IntegerString, may, notEmpty } from "../encodings";
import { JsonRpcRequest, jsonRpcWith } from "../jsonrpc";
import * as requests from "../requests";

/***** queries *****/

export class Params {
  public static encodeAbciInfo(req: requests.AbciInfoRequest): JsonRpcRequest {
    return jsonRpcWith(req.method);
  }

  public static encodeAbciQuery(req: requests.AbciQueryRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, encodeAbciQueryParams(req.params));
  }

  public static encodeBlock(req: requests.BlockRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, encodeHeightParam(req.params));
  }

  public static encodeBlockchain(req: requests.BlockchainRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, encodeBlockchainRequestParams(req.params));
  }

  public static encodeBlockResults(req: requests.BlockResultsRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, encodeHeightParam(req.params));
  }

  public static encodeBroadcastTx(req: requests.BroadcastTxRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, encodeBroadcastTxParams(req.params));
  }

  public static encodeCommit(req: requests.CommitRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, encodeHeightParam(req.params));
  }

  public static encodeGenesis(req: requests.GenesisRequest): JsonRpcRequest {
    return jsonRpcWith(req.method);
  }

  public static encodeHealth(req: requests.HealthRequest): JsonRpcRequest {
    return jsonRpcWith(req.method);
  }

  public static encodeStatus(req: requests.StatusRequest): JsonRpcRequest {
    return jsonRpcWith(req.method);
  }

  public static encodeSubscribe(req: requests.SubscribeRequest): JsonRpcRequest {
    const eventTag = { key: "tm.event", value: req.query.type };
    const query = requests.buildQuery({ tags: [eventTag], raw: req.query.raw });
    return jsonRpcWith("subscribe", { query: query });
  }

  public static encodeTx(req: requests.TxRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, encodeTxParams(req.params));
  }

  // TODO: encode params for query string???
  public static encodeTxSearch(req: requests.TxSearchRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, encodeTxSearchParams(req.params));
  }

  public static encodeValidators(req: requests.ValidatorsRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, encodeHeightParam(req.params));
  }
}

interface HeightParam {
  readonly height?: number;
}
interface RpcHeightParam {
  readonly height?: IntegerString;
}
function encodeHeightParam(param: HeightParam): RpcHeightParam {
  return {
    height: may(Integer.encode, param.height),
  };
}

interface RpcBlockchainRequestParams {
  readonly minHeight?: IntegerString;
  readonly maxHeight?: IntegerString;
}
function encodeBlockchainRequestParams(param: requests.BlockchainRequestParams): RpcBlockchainRequestParams {
  return {
    minHeight: may(Integer.encode, param.minHeight),
    maxHeight: may(Integer.encode, param.maxHeight),
  };
}

interface RpcAbciQueryParams {
  readonly path: string;
  readonly data: HexString;
  readonly height?: string;
  readonly trusted?: boolean;
}
function encodeAbciQueryParams(params: requests.AbciQueryParams): RpcAbciQueryParams {
  return {
    path: notEmpty(params.path),
    data: Encoding.toHex(params.data) as HexString,
    height: may(Integer.encode, params.height),
    trusted: params.trusted,
  };
}

interface RpcBroadcastTxParams {
  readonly tx: Base64String;
}
function encodeBroadcastTxParams(params: requests.BroadcastTxParams): RpcBroadcastTxParams {
  return {
    tx: Base64.encode(notEmpty(params.tx)),
  };
}

interface RpcTxParams {
  readonly hash: Base64String;
  readonly prove?: boolean;
}
function encodeTxParams(params: requests.TxParams): RpcTxParams {
  return {
    hash: Base64.encode(notEmpty(params.hash)),
    prove: params.prove,
  };
}

interface RpcTxSearchParams {
  readonly query: requests.QueryString;
  readonly prove?: boolean;
  readonly page?: IntegerString;
  readonly per_page?: IntegerString;
}
function encodeTxSearchParams(params: requests.TxSearchParams): RpcTxSearchParams {
  return {
    query: params.query,
    prove: params.prove,
    page: may(Integer.encode, params.page),
    per_page: may(Integer.encode, params.per_page),
  };
}
