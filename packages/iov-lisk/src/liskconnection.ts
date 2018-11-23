import axios from "axios";
import { ReadonlyDate } from "readonly-date";
import { Stream } from "xstream";

import { Algorithm, ChainId, PostableBytes, PublicKeyBytes, TxId } from "@iov/base-types";
import {
  Address,
  BcpAccount,
  BcpAccountQuery,
  BcpConnection,
  BcpNonce,
  BcpQueryEnvelope,
  BcpQueryTag,
  BcpTicker,
  BcpTransactionResponse,
  BcpTxQuery,
  ConfirmedTransaction,
  dummyEnvelope,
  isAddressQuery,
  isPubkeyQuery,
  Nonce,
  TokenTicker,
} from "@iov/bcp-types";
import { Parse } from "@iov/dpos";
import { Encoding, Int53 } from "@iov/encoding";

import { constants } from "./constants";
import { liskCodec } from "./liskcodec";

const { fromAscii, toUtf8 } = Encoding;

/**
 * Encodes the current date and time as a nonce
 */
export function generateNonce(): Nonce {
  const now = new ReadonlyDate(ReadonlyDate.now());
  return Parse.timeToNonce(now);
}

function checkAndNormalizeUrl(url: string): string {
  if (!url.match(/^https?:\/\/[-\.a-zA-Z0-9]+(:[0-9]+)?\/?$/)) {
    throw new Error(
      "Invalid API URL. Expected a base URL like https://testnet.lisk.io or http://123.123.132.132:8000/",
    );
  }
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

async function loadChainId(baseUrl: string): Promise<ChainId> {
  const url = checkAndNormalizeUrl(baseUrl) + "/api/node/constants";
  const result = await axios.get(url);
  const responseBody = result.data;
  return responseBody.data.nethash;
}

export class LiskConnection implements BcpConnection {
  public static async establish(baseUrl: string): Promise<LiskConnection> {
    const chainId = await loadChainId(baseUrl);
    return new LiskConnection(baseUrl, chainId);
  }

  private readonly baseUrl: string;
  private readonly myChainId: ChainId;

  constructor(baseUrl: string, chainId: ChainId) {
    this.baseUrl = checkAndNormalizeUrl(baseUrl);

    if (!chainId.match(/^[a-f0-9]{64}$/)) {
      throw new Error("The chain ID must be a Lisk nethash, encoded as 64 lower-case hex characters.");
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
    const url = this.baseUrl + "/api/node/status";
    const result = await axios.get(url);
    const responseBody = result.data;
    return responseBody.data.height;
  }

  public async postTx(bytes: PostableBytes): Promise<BcpTransactionResponse> {
    const transactionId = JSON.parse(Encoding.fromUtf8(bytes)).id as string;
    if (!transactionId.match(/^[0-9]+$/)) {
      throw new Error("Invalid transaction ID");
    }

    const response = await axios.post(this.baseUrl + "/api/transactions", bytes, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (typeof response.data.meta.status !== "boolean" || response.data.meta.status !== true) {
      throw new Error("Did not get meta.status: true");
    }

    return {
      metadata: {
        height: undefined,
      },
      data: {
        message: "",
        txid: Encoding.toAscii(transactionId) as TxId,
        result: new Uint8Array([]),
      },
    };
  }

  public async getTicker(searchTicker: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>> {
    const results = (await this.getAllTickers()).data.filter(t => t.tokenTicker === searchTicker);
    return dummyEnvelope(results);
  }

  public async getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>> {
    const tickers: ReadonlyArray<BcpTicker> = [
      {
        tokenTicker: constants.primaryTokenTicker,
        tokenName: constants.primaryTokenName,
        sigFigs: constants.primaryTokenSigFigs,
      },
    ];
    return dummyEnvelope(tickers);
  }

  public async getAccount(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>> {
    let address: Address;
    if (isAddressQuery(query)) {
      address = query.address;
    } else if (isPubkeyQuery(query)) {
      address = liskCodec.keyToAddress(query.pubkey);
    } else {
      throw new Error("Query type not supported");
    }
    const url = this.baseUrl + `/api/accounts?address=${address}`;
    const result = await axios.get(url);
    const responseBody = result.data;

    // here we are expecting 0 or 1 results
    const accounts: ReadonlyArray<BcpAccount> = responseBody.data.map(
      (item: any): BcpAccount => ({
        address: address,
        name: undefined,
        balance: [
          {
            sigFigs: constants.primaryTokenSigFigs,
            tokenName: constants.primaryTokenName,
            tokenTicker: constants.primaryTokenTicker,
            ...Parse.parseQuantity(item.balance),
          },
        ],
      }),
    );
    return dummyEnvelope(accounts);
  }

  public getNonce(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpNonce>> {
    if (isAddressQuery(query)) {
      const address = query.address;

      const nonce: BcpNonce = {
        address: address,
        // fake pubkey, we cannot always know this
        pubkey: {
          algo: Algorithm.Ed25519,
          data: new Uint8Array([]) as PublicKeyBytes,
        },
        nonce: generateNonce(),
      };

      const out: BcpQueryEnvelope<BcpNonce> = {
        metadata: {
          offset: 0,
          limit: 0,
        },
        data: [nonce],
      };
      return Promise.resolve(out);
    } else {
      throw new Error("Query type not supported");
    }
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

  public async searchTx(query: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>> {
    if (query.height || query.minHeight || query.maxHeight || query.tags.length) {
      throw new Error("Query by height, minHeight, maxHeight, tags not supported");
    }

    if (query.hash) {
      const transactionId = fromAscii(query.hash);

      const url = this.baseUrl + `/api/transactions?id=${transactionId}`;
      const result = await axios.get(url);
      const responseBody = result.data;
      if (responseBody.data.length === 0) {
        return [];
      }

      const transactionJson = responseBody.data[0];
      const height = new Int53(transactionJson.height);
      const confirmations = new Int53(transactionJson.confirmations);

      const transaction = liskCodec.parseBytes(
        toUtf8(JSON.stringify(transactionJson)) as PostableBytes,
        this.myChainId,
      );
      return [
        {
          ...transaction,
          height: height.toNumber(),
          txid: query.hash,
          result: new Uint8Array([]),
          log: `Found transaction with ${confirmations} confirmations`,
        },
      ];
    } else {
      throw new Error("Unsupported query.");
    }
  }

  public listenTx(_: ReadonlyArray<BcpQueryTag>): Stream<ConfirmedTransaction> {
    throw new Error("Not implemented");
  }

  public liveTx(_: BcpTxQuery): Stream<ConfirmedTransaction> {
    throw new Error("Not implemented");
  }
}
