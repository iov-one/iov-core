import { Address, PostableBytes, TransactionId } from "@iov/bcp";
import {
  AuthAccountsResponse,
  BlocksResponse,
  CosmosClient,
  NodeInfoResponse,
  PostTxsResponse,
  SearchTxsResponse,
  TxsResponse,
} from "./cosmosclient";
export declare class RpcClient implements CosmosClient {
  static establish(url: string): Promise<RpcClient>;
  private readonly tmClient;
  private constructor();
  authAccounts(address: Address, height?: string): Promise<AuthAccountsResponse>;
  blocks(): Promise<BlocksResponse>;
  blocksLatest(): Promise<BlocksResponse>;
  nodeInfo(): Promise<NodeInfoResponse>;
  postTx(tx: PostableBytes): Promise<PostTxsResponse>;
  txs(query: string): Promise<SearchTxsResponse>;
  txsById(id: TransactionId): Promise<TxsResponse>;
}
