import {
  Account,
  AccountQuery,
  AddressQuery,
  Algorithm,
  BlockchainConnection,
  BlockHeader,
  BlockId,
  BlockInfo,
  ChainId,
  ConfirmedAndSignedTransaction,
  ConfirmedTransaction,
  FailedTransaction,
  Fee,
  isPubkeyQuery,
  Nonce,
  PostableBytes,
  PostTxResponse,
  PubkeyBundle,
  PubkeyBytes,
  PubkeyQuery,
  Token,
  TokenTicker,
  TransactionId,
  TransactionQuery,
  TransactionState,
  UnsignedTransaction,
} from "@iov/bcp";
import { Encoding, Uint53, Uint64 } from "@iov/encoding";
import { concat, DefaultValueProducer, ValueAndUpdates } from "@iov/stream";
import axios from "axios";
import equal from "fast-deep-equal";
import { ReadonlyDate } from "readonly-date";
import { Producer, Stream } from "xstream";

import { constants } from "./constants";
import { Derivation } from "./derivation";
import { liskCodec } from "./liskcodec";
import { Parse } from "./parse";

const { toUtf8 } = Encoding;

// poll every 3 seconds (block time 10s)
const defaultPollInterval = 3_000;

/**
 * Encodes the current date and time as a nonce
 */
export function generateNonce(): Nonce {
  const now = new ReadonlyDate(ReadonlyDate.now());
  return Parse.timeToNonce(now);
}

