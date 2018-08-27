import { Encoding } from "@iov/encoding";

import { JsonRpcRequest, jsonRpcWith } from "../common";
import { Base64, Base64String, HexString, notEmpty } from "../encodings";
import * as requests from "../requests";

/***** queries *****/

export class Params extends requests.DefaultParams {
  public static encodeAbciQuery(req: requests.AbciQueryRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, encodeAbciQueryParams(req.params));
  }

  public static encodeBlock(req: requests.BlockRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, req.params);
  }

  public static encodeBlockchain(req: requests.BlockchainRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, req.params);
  }

  public static encodeBlockResults(req: requests.BlockResultsRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, req.params);
  }

  public static encodeBroadcastTx(req: requests.BroadcastTxRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, encodeBroadcastTxParams(req.params));
  }

  public static encodeCommit(req: requests.CommitRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, req.params);
  }

  public static encodeSubscribe(req: requests.SubscribeRequest): JsonRpcRequest {
    return jsonRpcWith("subscribe", { query: `tm.event='${req.type}'` });
  }

  public static encodeTx(req: requests.TxRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, encodeTxParams(req.params));
  }

  // TODO: encode params for query string???
  public static encodeTxSearch(req: requests.TxSearchRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, req.params);
  }

  public static encodeValidators(req: requests.ValidatorsRequest): JsonRpcRequest {
    return jsonRpcWith(req.method, req.params);
  }
}

interface RpcAbciQueryParams {
  readonly path: string;
  readonly data: HexString;
  readonly height?: number;
  readonly trusted?: boolean;
}
const encodeAbciQueryParams = (params: requests.AbciQueryParams): RpcAbciQueryParams => ({
  path: notEmpty(params.path),
  data: Encoding.toHex(params.data) as HexString,
  height: params.height,
  trusted: params.trusted,
});

interface RpcBroadcastTxParams {
  readonly tx: Base64String;
}
const encodeBroadcastTxParams = (params: requests.BroadcastTxParams): RpcBroadcastTxParams => ({
  tx: Base64.encode(notEmpty(params.tx)),
});

interface RpcTxParams {
  readonly hash: Base64String;
  readonly prove?: boolean;
}
const encodeTxParams = (params: requests.TxParams): RpcTxParams => ({
  hash: Base64.encode(notEmpty(params.hash)),
  prove: params.prove,
});

// TODO: clarify this type
// Do we need to transform query???
// interface RpcTxSearchParams {
//   readonly query: QueryString;
//   readonly prove?: boolean;
//   readonly page?: number;
//   readonly per_page?: number;
// }
