import axios from "axios";
import { ReadonlyDate } from "readonly-date";
import { Stream } from "xstream";

import {
  BcpAccount,
  BcpAccountQuery,
  BcpConnection,
  BcpNonce,
  BcpQueryEnvelope,
  BcpTicker,
  BcpTransactionResponse,
  ConfirmedTransaction,
  dummyEnvelope,
  isAddressQuery,
  Nonce,
  TokenTicker,
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { Algorithm, ChainId, PostableBytes, PublicKeyBytes, Tag, TxId, TxQuery } from "@iov/tendermint-types";

import { constants } from "./constants";
import { Parse } from "./parse";

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

  public async postTx(bytes: PostableBytes): Promise<BcpTransactionResponse> {
    const transactionId = JSON.parse(Encoding.fromUtf8(bytes)).id as string;
    if (!transactionId.match(/^[0-9]+$/)) {
      throw new Error("Invalid transaction ID");
    }

    const r = await axios.put(this.baseUrl + "/api/transactions", bytes, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!r.data.success) {
      throw new Error(r.data.error);
    }

    // Sleep for 2 blocks
    await new Promise(resolve => setTimeout(resolve, 60 * 1000));

    const result = await axios.get(this.baseUrl + `/api/transactions/get?id=${transactionId}`);
    const responseBody = result.data;
    if (!responseBody.success) {
      throw new Error(responseBody.error || `Cannot fetch ${transactionId}`);
    }

    let height: number | undefined;
    let transactionResultBytes: Uint8Array | undefined;

    const transactionResult = responseBody.transaction;
    height = transactionResult.height;
    transactionResultBytes = Encoding.toUtf8(JSON.stringify(transactionResult));

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
      if (result.data.error) {
        return dummyEnvelope([]);
      }
      const responseBody = result.data.account;

      const accounts: ReadonlyArray<BcpAccount> = [
        {
          address: address,
          name: undefined,
          balance: [
            {
              sigFigs: constants.primaryTokenSigFigs,
              tokenName: constants.primaryTokenName,
              ...Parse.riseAmount(responseBody.balance),
            },
          ],
        },
      ];

      return dummyEnvelope(accounts);
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
