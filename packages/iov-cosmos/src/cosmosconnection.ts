/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Account,
  AccountQuery,
  AddressQuery,
  BlockchainConnection,
  BlockHeader,
  ChainId,
  ConfirmedAndSignedTransaction,
  ConfirmedTransaction,
  FailedTransaction,
  Fee,
  LightTransaction,
  Nonce,
  PostableBytes,
  PostTxResponse,
  PubkeyQuery,
  Token,
  TokenTicker,
  TransactionId,
  TransactionQuery,
  UnsignedTransaction,
} from "@iov/bcp";
import { Stream } from "xstream";

export class CosmosConnection implements BlockchainConnection {
  public static async establish(url: string): Promise<CosmosConnection> {
    throw new Error("not implemented");
  }

  public disconnect(): void {
    throw new Error("not implemented");
  }

  public chainId(): ChainId {
    throw new Error("not implemented");
  }

  public async height(): Promise<number> {
    throw new Error("not implemented");
  }

  public async getToken(ticker: TokenTicker): Promise<Token | undefined> {
    throw new Error("not implemented");
  }

  public async getAllTokens(): Promise<readonly Token[]> {
    throw new Error("not implemented");
  }

  public async getAccount(query: AccountQuery): Promise<Account | undefined> {
    throw new Error("not implemented");
  }

  public watchAccount(account: AccountQuery): Stream<Account | undefined> {
    throw new Error("not implemented");
  }

  public async getNonce(query: AddressQuery | PubkeyQuery): Promise<Nonce> {
    throw new Error("not implemented");
  }

  public async getNonces(query: AddressQuery | PubkeyQuery, count: number): Promise<readonly Nonce[]> {
    throw new Error("not implemented");
  }

  public async getBlockHeader(height: number): Promise<BlockHeader> {
    throw new Error("not implemented");
  }

  public watchBlockHeaders(): Stream<BlockHeader> {
    throw new Error("not implemented");
  }

  public async getTx(
    id: TransactionId,
  ): Promise<(ConfirmedAndSignedTransaction<UnsignedTransaction>) | FailedTransaction> {
    throw new Error("not implemented");
  }

  public async postTx(tx: PostableBytes): Promise<PostTxResponse> {
    throw new Error("not implemented");
  }

  public async searchTx(
    query: TransactionQuery,
  ): Promise<readonly (ConfirmedTransaction<LightTransaction> | FailedTransaction)[]> {
    throw new Error("not implemented");
  }

  public listenTx(
    query: TransactionQuery,
  ): Stream<ConfirmedTransaction<LightTransaction> | FailedTransaction> {
    throw new Error("not implemented");
  }

  public liveTx(query: TransactionQuery): Stream<ConfirmedTransaction<LightTransaction> | FailedTransaction> {
    throw new Error("not implemented");
  }

  public async getFeeQuote(tx: UnsignedTransaction): Promise<Fee> {
    throw new Error("not implemented");
  }

  public async withDefaultFee<T extends UnsignedTransaction>(tx: T): Promise<T> {
    throw new Error("not implemented");
  }
}
