import axios from "axios";
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
  TokenTicker,
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

import { constants } from "./constants";
import { Parse } from "./parse";
import { decodeHexQuantity, decodeHexQuantityNonce, decodeHexQuantityString } from "./utils";

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

  public async postTx(bytes: PostableBytes): Promise<BcpTransactionResponse> {
    const result = await axios.post(this.baseUrl, {
      jsonrpc: "2.0",
      method: "eth_sendRawTransaction",
      params: ["0x" + Encoding.toHex(bytes)],
      id: 5,
    });
    return {
      metadata: {
        height: undefined,
      },
      data: {
        message: "",
        txid: Encoding.fromHex(result.data.result) as TxId,
        result: result.data,
      },
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
            sigFigs: constants.primaryTokenSigFigs,
            tokenName: constants.primaryTokenName,
            ...Parse.ethereumAmount(decodeHexQuantityString(item.result)),
          },
        ],
      }),
    );
    return dummyEnvelope(accounts);
  }

  public async getNonce(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpNonce>> {
    if (isAddressQuery(query)) {
      const address = query.address;

      // see https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_gettransactioncount
      const nonceResponse = await axios.post(this.baseUrl, {
        jsonrpc: "2.0",
        method: "eth_getTransactionCount",
        params: [address, "latest"],
        id: 4,
      });

      const nonce: BcpNonce = {
        address: address,
        // fake pubkey, we cannot always know this
        pubkey: {
          algo: Algorithm.Ed25519,
          data: new Uint8Array([]) as PublicKeyBytes,
        },
        nonce: decodeHexQuantityNonce(nonceResponse.data.result),
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

  public searchTx(_: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>> {
    throw new Error("Not implemented");
  }

  public listenTx(_: ReadonlyArray<BcpQueryTag>): Stream<ConfirmedTransaction> {
    throw new Error("Not implemented");
  }

  public liveTx(_: BcpTxQuery): Stream<ConfirmedTransaction> {
    throw new Error("Not implemented");
  }
}
