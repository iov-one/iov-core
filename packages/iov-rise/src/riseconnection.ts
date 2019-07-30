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
  LightTransaction,
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
import { Parse } from "@iov/dpos";
import { Encoding, Uint53, Uint64 } from "@iov/encoding";
import { concat, DefaultValueProducer, ValueAndUpdates } from "@iov/stream";
import axios from "axios";
import equal from "fast-deep-equal";
import { ReadonlyDate } from "readonly-date";
import { Producer, Stream } from "xstream";

import { constants } from "./constants";
import { pubkeyToAddress } from "./derivation";
import { riseCodec } from "./risecodec";

const { toUtf8 } = Encoding;

// poll every 10 seconds (block time 30s)
const transactionStatePollInterval = 10_000;

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
      "Invalid API URL. Expected a base URL like https://twallet.rise.vision or http://123.123.132.132:5555/",
    );
  }
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

async function loadChainId(baseUrl: string): Promise<ChainId> {
  const url = checkAndNormalizeUrl(baseUrl) + "/api/blocks/getNethash";
  const result = await axios.get(url);
  const responseBody = result.data;
  return `rise-${responseBody.nethash.slice(0, 10)}` as ChainId;
}

export class RiseConnection implements BlockchainConnection {
  public static async establish(baseUrl: string): Promise<RiseConnection> {
    const chainId = await loadChainId(baseUrl);
    return new RiseConnection(baseUrl, chainId);
  }

  private readonly baseUrl: string;
  private readonly myChainId: ChainId;

