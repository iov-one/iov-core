import { Address, PostableBytes, TransactionId } from "@iov/bcp";
import { Encoding } from "@iov/encoding";
import { Client as TendermintClient, BlockResponse, AbciQueryResponse } from "@iov/tendermint-rpc";

import {
  AuthAccountsResponse,
  BlocksResponse,
  CosmosClient,
  NodeInfoResponse,
  PostTxsResponse,
  SearchTxsResponse,
  TxsResponse,
} from "./cosmosclient";
import { decodeBech32 } from "@tendermint/amino-js";

const { toHex, toUtf8 } = Encoding;

function parseAuthAccountsResponse(response: AbciQueryResponse): AuthAccountsResponse {
  console.log(response);
  throw new Error("not implemented");
  // return decodeAccount(response.value, false);
}

function parseBlocksResponse(response: BlockResponse): BlocksResponse {
  return {
    blockMeta: {
      ...response.blockMeta,
      header: {
        ...response.blockMeta.header,
        time: response.blockMeta.header.time.toString(),
      },
      blockId: {
        ...response.blockMeta.blockId,
        hash: toHex(response.blockMeta.blockId.hash),
      },
    },
    block: response.block,
  };
}

export class RpcClient implements CosmosClient {
  public static async establish(url: string): Promise<RpcClient> {
    const tmClient = await TendermintClient.connect(url);
    return new RpcClient(tmClient);
  }

  private readonly tmClient: TendermintClient;

  private constructor(tmClient: TendermintClient) {
    this.tmClient = tmClient;
  }

  public async authAccounts(address: Address, height?: string): Promise<AuthAccountsResponse> {
    const params = {
      path: "custom/acc/account",
      data: decodeBech32(address)[1],
    };
    const response = await this.tmClient.abciQuery(params);
    console.log(response);
    throw new Error("not implemented");
    // return parseAuthAccountsResponse(response);
  }

  public async blocks(): Promise<BlocksResponse> {
    throw new Error("not implemented");
  }

  public async blocksLatest(): Promise<BlocksResponse> {
    const response = await this.tmClient.block();
    return parseBlocksResponse(response);
  }

  public async nodeInfo(): Promise<NodeInfoResponse> {
    return this.tmClient.status();
  }

  public async postTx(tx: PostableBytes): Promise<PostTxsResponse> {
    throw new Error("not implemented");
  }

  public async txs(query: string): Promise<SearchTxsResponse> {
    throw new Error("not implemented");
  }

  public async txsById(id: TransactionId): Promise<TxsResponse> {
    throw new Error("not implemented");
  }
}
