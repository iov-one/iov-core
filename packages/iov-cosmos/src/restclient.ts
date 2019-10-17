import { Address } from "@iov/bcp";
import amino from "@tendermint/amino-js";
import axios from "axios";

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

type RestClientResponse = NodeInfoResponse | BlocksResponse | AuthAccountsResponse;

export class RestClient {
  private readonly baseUrl: string;

  public constructor(url: string) {
    this.baseUrl = url;
  }

  public async get(path: string): Promise<RestClientResponse> {
    const url = this.baseUrl + path;
    return axios.request({ url: url, method: "GET" }).then(res => res.data);
  }

  public async nodeInfo(): Promise<NodeInfoResponse> {
    const responseData = await this.get("/node_info");
    if (!(responseData as any).node_info) {
      throw new Error("Unexpected response data format");
    }
    return responseData as NodeInfoResponse;
  }

  public async blocksLatest(): Promise<BlocksResponse> {
    const responseData = await this.get("/blocks/latest");
    if (!(responseData as any).block) {
      throw new Error("Unexpected response data format");
    }
    return responseData as BlocksResponse;
  }

  public async blocks(height: number): Promise<BlocksResponse> {
    const responseData = await this.get(`/blocks/${height}`);
    if (!(responseData as any).block) {
      throw new Error("Unexpected response data format");
    }
    return responseData as BlocksResponse;
  }

  public async authAccounts(address: Address): Promise<AuthAccountsResponse> {
    const responseData = await this.get(`/auth/accounts/${address}`);
    if ((responseData as any).result.type !== "cosmos-sdk/Account") {
      throw new Error("Unexpected response data format");
    }
    return responseData as AuthAccountsResponse;
  }
}
