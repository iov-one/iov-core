import { Encoding } from "@iov/crypto";
import {
  BroadcastTxCommitResponse,
  Client as TendermintClient,
  StatusResponse,
  txCommitSuccess,
} from "@iov/tendermint-rpc";
import {
  AddressBytes,
  BcpAccountQuery,
  BcpAddressQuery,
  BcpCoin,
  BcpQueryEnvelope,
  BcpTransactionResponse,
  ChainId,
  PostableBytes,
  TxCodec,
} from "@iov/types";

import * as codec from "./codec";
import { Codec as BNSCodec } from "./txcodec";
import { decodeToken, ensure } from "./types";

export interface Result {
  readonly key: Uint8Array;
  readonly value: Uint8Array;
}

export interface QueryResponse {
  readonly height?: number;
  readonly results: ReadonlyArray<Result>;
}

/* TODOS */
export type TxResponse = BroadcastTxCommitResponse;
export type BcpAccount = any;
export type BcpNonce = any;

const queryByAddress = (query: BcpAccountQuery): query is BcpAddressQuery =>
  (query as BcpAddressQuery).address !== undefined;

// const getAddr = key => ({address: key.slice(5).toString('hex')});
// const queryAccount = (client, acct) => client.queryParseOne(acct, "/wallets", weave.weave.cash.Set, getAddr);
// const querySigs = (client, acct) => client.queryParseOne(acct, "/auth", weave.weave.sigs.UserData, getAddr);

// Client talks directly to the BNS blockchain and exposes the
// same interface we have with the BCP protocol.
// We can embed in web4 process or use this in a BCP-relay
export class Client {
  // export class Client implements BcpClient {
  protected readonly tmClient: TendermintClient;
  protected readonly codec: TxCodec;
  protected readonly myChain: ChainId;

  constructor(tmClient: TendermintClient) {
    this.tmClient = tmClient;
    this.codec = BNSCodec;

    // TODO: proper initialization
    // this.myChain = this.chainID();
    this.myChain = "best-chain" as ChainId;
  }

  public async postTx(tx: PostableBytes): Promise<BcpTransactionResponse> {
    const txresp = await this.tmClient.broadcastTxCommit({ tx });
    const message = txresp.deliverTx ? txresp.deliverTx.log : txresp.checkTx.log;
    return {
      metadata: {
        status: txCommitSuccess(txresp),
      },
      data: {
        message: message || "",
      },
    };
  }

  // const getAddr = key => ({address: key.slice(5).toString('hex')});
  // const queryAccount = (client, acct) => client.queryParseOne(acct, "/wallets", bov.namecoin.Wallet, getAddr);
  // const queryAccountByName = (client, name) => client.queryParseOne(Buffer.from(name), "/wallets/name", bov.namecoin.Wallet, getAddr);
  // const querySigs = (client, acct) => client.queryParseOne(acct, "/auth", bov.sigs.UserData, getAddr);

  // public getTicker(ticker: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>> {
  //   throw new Error("not yet implemented");
  // }

  // readonly getAllTickers: () => Promise<BcpQueryEnvelope<BcpTicker>>;

  public async getAccount(account: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>> {
    const res = queryByAddress(account)
      ? this.query("/wallets", account.address)
      : this.query("/wallets/name", Encoding.asAscii(account.name));
    const parser = parseMap(codec.namecoin.Wallet, 5);
    const data = (await res).results.map(parser).map(this.normalizeAccount);
    return {
      metadata: {
        offset: 0,
        limit: 100,
      },
      data: data,
    };
  }

  // readonly getNonce: (account: BcpAccountQuery) => Promise<BcpQueryEnvelope<BcpNonce>>;

  public async chainID(): Promise<ChainId> {
    const status = await this.status();
    return status.nodeInfo.network;
  }

  public async height(): Promise<number> {
    const status = await this.status();
    return status.syncInfo.latestBlockHeight;
  }

  public status(): Promise<StatusResponse> {
    return this.tmClient.status();
  }

  protected async query(path: string, data: Uint8Array): Promise<QueryResponse> {
    const q = await this.tmClient.abciQuery({ path, data });
    if (!q.key) {
      return { height: q.height, results: [] };
    }
    const keys = codec.app.ResultSet.decode(q.key).results;
    const values = codec.app.ResultSet.decode(q.value).results;
    const results: ReadonlyArray<Result> = zip(keys, values);
    return { height: q.height, results };
  }

  protected normalizeAccount(acct: codec.namecoin.IWallet & Keyed): BcpAccount {
    // append the chainID to the name to universalize it
    const name = acct.name ? `${acct.name}*${this.myChain}` : undefined;
    return {
      name,
      address: acct._id as AddressBytes,
      balance: ensure(acct.coins).map(this.normalizeCoin),
    };
  }

  protected normalizeCoin(coin: codec.x.ICoin): BcpCoin {
    const token = decodeToken(coin);
    return {
      ...token,
      // TODO: look these up dynamically
      tokenName: "BCP Token",
      sigFigs: 9,
    };
  }
}

interface Keyed {
  readonly _id: Uint8Array;
}

interface Decoder<T extends object> {
  readonly decode: (data: Uint8Array) => T;
}

function parseMap<T extends {}>(decoder: Decoder<T>, sliceKey: number): (res: Result) => T & Keyed {
  const mapper = (res: Result): T & Keyed => {
    const val: T = decoder.decode(res.value);
    // bug: https://github.com/Microsoft/TypeScript/issues/13557
    // workaround from: https://github.com/OfficeDev/office-ui-fabric-react/blob/1dbfc5ee7c38e982282f13ef92884538e7226169/packages/foundation/src/createComponent.tsx#L62-L64
    // tslint:disable-next-line:prefer-object-spread
    return Object.assign({}, val, { _id: res.key.slice(sliceKey) });
  };
  return mapper;
}

/* maybe a bit abstract, but maybe we can reuse... */

interface Join<T, U> {
  readonly key: T;
  readonly value: U;
}

function zip<T, U>(keys: ReadonlyArray<T>, values: ReadonlyArray<U>): ReadonlyArray<Join<T, U>> {
  if (keys.length !== values.length) {
    throw Error("Got " + keys.length + " keys but " + values.length + " values");
  }
  return keys.map((key, i) => ({ key, value: values[i] }));
}
