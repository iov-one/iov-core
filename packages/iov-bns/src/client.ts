import { BroadcastTxCommitResponse, Client as TendermintClient, StatusResponse } from "@iov/tendermint-rpc";
import { ChainId, SignedTransaction, TxCodec } from "@iov/types";

import { Codec as BNSCodec } from "./txcodec";

export interface Result {
  readonly key: Uint8Array;
  readonly value: Uint8Array;
}

export interface QueryResponse {
  readonly height: number;
  readonly results: ReadonlyArray<Result>;
}

/* TODOS */
export type TxResponse = BroadcastTxCommitResponse;
export type BcpAccount = any;
export type BcpNonce = any;

// const getAddr = key => ({address: key.slice(5).toString('hex')});
// const queryAccount = (client, acct) => client.queryParseOne(acct, "/wallets", weave.weave.cash.Set, getAddr);
// const querySigs = (client, acct) => client.queryParseOne(acct, "/auth", weave.weave.sigs.UserData, getAddr);

// Client talks directly to the BNS blockchain and exposes the
// same interface we have with the BCP protocol.
// We can embed in web4 process or use this in a BCP-relay
export class Client {
  protected readonly tmClient: TendermintClient;
  protected readonly codec: TxCodec;

  constructor(tmClient: TendermintClient) {
    this.tmClient = tmClient;
    this.codec = BNSCodec;
  }

  public sendTx(tx: SignedTransaction): Promise<TxResponse> {
    const bytes = this.codec.bytesToPost(tx);
    return this.tmClient.broadcastTxCommit({ tx: bytes });
  }

  public queryAccount(/*address: AddressBytes*/): Promise<BcpAccount> {
    throw new Error("not yet implemented");
  }

  public queryNonce(/*address: AddressBytes*/): Promise<BcpNonce> {
    throw new Error("not yet implemented");
  }

  public async chainID(): Promise<ChainId> {
    const status = await this.status();
    return status.nodeInfo.network;
  }

  public async height(): Promise<number> {
    const status = await this.status();
    return status.syncInfo.latestBlockHeight;
  }

  public status(): Promise<StatusResponse> {
    return this.tmClient.status();
  }

  protected async query(/*path: string, data: Uint8Array*/): Promise<QueryResponse> {
    throw new Error("not yet implemented");
  }
}