function checkAndNormalizeUrl(url: string): string {
  if (!url.match(/^https?:\/\/[-.a-zA-Z0-9]+(:[0-9]+)?\/?$/)) {
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
  return `lisk-${responseBody.data.nethash.slice(0, 10)}` as ChainId;
}

export class LiskConnection implements BlockchainConnection {
  public static async establish(baseUrl: string): Promise<LiskConnection> {
    const chainId = await loadChainId(baseUrl);
    return new LiskConnection(baseUrl, chainId);
  }

  public readonly chainId: ChainId;
  private readonly baseUrl: string;

  public constructor(baseUrl: string, chainId: ChainId) {
    this.baseUrl = checkAndNormalizeUrl(baseUrl);

    if (!chainId.match(/^lisk-[a-f0-9]{10}$/)) {
      throw new Error(
        "The chain ID must be a Lisk nethash, encoded as `lisk-%s` where `%s` is the 10-digit hex-encoded prefix of the relevant nethash.",
      );
    }
    this.chainId = chainId;
  }

  public disconnect(): void {
    // no-op
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

    let blockInfoInterval: NodeJS.Timeout;
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
          }, defaultPollInterval);
        },
        onStop: () => clearInterval(blockInfoInterval),
      },
    );

    return {
      blockInfo: new ValueAndUpdates(blockInfoProducer),
      transactionId: transactionId,
    };
  }

  public async getToken(searchTicker: TokenTicker): Promise<Token | undefined> {
    const results = (await this.getAllTokens()).find(t => t.tokenTicker === searchTicker);
    return results;
  }

  public async getAllTokens(): Promise<readonly Token[]> {
    return [
      {
        tokenTicker: constants.primaryTokenTicker,
        tokenName: constants.primaryTokenName,
        fractionalDigits: constants.primaryTokenFractionalDigits,
      },
    ];
  }

  public async getAccount(query: AccountQuery): Promise<Account | undefined> {
    const address = isPubkeyQuery(query) ? Derivation.pubkeyToAddress(query.pubkey) : query.address;

    const url = this.baseUrl + `/api/accounts?address=${address}`;
    const result = await axios.get(url);
    const responseBody = result.data;

    // here we are expecting 0 or 1 results
    const accounts: readonly Account[] = responseBody.data.map(
      (responseItem: any): Account => {
        const itemBalance: unknown = responseItem.balance;
        const itemPubkey: unknown = responseItem.publicKey;

        if (typeof itemBalance !== "string") {
          throw new Error("Unexpected type for .balance property in response");
        }

        const pubkey: PubkeyBundle | undefined =
          typeof itemPubkey === "string" && itemPubkey
            ? {
                algo: Algorithm.Ed25519,
                data: Encoding.fromHex(itemPubkey) as PubkeyBytes,
              }
            : undefined;

        return {
          address: address,
          pubkey: pubkey,
          balance: [
            {
              quantity: Parse.parseQuantity(itemBalance),
              fractionalDigits: constants.primaryTokenFractionalDigits,
              tokenTicker: constants.primaryTokenTicker,
            },
          ],
        };
      },
    );
    return accounts.length > 0 ? accounts[0] : undefined;
  }

  public async getNonce(_: AddressQuery | PubkeyQuery): Promise<Nonce> {
    return generateNonce();
  }

  public async getNonces(_: AddressQuery | PubkeyQuery, count: number): Promise<readonly Nonce[]> {
    const checkedCount = new Uint53(count).toNumber();
    // use unique nonces to ensure the same transaction content leads to a different transaction ID
    // [now-3, now-2, now-1, now] for 4 nonces
    const lastNonce = generateNonce();
    return Array.from({ length: checkedCount }).map((_1, index) => {
      return (lastNonce - (checkedCount - 1 - index)) as Nonce;
    });
  }

  public watchAccount(query: AccountQuery): Stream<Account | undefined> {
    // default to a dummy value to ensure an initial undefined event is sent
    let lastEvent: Account | {} | undefined = {};
    let pollInternal: NodeJS.Timeout | undefined;
    const producer: Producer<Account | undefined> = {
      start: async listener => {
        const poll = async (): Promise<void> => {
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

        pollInternal = setInterval(poll, defaultPollInterval);
        await poll();
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
    let lastEvent: BlockHeader | undefined; // Ensures the stream does not contain duplicates
    let pollInternal: NodeJS.Timeout | undefined;
    const producer: Producer<BlockHeader> = {
      start: async listener => {
        let watchHeight: number = await this.height();
        const poll = async (): Promise<void> => {
          try {
            const event = await this.getBlockHeader(watchHeight);
            if (!equal(event, lastEvent)) {
              listener.next(event);
              ++watchHeight;
              lastEvent = event;
            }
          } catch (error) {
            if (!/^Block does not exist$/.test(error.message)) {
              listener.error(error);
            }
          }
        };

        pollInternal = setInterval(poll, defaultPollInterval);
        await poll();
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

  public async getTx(id: TransactionId): Promise<ConfirmedAndSignedTransaction<UnsignedTransaction>> {
    const searchResults = await this.searchTransactions({ id: id }, undefined, undefined);
    if (searchResults.length === 0) {
      throw new Error("Transaction does not exist");
    }
    if (searchResults.length > 1) {
      throw new Error("More than one transaction exists with this ID");
    }
    return searchResults[0];
  }

  public async searchTx(
    query: TransactionQuery,
  ): Promise<readonly ConfirmedTransaction<UnsignedTransaction>[]> {
    if (query.height || query.tags || query.signedBy) {
      throw new Error("Query by height, tags or signedBy not supported");
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

  public listenTx(
    _: TransactionQuery,
  ): Stream<ConfirmedTransaction<UnsignedTransaction> | FailedTransaction> {
    throw new Error("Not implemented");
  }

  public liveTx(
    query: TransactionQuery,
  ): Stream<ConfirmedTransaction<UnsignedTransaction> | FailedTransaction> {
    if (query.height || query.tags || query.signedBy) {
      throw new Error("Query by height, tags or signedBy not supported");
    }

    if (query.id !== undefined) {
      if (query.minHeight || query.maxHeight) {
        throw new Error("Query by minHeight/maxHeight not supported together with ID");
      }

      // concat never() because we want non-completing streams consistently
      return concat(this.waitForTransaction(query.id), Stream.never());
    } else if (query.sentFromOrTo) {
      let pollInternal: NodeJS.Timeout | undefined;
      const producer: Producer<ConfirmedTransaction<UnsignedTransaction> | FailedTransaction> = {
        start: async listener => {
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

          await poll();
          pollInternal = setInterval(poll, defaultPollInterval);
        },
        stop: () => {
          if (pollInternal) {
            clearInterval(pollInternal);
            pollInternal = undefined;
          }
        },
      };
      return Stream.create(producer);
    } else {
      throw new Error("Unsupported query.");
    }
  }

  public async getFeeQuote(tx: UnsignedTransaction): Promise<Fee> {
    switch (tx.kind) {
      case "bcp/send":
        return {
          tokens: {
            quantity: "10000000",
            fractionalDigits: constants.primaryTokenFractionalDigits,
            tokenTicker: constants.primaryTokenTicker,
          },
        };
      default:
        throw new Error("Received transaction of unsupported kind.");
    }
  }

  public async withDefaultFee<T extends UnsignedTransaction>(transaction: T): Promise<T> {
    return { ...transaction, fee: await this.getFeeQuote(transaction) };
  }

  private waitForTransaction(
    id: TransactionId,
  ): Stream<ConfirmedTransaction<UnsignedTransaction> | FailedTransaction> {
    let pollInternal: NodeJS.Timeout | undefined;
    const producer: Producer<ConfirmedTransaction<UnsignedTransaction> | FailedTransaction> = {
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
            if (pollInternal) {
              clearTimeout(pollInternal);
              pollInternal = undefined;
            }
            listener.error(error);
          }
        }, defaultPollInterval);
      },
      stop: () => {
        if (pollInternal) {
          clearTimeout(pollInternal);
          pollInternal = undefined;
        }
      },
    };
    return Stream.create(producer);
  }

  private async searchTransactions(
    searchParams: any,
    minHeight: number | undefined,
    maxHeight: number | undefined,
  ): Promise<readonly ConfirmedAndSignedTransaction<UnsignedTransaction>[]> {
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
          this.chainId,
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
