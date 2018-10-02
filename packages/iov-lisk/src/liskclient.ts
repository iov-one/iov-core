import axios from "axios";
import { ReadonlyDate } from "readonly-date";
import { Stream } from "xstream";

import {
  Address,
  BcpAccount,
  BcpAccountQuery,
  BcpAddressQuery,
  BcpConnection,
  BcpNonce,
  BcpQueryEnvelope,
  BcpTicker,
  BcpTransactionResponse,
  ConfirmedTransaction,
  Nonce,
  TokenTicker,
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { Algorithm, ChainId, PostableBytes, PublicKeyBytes, Tag, TxId, TxQuery } from "@iov/tendermint-types";

import { constants } from "./constants";
import { Parse } from "./parse";

function isAddressQuery(query: BcpAccountQuery): query is BcpAddressQuery {
  return (query as BcpAddressQuery).address !== undefined;
}

/**
 * Encodes the current date and time as a nonce
 */
export function generateNonce(): Nonce {
  const now = new ReadonlyDate(ReadonlyDate.now());
  return Parse.timeToNonce(now);
}

export class LiskClient implements BcpConnection {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    if (!baseUrl.match(/^https?:\/\/[-\.a-zA-Z0-9]+(:[0-9]+)?\/?$/)) {
      throw new Error(
        "Invalid API URL. Expected a base URL like https://testnet.lisk.io or http://123.123.132.132:8000/",
      );
    }

    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  }

  public disconnect(): void {
    // no-op
  }

  public async chainId(): Promise<ChainId> {
    const url = this.baseUrl + "/api/node/constants";
    const result = await axios.get(url);
    const responseBody = result.data;
    return responseBody.data.nethash;
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

    await axios.post(this.baseUrl + "/api/transactions", bytes, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Sleep some seconds to ensure transaction will be found.
    // Sleep duration determined by trial and error. 15 seconds was not enough.
    await new Promise(resolve => setTimeout(resolve, 20 * 1000));

    const result = await axios.get(this.baseUrl + `/api/transactions?id=${transactionId}`);
    const responseBody = result.data;

    let height: number | undefined;
    let transactionResultBytes: Uint8Array | undefined;
    if (responseBody.meta.count === 1) {
      const transactionResult = responseBody.data[0];
      height = transactionResult.height;
      transactionResultBytes = Encoding.toUtf8(JSON.stringify(transactionResult));
    }

    return {
      metadata: {
        status: true, // commit failures should throw
        height: height,
      },
      data: {
        message: "",
        txid: Encoding.toAscii(transactionId) as TxId,
        result: transactionResultBytes || new Uint8Array([]),
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
    if (isAddressQuery(query)) {
      const address = query.address;
      const url = this.baseUrl + `/api/accounts?address=${Encoding.fromAscii(address)}`;
      const result = await axios.get(url);
      const responseBody = result.data;

      const account: BcpAccount = {
        address: address,
        name: undefined,
        balance: [
          {
            sigFigs: constants.primaryTokenSigFigs,
            tokenName: constants.primaryTokenName,
            ...Parse.liskAmount(responseBody.data[0].balance),
          },
        ],
      };

      const wrapped: BcpQueryEnvelope<BcpAccount> = {
        metadata: {
          offset: 0,
          limit: 0,
        },
        data: [account],
      };

      return wrapped;
    } else {
      throw new Error("Query type not supported");
    }
  }

  public getNonce(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpNonce>> {
    if (isAddressQuery(query)) {
      const address = query.address;

      const nonce: BcpNonce = {
        address: address,
        // fake pubkey, we cannot always know this
        publicKey: {
          algo: Algorithm.ED25519,
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

  public changeBalance(_: Address): Stream<number> {
    throw new Error("Not implemented");
  }

  public changeNonce(_: Address): Stream<number> {
    throw new Error("Not implemented");
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

  public searchTx(_: TxQuery): Promise<ReadonlyArray<ConfirmedTransaction>> {
    throw new Error("Not implemented");
  }

  public listenTx(_: ReadonlyArray<Tag>): Stream<ConfirmedTransaction> {
    throw new Error("Not implemented");
  }

  public liveTx(_: TxQuery): Stream<ConfirmedTransaction> {
    throw new Error("Not implemented");
  }
}
