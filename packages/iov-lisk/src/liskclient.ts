import axios from "axios";
import { Stream } from "xstream";

import {
  Address,
  BcpAccount,
  BcpAccountQuery,
  BcpAddressQuery,
  BcpNonce,
  BcpQueryEnvelope,
  BcpTicker,
  BcpTransactionResponse,
  ConfirmedTransaction,
  IovReader,
  TokenTicker,
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { ChainId, PostableBytes, Tag, TxQuery } from "@iov/tendermint-types";
import { Parse } from "./parse";

function isAddressQuery(query: BcpAccountQuery): query is BcpAddressQuery {
  return (query as BcpAddressQuery).address !== undefined;
}

export class LiskClient implements IovReader {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public disconnect(): void {
    // no-op
  }

  public async chainId(): Promise<ChainId> {
    const url = this.baseUrl + "/api/node/constants";
    const result = await axios.get(url);
    const responseBody = result.data;
    return responseBody.data.nethash;
  }

  public async height(): Promise<number> {
    const url = this.baseUrl + "/api/node/status";
    const result = await axios.get(url);
    const responseBody = result.data;
    return responseBody.data.height;
  }

  public postTx(_: PostableBytes): Promise<BcpTransactionResponse> {
    throw new Error("Not implemented");
  }

  public getTicker(_: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>> {
    throw new Error("Not implemented");
  }

  public getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>> {
    throw new Error("Not implemented");
  }

  public async getAccount(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>> {
    if (isAddressQuery(query)) {
      const address = query.address;
      const url = this.baseUrl + `/api/accounts?address=${Encoding.fromAscii(address)}`;
      const result = await axios.get(url);
      const responseBody = result.data;

      const account: BcpAccount = {
        address: address,
        name: undefined,
        balance: [
          {
            sigFigs: 8,
            tokenName: undefined,
            ...Parse.liskAmount(responseBody.data[0].balance),
          },
        ],
      };

      const wrapped: BcpQueryEnvelope<BcpAccount> = {
        metadata: {
          offset: 0,
          limit: 0,
        },
        data: [account],
      };

      return wrapped;
    } else {
      throw new Error("Query type not supported");
    }
  }

  public getNonce(_: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpNonce>> {
    throw new Error("Not implemented");
  }

  public changeBalance(_: Address): Stream<number> {
    throw new Error("Not implemented");
  }

  public changeNonce(_: Address): Stream<number> {
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
