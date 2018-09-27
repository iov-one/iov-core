import { Stream } from "xstream";

import {
  Address,
  BcpAccount,
  BcpAccountQuery,
  BcpNonce,
  BcpQueryEnvelope,
  BcpTicker,
  BcpTransactionResponse,
  ConfirmedTransaction,
  IovReader,
  TokenTicker,
} from "@iov/bcp-types";
import { ChainId, PostableBytes, Tag, TxQuery } from "@iov/tendermint-types";

export class LiskClient implements IovReader {
  public disconnect(): void {
    throw new Error("Not implemented");
  }

  public chainId(): Promise<ChainId> {
    throw new Error("Not implemented");
  }

  public height(): Promise<number> {
    throw new Error("Not implemented");
  }

  public postTx(_: PostableBytes): Promise<BcpTransactionResponse> {
    throw new Error("Not implemented");
  }

  public getTicker(_: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>> {
    throw new Error("Not implemented");
  }

  public getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>> {
    throw new Error("Not implemented");
  }

  public getAccount(_: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>> {
    throw new Error("Not implemented");
  }

  public getNonce(_: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpNonce>> {
    throw new Error("Not implemented");
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
