import axios from "axios";
import { ReadonlyDate } from "readonly-date";
import { Stream } from "xstream";

import { ChainId, PostableBytes } from "@iov/base-types";
import {
  Address,
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
  ConfirmedTransaction,
  dummyEnvelope,
  isAddressQuery,
  isPubkeyQuery,
  Nonce,
  PostTxResponse,
  TokenTicker,
  TransactionId,
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { DefaultValueProducer, ValueAndUpdates } from "@iov/stream";

import { constants } from "./constants";
import { keyToAddress } from "./derivation";
import { ethereumCodec } from "./ethereumcodec";
import { Parse, Scraper } from "./parse";
import { BlockHeader } from "./responses";
import {
  decodeHexQuantity,
  decodeHexQuantityNonce,
  decodeHexQuantityString,
  encodeQuantity,
  hexPadToEven,
} from "./utils";

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

    if (!chainId.match(/^[0-9]+$/)) {
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

  public async postTx(bytes: PostableBytes): Promise<PostTxResponse> {
    const result = await axios.post(this.baseUrl, {
      jsonrpc: "2.0",
      method: "eth_sendRawTransaction",
      params: ["0x" + Encoding.toHex(bytes)],
      id: 5,
    });
    if (result.data.error) {
      throw new Error(result.data.error.message);
    }

    const transactionResult = result.data.result;
    if (typeof transactionResult !== "string") {
      throw new Error("Result field was not a string");
    }

    const transactionId = transactionResult as TransactionId;
    if (!transactionId.match(/^0x[0-9a-f]{64}$/)) {
      throw new Error("Invalid transaction ID format");
    }

    const blockInfoPending = new DefaultValueProducer<BcpBlockInfo>({
      state: BcpTransactionState.Pending,
    });
    return {
      blockInfo: new ValueAndUpdates(blockInfoPending),
      transactionId: transactionId,
    };
  }

  public getTicker(_: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>> {
    throw new Error("Not implemented");
  }

  public getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>> {
    throw new Error("Not implemented");
  }

  public async getAccount(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>> {
    let address: Address;
    if (isAddressQuery(query)) {
      address = query.address;
    } else {
      throw new Error("Query type not supported");
    }

    // see https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_getbalance
    const confirmedBalance = await axios.post(this.baseUrl, {
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [address, "latest"],
      id: 3,
    });
    const responseBody = confirmedBalance.data;

    // here we are expecting 0 or 1 results
    const accounts: ReadonlyArray<BcpAccount> = [responseBody].map(
      (item: any): BcpAccount => ({
        address: address,
        name: undefined,
        balance: [
          {
            tokenName: constants.primaryTokenName,
            ...Parse.ethereumAmount(decodeHexQuantityString(item.result)),
          },
        ],
      }),
    );
    return dummyEnvelope(accounts);
  }

  public async getNonce(query: BcpAddressQuery | BcpPubkeyQuery): Promise<BcpQueryEnvelope<Nonce>> {
    const address = isPubkeyQuery(query) ? keyToAddress(query.pubkey) : query.address;

    // see https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_gettransactioncount
    const nonceResponse = await axios.post(this.baseUrl, {
      jsonrpc: "2.0",
      method: "eth_getTransactionCount",
      params: [address, "latest"],
      id: 4,
    });

    return Promise.resolve(dummyEnvelope([decodeHexQuantityNonce(nonceResponse.data.result)]));
  }

  public async getBlockHeader(height: number): Promise<BlockHeader> {
    const blockResponse = await axios.post(this.baseUrl, {
      jsonrpc: "2.0",
      method: "eth_getBlockByNumber",
      params: [encodeQuantity(height), true],
      id: 8,
    });
    if (blockResponse.data.result === null) {
      throw new Error(`Header ${height} doesn't exist yet`);
    }
    const blockData = blockResponse.data.result;
    return {
      chainId: this.myChainId,
      height: decodeHexQuantity(blockData.number),
      time: new ReadonlyDate(decodeHexQuantity(blockData.timestamp) * 1000),
      blockId: Encoding.fromHex(hexPadToEven(blockData.hash)),
      totalTxs: blockData.transactions.length,
    };
  }

  public changeBlock(): Stream<number> {
    throw new Error("Not implemented");
  }

  public watchAccount(_: BcpAccountQuery): Stream<BcpAccount | undefined> {
    throw new Error("Not implemented");
  }

  public watchNonce(_: BcpAddressQuery | BcpPubkeyQuery): Stream<Nonce | undefined> {
    throw new Error("Not implemented");
  }

  public async searchTx(query: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>> {
    if (query.height || query.minHeight || query.maxHeight) {
      throw new Error("Query by height, minHeight, maxHeight not supported");
    }
    let txUncodified;
    if (query.id !== undefined) {
      if (!query.id.match(/^0x[0-9a-f]{64}$/)) {
        throw new Error("Invalid transaction ID format");
      }
      txUncodified = await axios.post(this.baseUrl, {
        jsonrpc: "2.0",
        method: "eth_getTransactionByHash",
        params: [query.id],
        id: 6,
      });
      if (txUncodified.data.result === null || txUncodified.data.result.blockNumber === null) {
        return [];
      }
      // TODO: compare myChainId with value v (missed recovery parameter)
      const lastBlockNumber = await axios.post(this.baseUrl, {
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 7,
      });
      const height = decodeHexQuantity(txUncodified.data.result.blockNumber);
      const confirmations = decodeHexQuantity(lastBlockNumber.data.result) - height;
      const transactionJson = {
        ...txUncodified.data.result,
        type: 0,
      };
      const transaction = ethereumCodec.parseBytes(
        Encoding.toUtf8(JSON.stringify(transactionJson)) as PostableBytes,
        this.myChainId,
      );
      const transactionId = `0x${hexPadToEven(txUncodified.data.result.hash)}` as TransactionId;
      return [
        {
          ...transaction,
          height: height,
          confirmations: confirmations,
          transactionId: transactionId,
        },
      ];
    } else if (query.tags && query.tags[0].key === "apiLink" && query.tags[1].key === "account") {
      const apiLink = query.tags[0].value;
      const accountAddress = query.tags[1].value;
      txUncodified = await axios.get(
        `${apiLink}?module=account&action=txlist&address=${accountAddress}&startblock=0&sort=asc`,
      );
      if (txUncodified.data.result === null) {
        return [];
      }
      const transactions: any = [];
      for (const tx of txUncodified.data.result) {
        if (tx.isError === "0" && tx.txreceipt_status === "1") {
          const transaction = Scraper.parseBytesTx(
            Encoding.toUtf8(JSON.stringify({ ...tx })) as PostableBytes,
            this.myChainId,
          );
          const transactionId = `0x${hexPadToEven(tx.hash)}` as TransactionId;
          transactions.push({
            ...transaction,
            height: tx.blockNumber,
            confirmations: tx.confirmations,
            transactionId: transactionId,
          });
        }
      }
      return transactions;
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
