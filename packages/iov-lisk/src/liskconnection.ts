import axios from "axios";
import equal from "fast-deep-equal";
import { ReadonlyDate } from "readonly-date";
import { Stream } from "xstream";

import {
  Address,
  Algorithm,
  BcpAccount,
  BcpAccountQuery,
  BcpAddressQuery,
  BcpBlockInfo,
  BcpConnection,
  BcpPubkeyQuery,
  BcpQueryEnvelope,
  BcpTicker,
  BcpTransactionState,
  BcpTxQuery,
  BlockHeader,
  BlockId,
  ChainId,
  ConfirmedTransaction,
  dummyEnvelope,
  isAddressQuery,
  isPubkeyQuery,
  Nonce,
  PostableBytes,
  PostTxResponse,
  PublicKeyBundle,
  PublicKeyBytes,
  TokenTicker,
  TransactionId,
} from "@iov/bcp-types";
import { Parse } from "@iov/dpos";
import { Encoding, Int53, Uint53, Uint64 } from "@iov/encoding";
import { DefaultValueProducer, ValueAndUpdates } from "@iov/stream";

import { constants } from "./constants";
import { pubkeyToAddress } from "./derivation";
import { liskCodec } from "./liskcodec";

const { toUtf8 } = Encoding;

// poll every 3 seconds (block time 10s)
const transactionStatePollInterval = 3_000;

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

  public async postTx(bytes: PostableBytes): Promise<PostTxResponse> {
    const transactionId = JSON.parse(Encoding.fromUtf8(bytes)).id as TransactionId;
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

    let blockInfoInterval: any;
    let lastEventSent: BcpBlockInfo | undefined;
    const blockInfoProducer = new DefaultValueProducer<BcpBlockInfo>(
      {
        state: BcpTransactionState.Pending,
      },
      {
        onStarted: () => {
          blockInfoInterval = setInterval(async () => {
            const search = await this.searchTx({ id: transactionId });
            if (search.length > 0) {
              const confirmedTransaction = search[0];
              const event: BcpBlockInfo = {
                state: BcpTransactionState.InBlock,
                height: confirmedTransaction.height,
                confirmations: confirmedTransaction.confirmations,
              };

              if (!equal(event, lastEventSent)) {
                blockInfoProducer.update(event);
                lastEventSent = event;
              }
            }
          }, transactionStatePollInterval);
        },
        onStop: () => clearInterval(blockInfoInterval),
      },
    );

    return {
      blockInfo: new ValueAndUpdates(blockInfoProducer),
      transactionId: transactionId,
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
      },
    ];
    return dummyEnvelope(tickers);
  }

  public async getAccount(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>> {
    let address: Address;
    if (isAddressQuery(query)) {
      address = query.address;
    } else if (isPubkeyQuery(query)) {
      address = pubkeyToAddress(query.pubkey.data);
    } else {
      throw new Error("Query type not supported");
    }
    const url = this.baseUrl + `/api/accounts?address=${address}`;
    const result = await axios.get(url);
    const responseBody = result.data;

    // here we are expecting 0 or 1 results
    const accounts: ReadonlyArray<BcpAccount> = responseBody.data.map(
      (responseItem: any): BcpAccount => {
        const itemBalance: unknown = responseItem.balance;
        const itemPubkey: unknown = responseItem.publicKey;

        if (typeof itemBalance !== "string") {
          throw new Error("Unexpected type for .balance property in response");
        }

        const pubkey: PublicKeyBundle | undefined =
          typeof itemPubkey === "string" && itemPubkey
            ? {
                algo: Algorithm.Ed25519,
                data: Encoding.fromHex(itemPubkey) as PublicKeyBytes,
              }
            : undefined;

        return {
          address: address,
          pubkey: pubkey,
          name: undefined,
          balance: [
            {
              quantity: Parse.parseQuantity(itemBalance),
              fractionalDigits: constants.primaryTokenFractionalDigits,
              tokenName: constants.primaryTokenName,
              tokenTicker: constants.primaryTokenTicker,
            },
          ],
        };
      },
    );
    return dummyEnvelope(accounts);
  }

  public getNonce(_: BcpAddressQuery | BcpPubkeyQuery): Promise<Nonce> {
    return Promise.resolve(generateNonce());
  }

  public watchAccount(_: BcpAccountQuery): Stream<BcpAccount | undefined> {
    throw new Error("Not implemented");
  }

  public watchNonce(_: BcpAddressQuery | BcpPubkeyQuery): Stream<Nonce> {
    throw new Error("Not implemented");
  }

  public async getBlockHeader(height: number): Promise<BlockHeader> {
    let integerHeight: Uint53;
    try {
      integerHeight = new Uint53(height);
    } catch {
      throw new Error("Height must be a non-negative safe integer");
    }

    const url = this.baseUrl + `/api/blocks?height=${integerHeight.toNumber()}`;
    const result = await axios.get(url);
    const responseBody = result.data;

    if (!responseBody.data || typeof responseBody.data.length !== "number") {
      throw new Error("Expected a list of blocks but got something different.");
    }

    if (responseBody.data.length === 0) {
      throw new Error("Block does not exist");
    }

    if (responseBody.data.length !== 1) {
      throw new Error("Got unexpected number of block");
    }

    const blockJson = responseBody.data[0];
    const blockId = Uint64.fromString(blockJson.id).toString() as BlockId;
    const blockHeight = new Uint53(blockJson.height).toNumber();
    const blockTime = Parse.fromTimestamp(blockJson.timestamp);
    const transactionCount = new Uint53(blockJson.numberOfTransactions).toNumber();

    return {
      id: blockId,
      height: blockHeight,
      time: blockTime,
      transactionCount: transactionCount,
    };
  }

  public watchBlockHeaders(): Stream<BlockHeader> {
    throw new Error("Not implemented");
  }

  /** @deprecated use watchBlockHeaders().map(header => header.height) */
  public changeBlock(): Stream<number> {
    return this.watchBlockHeaders().map(header => header.height);
  }

  public async searchTx(query: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>> {
    if (query.height || query.minHeight || query.maxHeight || query.tags) {
      throw new Error("Query by height, minHeight, maxHeight, tags not supported");
    }

    if (query.id !== undefined) {
      const url = this.baseUrl + `/api/transactions?id=${query.id}`;
      const result = await axios.get(url);
      const responseBody = result.data;
      if (responseBody.data.length === 0) {
        return [];
      }

      const transactionJson = responseBody.data[0];
      const height = new Int53(transactionJson.height);
      const confirmations = new Int53(transactionJson.confirmations);
      const transactionId = Uint64.fromString(transactionJson.id).toString() as TransactionId;

      const transaction = liskCodec.parseBytes(
        toUtf8(JSON.stringify(transactionJson)) as PostableBytes,
        this.myChainId,
      );
      return [
        {
          ...transaction,
          height: height.toNumber(),
          confirmations: confirmations.toNumber(),
          transactionId: transactionId,
        },
      ];
    } else {
      throw new Error("Unsupported query.");
    }
  }

  public listenTx(_: BcpTxQuery): Stream<ConfirmedTransaction> {
    throw new Error("Not implemented");
  }

  public liveTx(_: BcpTxQuery): Stream<ConfirmedTransaction> {
    throw new Error("Not implemented");
  }
}
