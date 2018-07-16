import { Encoding } from "@iov/crypto";
import { Client as TendermintClient, StatusResponse, txCommitSuccess } from "@iov/tendermint-rpc";
import {
  AddressBytes,
  BcpAccount,
  BcpAccountQuery,
  BcpAddressQuery,
  BcpClient,
  BcpCoin,
  BcpData,
  BcpNonce,
  BcpQueryEnvelope,
  BcpTicker,
  BcpTransactionResponse,
  ChainId,
  Nonce,
  PostableBytes,
  TokenTicker,
  TxCodec,
} from "@iov/types";

import * as codec from "./codec";
import { Codec as BNSCodec } from "./txcodec";
import { asLong, decodePubKey, decodeToken, ensure } from "./types";

// queryByAddress is a type guard to use in the account-based queries
const queryByAddress = (query: BcpAccountQuery): query is BcpAddressQuery =>
  (query as BcpAddressQuery).address !== undefined;

// InitData is all the queries we do on initialization to be
// reused by later calls
interface InitData {
  readonly chainId: ChainId;
  readonly tickers: Map<string, BcpTicker>;
}

// Client talks directly to the BNS blockchain and exposes the
// same interface we have with the BCP protocol.
// We can embed in web4 process or use this in a BCP-relay
export class Client implements BcpClient {
  protected readonly tmClient: TendermintClient;
  protected readonly codec: TxCodec;
  protected readonly initData: Promise<InitData>;

  constructor(tmClient: TendermintClient) {
    this.tmClient = tmClient;
    this.codec = BNSCodec;
    // Note: this just requests the data and doesn't wait for the result
    // the response is preloaded the first time we query an account
    this.initData = this.initialize();
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

  public async getTicker(ticker: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>> {
    const res = await this.query("/tokens", Encoding.asAscii(ticker));
    const parser = parseMap(codec.namecoin.Token, 4);
    const data = res.results.map(parser).map(this.normalizeToken);
    return dummyEnvelope(data);
  }

  public async getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>> {
    const res = await this.query("/tokens?prefix", Uint8Array.from([]));
    const parser = parseMap(codec.namecoin.Token, 4);
    const data = res.results.map(parser).map(this.normalizeToken);
    return dummyEnvelope(data);
  }

  public async getAccount(account: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>> {
    const res = queryByAddress(account)
      ? this.query("/wallets", account.address)
      : this.query("/wallets/name", Encoding.asAscii(account.name));
    const parser = parseMap(codec.namecoin.Wallet, 5);
    const parsed = (await res).results.map(parser);
    const initData = await this.initData;
    const data = parsed.map(this.normalizeAccount(initData));
    return dummyEnvelope(data);
  }

  public async getNonce(account: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpNonce>> {
    // getAddress will do a lookup from name -> address if needed
    // make this an async function so easier to switch on return value
    const getAddress = async (): Promise<Uint8Array | undefined> => {
      if (queryByAddress(account)) {
        return account.address;
      }
      const addrRes = await this.getAccount(account);
      if (addrRes.data.length === 0) {
        return undefined;
      }
      return addrRes.data[0].address;
    };

    const addr = await getAddress();
    if (!addr) {
      return dummyEnvelope([]);
    }
    const res = this.query("/sigs", addr);
    const parser = parseMap(codec.sigs.UserData, 5);
    const data = (await res).results.map(parser).map(this.normalizeNonce);
    return dummyEnvelope(data);
  }

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

  protected async initialize(): Promise<InitData> {
    const chainId = await this.chainID();
    const all = await this.getAllTickers();
    const toKeyValue = (t: BcpTicker): [string, BcpTicker] => [t.tokenTicker, t];
    const tickers = new Map(all.data.map(toKeyValue));
    return { chainId, tickers };
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

  protected normalizeNonce(acct: codec.sigs.IUserData & Keyed): BcpNonce {
    // append the chainID to the name to universalize it
    return {
      address: acct._id as AddressBytes,
      nonce: asLong(acct.sequence) as Nonce,
      publicKey: decodePubKey(ensure(acct.pubKey)),
    };
  }

  protected normalizeAccount(initData: InitData): (a: codec.namecoin.IWallet & Keyed) => BcpAccount {
    return (acct: codec.namecoin.IWallet & Keyed): BcpAccount => {
      // append the chainID to the name to universalize it
      const name = acct.name ? `${acct.name}*${initData.chainId}` : undefined;
      return {
        name,
        address: acct._id as AddressBytes,
        balance: ensure(acct.coins).map(this.normalizeCoin(initData)),
      };
    };
  }

  protected normalizeCoin(initData: InitData): (c: codec.x.ICoin) => BcpCoin {
    return (coin: codec.x.ICoin): BcpCoin => {
      const token = decodeToken(coin);
      const tickerInfo = initData.tickers.get(token.tokenTicker);
      return {
        ...token,
        // Better defaults?
        tokenName: tickerInfo ? tickerInfo.tokenName : "<Unknown token>",
        sigFigs: tickerInfo ? tickerInfo.sigFigs : 9,
      };
    };
  }

  protected normalizeToken(data: codec.namecoin.IToken & Keyed): BcpTicker {
    return {
      tokenTicker: Encoding.fromAscii(data._id) as TokenTicker,
      tokenName: ensure(data.name),
      sigFigs: ensure(data.sigFigs),
    };
  }
}

/* Various helpers for parsing the results of querying abci */

export interface QueryResponse {
  readonly height?: number;
  readonly results: ReadonlyArray<Result>;
}

export interface Result {
  readonly key: Uint8Array;
  readonly value: Uint8Array;
}

interface Keyed {
  readonly _id: Uint8Array;
}

interface Decoder<T extends {}> {
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

// dummyEnvelope just adds some plausible metadata to make bcp happy
function dummyEnvelope<T extends BcpData>(data: ReadonlyArray<T>): BcpQueryEnvelope<T> {
  return {
    metadata: {
      offset: 0,
      limit: 100,
    },
    data: data,
  };
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