  public constructor(baseUrl: string, chainId: ChainId) {
    this.baseUrl = checkAndNormalizeUrl(baseUrl);

    if (!chainId.match(/^rise-[a-f0-9]{10}$/)) {
      throw new Error(
        "The chain ID must be a Rise nethash, encoded as `rise-%s` where `%s` is the 10-digit hex-encoded prefix of the relevant nethash.",
      );
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
    const url = this.baseUrl + "/api/blocks/getHeight";
    const result = await axios.get(url);
    const responseBody = result.data;
    return responseBody.height;
  }

  public async postTx(bytes: PostableBytes): Promise<PostTxResponse> {
    const transactionId = JSON.parse(Encoding.fromUtf8(bytes)).id as TransactionId;
    if (!transactionId.match(/^[0-9]+$/)) {
      throw new Error("Invalid transaction ID");
    }

    const putBody = {
      transaction: JSON.parse(Encoding.fromUtf8(bytes)),
    };
    const response = await axios.put(this.baseUrl + "/api/transactions", putBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    if (response.data.invalid.length !== 0) {
      throw new Error(
        `Error posting transactions to node. Invalid transactions: ${JSON.stringify(response.data.invalid)}`,
      );
    }

    if (response.data.accepted.length !== 1) {
      throw new Error(`Expected one accepted transaction but got: ${JSON.stringify(response.data.accepted)}`);
    }

    let blockInfoInterval: NodeJS.Timeout;
    const firstEvent: BlockInfo = {
      state: TransactionState.Pending,
    };
    let lastEventSent: BlockInfo = firstEvent;
    const blockInfoProducer = new DefaultValueProducer<BlockInfo>(firstEvent, {
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
    });

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
    const address = isPubkeyQuery(query) ? pubkeyToAddress(query.pubkey.data) : query.address;

    const url = this.baseUrl + `/api/accounts?address=${address}`;
    const result = await axios.get(url);
    if (result.data.error) {
      return undefined;
    }
    const responseBalance: unknown = result.data.account.balance;
    const responsePublicKey: unknown = result.data.account.publicKey;

    if (typeof responseBalance !== "string") {
      throw new Error("Unexpected type for .balance property in response");
    }

    const pubkey: PubkeyBundle | undefined =
      typeof responsePublicKey === "string" && responsePublicKey
        ? {
            algo: Algorithm.Ed25519,
            data: Encoding.fromHex(responsePublicKey) as PubkeyBytes,
          }
        : undefined;

    return {
      address: address,
      pubkey: pubkey,
      balance: [
        {
          quantity: Parse.parseQuantity(responseBalance),
          fractionalDigits: constants.primaryTokenFractionalDigits,
          tokenTicker: constants.primaryTokenTicker,
        },
      ],
    };
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

        pollInternal = setInterval(poll, 5_000);
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

    const url = this.baseUrl + `/api/blocks?limit=1&height=${integerHeight.toNumber()}`;
    const result = await axios.get(url);
    const responseBody = result.data;

    if (!responseBody.success) {
      throw new Error(responseBody.error);
    }

    if (!responseBody.blocks || typeof responseBody.blocks.length !== "number") {
      throw new Error("Expected a list of blocks but got something different.");
    }

    if (responseBody.blocks.length === 0) {
      throw new Error("Block does not exist");
    }

    if (responseBody.blocks.length !== 1) {
      throw new Error("Got unexpected number of block");
    }

    const blockJson = responseBody.blocks[0];
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

  public async getTx(id: TransactionId): Promise<ConfirmedAndSignedTransaction<UnsignedTransaction>> {
    const searchResult = await this.searchSingleTransaction(id);
    if (searchResult === undefined) {
      throw new Error("Transaction does not exist");
    }
    return searchResult;
  }

  public async searchTx(
    query: TransactionQuery,
  ): Promise<readonly ConfirmedTransaction<UnsignedTransaction>[]> {
    if (query.height || query.tags || query.signedBy) {
      throw new Error("Query by height, tags or signedBy not supported");
    }

    if (query.id !== undefined) {
      if (query.minHeight || query.maxHeight) {
        throw new Error("Query by minHeight/maxHeight not supported together with ID");
      }
      const result = await this.searchSingleTransaction(query.id);
      return result ? [result] : [];
    } else if (query.sentFromOrTo) {
      return this.searchTransactions(
        {
          recipientId: query.sentFromOrTo,
          senderId: query.sentFromOrTo,
          limit: 1000,
        },
        query.minHeight,
        query.maxHeight,
      );
    } else {
      throw new Error("Unsupported query.");
    }
  }

  public listenTx(_: TransactionQuery): Stream<ConfirmedTransaction<LightTransaction> | FailedTransaction> {
    throw new Error("Not implemented");
  }

  public liveTx(query: TransactionQuery): Stream<ConfirmedTransaction<LightTransaction> | FailedTransaction> {
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
      let pollInterval: NodeJS.Timeout | undefined;
      const producer: Producer<ConfirmedTransaction<LightTransaction> | FailedTransaction> = {
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
          pollInterval = setInterval(poll, 8_000);
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

  private async searchSingleTransaction(
    searchId: TransactionId,
  ): Promise<ConfirmedAndSignedTransaction<UnsignedTransaction> | undefined> {
    const result = await axios.get(`${this.baseUrl}/api/transactions/get`, {
      params: { id: searchId },
    });
    const responseBody = result.data;

    if (responseBody.success !== true) {
      switch (responseBody.error) {
        case "Transaction not found":
          return undefined;
        default:
          throw new Error(`RISE API error: ${responseBody.error}`);
      }
    }

    const transactionJson = responseBody.transaction;
    const height = new Uint53(transactionJson.height);
    const confirmations = new Uint53(transactionJson.confirmations);
    const transactionId = Uint64.fromString(transactionJson.id).toString() as TransactionId;

    const transaction = riseCodec.parseBytes(
      toUtf8(JSON.stringify(transactionJson)) as PostableBytes,
      this.myChainId,
    );

    return {
      ...transaction,
      height: height.toNumber(),
      confirmations: confirmations.toNumber(),
      transactionId: transactionId,
    };
  }

  private waitForTransaction(
    id: TransactionId,
  ): Stream<ConfirmedTransaction<UnsignedTransaction> | FailedTransaction> {
    let poller: NodeJS.Timeout | undefined;
    const producer: Producer<ConfirmedTransaction<UnsignedTransaction> | FailedTransaction> = {
      start: listener => {
        setInterval(async () => {
          try {
            const result = await this.searchSingleTransaction(id);
            if (result) {
              listener.next(result);
              listener.complete();
            } else {
              // okay, we'll try again´
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
  ): Promise<readonly ConfirmedTransaction<UnsignedTransaction>[]> {
    const result = await axios.get(`${this.baseUrl}/api/transactions`, {
      params: searchParams,
    });
    const responseBody = result.data;

    if (responseBody.success !== true) {
      throw new Error(`RISE API error: ${responseBody.error}`);
    }

    return responseBody.transactions
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

        const transaction = riseCodec.parseBytes(
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
