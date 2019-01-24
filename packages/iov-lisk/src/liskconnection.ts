import axios from "axios";
import equal from "fast-deep-equal";
import { ReadonlyDate } from "readonly-date";
import { Producer, Stream } from "xstream";

import {
  Algorithm,
  BcpAccount,
  BcpAccountQuery,
  BcpAddressQuery,
  BcpConnection,
  BcpPubkeyQuery,
  BcpTicker,
  BcpTxQuery,
  BlockHeader,
  BlockId,
  BlockInfo,
  ChainId,
  ConfirmedTransaction,
  FailedTransaction,
  isPubkeyQuery,
  Nonce,
  PostableBytes,
  PostTxResponse,
  PublicKeyBundle,
  PublicKeyBytes,
  TokenTicker,
  TransactionId,
  TransactionState,
} from "@iov/bcp-types";
import { Parse } from "@iov/dpos";
import { Encoding, Int53, Uint53, Uint64 } from "@iov/encoding";
import { concat, DefaultValueProducer, ValueAndUpdates } from "@iov/stream";

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
    let lastEventSent: BlockInfo | undefined;
    const blockInfoProducer = new DefaultValueProducer<BlockInfo>(
      {
        state: TransactionState.Pending,
      },
      {
        onStarted: () => {
          blockInfoInterval = setInterval(async () => {
            const search = await this.searchTx({ id: transactionId });
            if (search.length > 0) {
              const confirmedTransaction = search[0];
              const event: BlockInfo = {
                state: TransactionState.Succeeded,
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

  public async getTicker(searchTicker: TokenTicker): Promise<BcpTicker | undefined> {
    const results = (await this.getAllTickers()).find(t => t.tokenTicker === searchTicker);
    return results;
  }

  public async getAllTickers(): Promise<ReadonlyArray<BcpTicker>> {
    return [
      {
        tokenTicker: constants.primaryTokenTicker,
        tokenName: constants.primaryTokenName,
        fractionalDigits: constants.primaryTokenFractionalDigits,
      },
    ];
  }

  public async getAccount(query: BcpAccountQuery): Promise<BcpAccount | undefined> {
    const address = isPubkeyQuery(query) ? pubkeyToAddress(query.pubkey.data) : query.address;

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
    return accounts.length > 0 ? accounts[0] : undefined;
  }

  public async getNonce(_: BcpAddressQuery | BcpPubkeyQuery): Promise<Nonce> {
    return generateNonce();
  }

  public async getNonces(_: BcpAddressQuery | BcpPubkeyQuery, count: number): Promise<ReadonlyArray<Nonce>> {
    const checkedCount = new Uint53(count).toNumber();
    // use unique nonces to ensure the same transaction content leads to a different transaction ID
    // [now-3, now-2, now-1, now] for 4 nonces
    const lastNonce = generateNonce().toNumber();
    return Array.from({ length: checkedCount }).map((_1, index) => {
      return new Int53(lastNonce - (checkedCount - 1 - index)) as Nonce;
    });
  }

  public watchAccount(query: BcpAccountQuery): Stream<BcpAccount | undefined> {
    let lastEvent: any = {}; // default to a dummy value to ensure an initial undefined event is sent
    let pollInternal: NodeJS.Timeout | undefined;
    const producer: Producer<BcpAccount | undefined> = {
      start: listener => {
        const poll = async () => {
          try {
            const event = await this.getAccount(query);
            if (!equal(event, lastEvent)) {
              listener.next(event);
              lastEvent = event;
            }
          } catch (error) {
            listener.error(error);
          }
        };

        pollInternal = setInterval(poll, 5_000);
        poll();
      },
      stop: () => {
        if (pollInternal) {
          clearInterval(pollInternal);
          pollInternal = undefined;
        }
      },
    };

    return Stream.create(producer);
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
    if (query.height || query.tags) {
      throw new Error("Query by height or tags not supported");
    }

    if (query.id !== undefined) {
      return this.searchTransactions({ id: query.id }, query.minHeight, query.maxHeight);
    } else if (query.sentFromOrTo) {
      return this.searchTransactions(
        { senderIdOrRecipientId: query.sentFromOrTo },
        query.minHeight,
        query.maxHeight,
      );
    } else {
      throw new Error("Unsupported query.");
    }
  }

  public listenTx(_: BcpTxQuery): Stream<ConfirmedTransaction | FailedTransaction> {
    throw new Error("Not implemented");
  }

  public liveTx(query: BcpTxQuery): Stream<ConfirmedTransaction | FailedTransaction> {
    if (query.height || query.tags) {
      throw new Error("Query by height or tags not supported");
    }

    if (query.id !== undefined) {
      if (query.minHeight || query.maxHeight) {
        throw new Error("Query by minHeight/maxHeight not supported together with ID");
      }

      // concat never() because we want non-completing streams consistently
      return concat(this.waitForTransaction(query.id), Stream.never());
    } else if (query.sentFromOrTo) {
      let pollInterval: NodeJS.Timeout | undefined;
      const producer: Producer<ConfirmedTransaction | FailedTransaction> = {
        start: listener => {
          let minHeight = query.minHeight || 0;
          const maxHeight = query.maxHeight || Number.MAX_SAFE_INTEGER;

          const poll = async (): Promise<void> => {
            const result = await this.searchTx({
              sentFromOrTo: query.sentFromOrTo,
              minHeight: minHeight,
              maxHeight: maxHeight,
            });
            for (const item of result) {
              listener.next(item);
              if (item.height >= minHeight) {
                // we assume we got all matching transactions from block `item.height` now
                minHeight = item.height + 1;
              }
            }
          };

          poll();
          pollInterval = setInterval(poll, 4_000);
        },
        stop: () => {
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = undefined;
          }
        },
      };
      return Stream.create(producer);
    } else {
      throw new Error("Unsupported query.");
    }
  }

  private waitForTransaction(id: TransactionId): Stream<ConfirmedTransaction | FailedTransaction> {
    let poller: NodeJS.Timeout | undefined;
    const producer: Producer<ConfirmedTransaction | FailedTransaction> = {
      start: listener => {
        setInterval(async () => {
          try {
            const results = await this.searchTransactions({ id: id }, undefined, undefined);
            switch (results.length) {
              case 0:
                // okay, we'll try again
                break;
              case 1:
                listener.next(results[0]);
                listener.complete();
                break;
              default:
                throw new Error(`Got unexpected number of search results: ${results.length}`);
            }
          } catch (error) {
            if (poller) {
              clearTimeout(poller);
              poller = undefined;
            }
            listener.error(error);
          }
        }, 5_000);
      },
      stop: () => {
        if (poller) {
          clearTimeout(poller);
          poller = undefined;
        }
      },
    };
    return Stream.create(producer);
  }

  private async searchTransactions(
    searchParams: any,
    minHeight: number | undefined,
    maxHeight: number | undefined,
  ): Promise<ReadonlyArray<ConfirmedTransaction>> {
    if (minHeight !== undefined && maxHeight !== undefined && minHeight > maxHeight) {
      return [];
    }

    const result = await axios.get(`${this.baseUrl}/api/transactions`, {
      params: searchParams,
    });
    const responseBody = result.data;
    return responseBody.data
      .filter((transactionJson: any) => {
        if (transactionJson.type !== 0) {
          // other transaction types cannot be parsed
          return false;
        }

        if (minHeight !== undefined && transactionJson.height < minHeight) {
          return false;
        }

        if (maxHeight !== undefined && transactionJson.height > maxHeight) {
          return false;
        }

        return true;
      })
      .map((transactionJson: any) => {
        const height = new Uint53(transactionJson.height);
        const confirmations = new Uint53(transactionJson.confirmations);
        const transactionId = Uint64.fromString(transactionJson.id).toString() as TransactionId;
        const transaction = liskCodec.parseBytes(
          toUtf8(JSON.stringify(transactionJson)) as PostableBytes,
          this.myChainId,
        );
        return {
          ...transaction,
          height: height.toNumber(),
          confirmations: confirmations.toNumber(),
          transactionId: transactionId,
        };
      });
  }
}
