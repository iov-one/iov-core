import { Address } from "@iov/bcp";
import amino from "@tendermint/amino-js";
interface NodeInfo {
  readonly network: string;
}
interface NodeInfoResponse {
  readonly node_info: NodeInfo;
}
interface BlockMeta {
  readonly header: {
    readonly height: number;
    readonly time: string;
    readonly num_txs: number;
  };
  readonly block_id: {
    readonly hash: string;
  };
}
interface Block {
  readonly header: {
    readonly height: number;
  };
}
interface BlocksResponse {
  readonly block_meta: BlockMeta;
  readonly block: Block;
}
interface AuthAccountsResponse {
  readonly result: {
    readonly value: amino.BaseAccount;
  };
}
declare type RestClientResponse = NodeInfoResponse | BlocksResponse | AuthAccountsResponse;
export declare class RestClient {
  private readonly baseUrl;
  constructor(url: string);
  get(path: string): Promise<RestClientResponse>;
  nodeInfo(): Promise<NodeInfoResponse>;
  blocksLatest(): Promise<BlocksResponse>;
  blocks(height: number): Promise<BlocksResponse>;
  authAccounts(address: Address): Promise<AuthAccountsResponse>;
}
export {};
