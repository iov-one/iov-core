import axios from "axios";
import { Stream } from "xstream";

import {
  BcpAccount,
  BcpAccountQuery,
  BcpConnection,
  BcpNonce,
  BcpQueryEnvelope,
  BcpTicker,
  BcpTransactionResponse,
  ConfirmedTransaction,
  TokenTicker,
} from "@iov/bcp-types";
import { ChainId, PostableBytes, Tag, TxQuery } from "@iov/tendermint-types";
import { decodeHexQuantity } from "./utils";

async function loadChainId(baseUrl: string): Promise<ChainId> {
  // see https://github.com/ethereum/wiki/wiki/JSON-RPC#net_version
  const result = await axios.post(baseUrl, {
    jsonrpc: "2.0",
    method: "net_version",
    params: [],
    id: 1,
  });
  const responseBody = result.data;
  return responseBody.result;
}

export class EthereumConnection implements BcpConnection {
  public static async establish(baseUrl: string): Promise<EthereumConnection> {
    const chainId = await loadChainId(baseUrl);
    return new EthereumConnection(baseUrl, chainId);
  }

  private readonly baseUrl: string;
  private readonly myChainId: ChainId;

  constructor(baseUrl: string, chainId: ChainId) {
    this.baseUrl = baseUrl;

    if (!chainId.match(/^[0-9]*$/)) {
      // see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md#specification
      throw new Error("Ethereum chain ID must be a string of numbers.");
    }
    this.myChainId = chainId;
  }

  public disconnect(): void {
    // no-op
  }

  public chainId(): ChainId {
    return this.myChainId;
  }

  public async height(): Promise<number> {
    // see https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_blocknumber
    const result = await axios.post(this.baseUrl, {
      jsonrpc: "2.0",
      method: "eth_blockNumber",
      params: [],
      id: 2,
    });
    const responseBody = result.data;
    return decodeHexQuantity(responseBody.result);
  }

  public async postTx(_: PostableBytes): Promise<BcpTransactionResponse> {
    throw new Error("Not implemented");
  }

  public getTicker(_: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>> {
    throw new Error("Not implemented");
  }

  public getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>> {
    throw new Error("Not implemented");
  }

  public async getAccount(_: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>> {
    throw new Error("Not implemented");
  }

  public getNonce(_: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpNonce>> {
    throw new Error("Not implemented");
  }

  public changeBlock(): Stream<number> {
    throw new Error("Not implemented");
  }

  public watchAccount(_: BcpAccountQuery): Stream<BcpAccount | undefined> {
    throw new Error("Not implemented");
  }

  public watchNonce(_: BcpAccountQuery): Stream<BcpNonce | undefined> {
    throw new Error("Not implemented");
  }

  public searchTx(_: TxQuery): Promise<ReadonlyArray<ConfirmedTransaction>> {
    throw new Error("Not implemented");
  }

  public listenTx(_: ReadonlyArray<Tag>): Stream<ConfirmedTransaction> {
    throw new Error("Not implemented");
  }

  public liveTx(_: TxQuery): Stream<ConfirmedTransaction> {
    throw new Error("Not implemented");
  }
}
