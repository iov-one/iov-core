import axios from "axios";
import equal from "fast-deep-equal";
import { ReadonlyDate } from "readonly-date";
import { Producer, Stream } from "xstream";

import {
  Algorithm,
  BcpAccount,
  BcpAccountQuery,
  BcpAddressQuery,
  BcpBlockInfo,
  BcpConnection,
  BcpPubkeyQuery,
  BcpTicker,
  BcpTransactionState,
  BcpTxQuery,
  BlockHeader,
  BlockId,
  ChainId,
  ConfirmedTransaction,
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
  if (!url.match(/^https?:\/\/[-\.a-zA-Z0-9]+(:[0-9]+)?\/?$/)) {
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
  return responseBody.nethash;
}

export class RiseConnection implements BcpConnection {
  public static async establish(baseUrl: string): Promise<RiseConnection> {
    const chainId = await loadChainId(baseUrl);
    return new RiseConnection(baseUrl, chainId);
  }

  private readonly baseUrl: string;
  private readonly myChainId: ChainId;

  constructor(baseUrl: string, chainId: ChainId) {
    this.baseUrl = checkAndNormalizeUrl(baseUrl);

    if (!chainId.match(/^[a-f0-9]{64}$/)) {
      throw new Error("The chain ID must be a RISE nethash, encoded as 64 lower-case hex characters.");
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
      throw new Error(`Transactions invalid: ${JSON.stringify(response.data.invalid)}`);
    }

    if (response.data.accepted.length !== 1) {
      throw new Error(`Expected one accepted transaction but got: ${JSON.stringify(response.data.accepted)}`);
    }

    let blockInfoInterval: any;
    const firstEvent: BcpBlockInfo = {
      state: BcpTransactionState.Pending,
    };
    let lastEventSent: BcpBlockInfo = firstEvent;
    const blockInfoProducer = new DefaultValueProducer<BcpBlockInfo>(firstEvent, {
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
    });

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
    if (result.data.error) {
      return undefined;
    }
    const responseBalance: unknown = result.data.account.balance;
    const responsePublicKey: unknown = result.data.account.publicKey;

    if (typeof responseBalance !== "string") {
      throw new Error("Unexpected type for .balance property in response");
    }

    const pubkey: PublicKeyBundle | undefined =
      typeof responsePublicKey === "string" && responsePublicKey
        ? {
            algo: Algorithm.Ed25519,
            data: Encoding.fromHex(responsePublicKey) as PublicKeyBytes,
          }
        : undefined;

    return {
      address: address,
      pubkey: pubkey,
      name: undefined,
      balance: [
        {
          quantity: Parse.parseQuantity(responseBalance),
          fractionalDigits: constants.primaryTokenFractionalDigits,
          tokenName: constants.primaryTokenName,
          tokenTicker: constants.primaryTokenTicker,
        },
      ],
    };
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

  /** @deprecated use watchBlockHeaders().map(header => header.height) */
  public changeBlock(): Stream<number> {
    return this.watchBlockHeaders().map(header => header.height);
  }

  public async searchTx(query: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>> {
    if (query.height || query.minHeight || query.maxHeight || query.tags) {
      throw new Error("Query by height, minHeight, maxHeight, tags not supported");
    }

    if (query.id !== undefined) {
      const result = await this.searchSingleTransaction({ id: query.id });
      return result ? [result] : [];
    } else if (query.address) {
      return this.searchTransactions({
        recipientId: query.address,
        senderId: query.address,
        limit: 1000,
      });
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

  private async searchSingleTransaction(searchParams: any): Promise<ConfirmedTransaction | undefined> {
    const result = await axios.get(`${this.baseUrl}/api/transactions/get`, {
      params: searchParams,
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

  private async searchTransactions(searchParams: any): Promise<ReadonlyArray<ConfirmedTransaction>> {
    const result = await axios.get(`${this.baseUrl}/api/transactions`, {
      params: searchParams,
    });
    const responseBody = result.data;

    if (responseBody.success !== true) {
      throw new Error(`RISE API error: ${responseBody.error}`);
    }

    return responseBody.transactions
      .filter((transactionJson: any) => {
        // other transaction types cannot be parsed
        return transactionJson.type === 0;
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
