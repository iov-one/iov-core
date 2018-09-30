import { Stream } from "xstream";

import { Tag } from "@iov/tendermint-types";

import { Adaptor, Decoder, Encoder, findAdaptor, Params, Responses } from "./adaptor";
import { JsonRpcEvent } from "./common";
import * as requests from "./requests";
import * as responses from "./responses";
import { HttpClient, instanceOfRpcStreamingClient, RpcClient, WebsocketClient } from "./rpcclient";

export class Client {
  public static connect(url: string): Promise<Client> {
    const useHttp = url.startsWith("http://") || url.startsWith("https://");
    const client = useHttp ? new HttpClient(url) : new WebsocketClient(url);
    return this.detectVersion(client);
  }

  public static async detectVersion(client: RpcClient): Promise<Client> {
    const adaptor = await findAdaptor(client);
    return new Client(client, adaptor);
  }

  private readonly client: RpcClient;
  private readonly p: Params;
  private readonly r: Responses;

  constructor(client: RpcClient, adaptor: Adaptor) {
    this.client = client;
    this.p = adaptor.params;
    this.r = adaptor.responses;
  }

  public disconnect(): void {
    this.client.disconnect();
  }

  public abciInfo(): Promise<responses.AbciInfoResponse> {
    const query: requests.AbciInfoRequest = { method: requests.Method.ABCI_INFO };
    return this.doCall(query, this.p.encodeAbciInfo, this.r.decodeAbciInfo);
  }

  public abciQuery(params: requests.AbciQueryParams): Promise<responses.AbciQueryResponse> {
    const query: requests.AbciQueryRequest = { params, method: requests.Method.ABCI_QUERY };
    return this.doCall(query, this.p.encodeAbciQuery, this.r.decodeAbciQuery);
  }

  public block(height?: number): Promise<responses.BlockResponse> {
    const query: requests.BlockRequest = { method: requests.Method.BLOCK, params: { height } };
    return this.doCall(query, this.p.encodeBlock, this.r.decodeBlock);
  }

  public blockResults(height?: number): Promise<responses.BlockResultsResponse> {
    const query: requests.BlockResultsRequest = { method: requests.Method.BLOCK_RESULTS, params: { height } };
    return this.doCall(query, this.p.encodeBlockResults, this.r.decodeBlockResults);
  }

  public blockchain(minHeight?: number, maxHeight?: number): Promise<responses.BlockchainResponse> {
    const query: requests.BlockchainRequest = {
      method: requests.Method.BLOCKCHAIN,
      params: { minHeight, maxHeight },
    };
    return this.doCall(query, this.p.encodeBlockchain, this.r.decodeBlockchain);
  }

  public broadcastTxSync(params: requests.BroadcastTxParams): Promise<responses.BroadcastTxSyncResponse> {
    const query: requests.BroadcastTxRequest = { params, method: requests.Method.BROADCAST_TX_SYNC };
    return this.doCall(query, this.p.encodeBroadcastTx, this.r.decodeBroadcastTxSync);
  }

  public broadcastTxAsync(params: requests.BroadcastTxParams): Promise<responses.BroadcastTxAsyncResponse> {
    const query: requests.BroadcastTxRequest = { params, method: requests.Method.BROADCAST_TX_ASYNC };
    return this.doCall(query, this.p.encodeBroadcastTx, this.r.decodeBroadcastTxAsync);
  }

  public broadcastTxCommit(params: requests.BroadcastTxParams): Promise<responses.BroadcastTxCommitResponse> {
    const query: requests.BroadcastTxRequest = { params, method: requests.Method.BROADCAST_TX_COMMIT };
    return this.doCall(query, this.p.encodeBroadcastTx, this.r.decodeBroadcastTxCommit);
  }

  public commit(height?: number): Promise<responses.CommitResponse> {
    const query: requests.CommitRequest = { method: requests.Method.COMMIT, params: { height } };
    return this.doCall(query, this.p.encodeCommit, this.r.decodeCommit);
  }

  public genesis(): Promise<responses.GenesisResponse> {
    const query: requests.GenesisRequest = { method: requests.Method.GENESIS };
    return this.doCall(query, this.p.encodeGenesis, this.r.decodeGenesis);
  }

  public health(): Promise<responses.HealthResponse> {
    const query: requests.HealthRequest = { method: requests.Method.HEALTH };
    return this.doCall(query, this.p.encodeHealth, this.r.decodeHealth);
  }

  public status(): Promise<responses.StatusResponse> {
    const query: requests.StatusRequest = { method: requests.Method.STATUS };
    return this.doCall(query, this.p.encodeStatus, this.r.decodeStatus);
  }

  public subscribeNewBlock(): Stream<responses.NewBlockEvent> {
    const request: requests.SubscribeRequest = {
      method: requests.Method.SUBSCRIBE,
      query: { type: requests.SubscriptionEventType.NewBlock },
    };
    return this.subscribe(request, this.r.decodeNewBlockEvent);
  }

  public subscribeNewBlockHeader(): Stream<responses.NewBlockHeaderEvent> {
    const request: requests.SubscribeRequest = {
      method: requests.Method.SUBSCRIBE,
      query: { type: requests.SubscriptionEventType.NewBlockHeader },
    };
    return this.subscribe(request, this.r.decodeNewBlockHeaderEvent);
  }

  public subscribeTx(tags?: ReadonlyArray<Tag>): Stream<responses.TxEvent> {
    const request: requests.SubscribeRequest = {
      method: requests.Method.SUBSCRIBE,
      query: {
        type: requests.SubscriptionEventType.Tx,
        tags: tags,
      },
    };
    return this.subscribe(request, this.r.decodeTxEvent);
  }

  public tx(params: requests.TxParams): Promise<responses.TxResponse> {
    const query: requests.TxRequest = { params, method: requests.Method.TX };
    return this.doCall(query, this.p.encodeTx, this.r.decodeTx);
  }

  public txSearch(params: requests.TxSearchParams): Promise<responses.TxSearchResponse> {
    const query: requests.TxSearchRequest = { params, method: requests.Method.TX_SEARCH };
    return this.doCall(query, this.p.encodeTxSearch, this.r.decodeTxSearch);
  }

  // this should paginate through all txSearch options to ensure it returns all results.
  // starts with page 1 or whatever was provided (eg. to start on page 7)
  public async txSearchAll(params: requests.TxSearchParams): Promise<responses.TxSearchResponse> {
    let page = params.page || 1;
    let txs: ReadonlyArray<responses.TxResponse> = [];
    let done = false;

    while (!done) {
      const resp = await this.txSearch({ ...params, page });
      txs = [...txs, ...resp.txs];
      if (txs.length < resp.totalCount) {
        page++;
      } else {
        done = true;
      }
    }

    return {
      totalCount: txs.length,
      txs,
    };
  }

  public validators(height?: number): Promise<responses.ValidatorsResponse> {
    const query: requests.ValidatorsRequest = { method: requests.Method.VALIDATORS, params: { height } };
    return this.doCall(query, this.p.encodeValidators, this.r.decodeValidators);
  }

  // doCall is a helper to handle the encode/call/decode logic
  private async doCall<T extends requests.Request, U extends responses.Response>(
    request: T,
    encode: Encoder<T>,
    decode: Decoder<U>,
  ): Promise<U> {
    const req = encode(request);
    const result = await this.client.execute(req);
    return decode(result);
  }

  private subscribe<T>(request: requests.SubscribeRequest, decode: (e: JsonRpcEvent) => T): Stream<T> {
    if (!instanceOfRpcStreamingClient(this.client)) {
      throw new Error("This RPC client type cannot subscribe to events");
    }

    const req = this.p.encodeSubscribe(request);
    const eventStream = this.client.listen(req);
    return eventStream.map<T>(event => {
      // tslint:disable-next-line:no-console
      // console.log(JSON.stringify(event));
      return decode(event);
    });
  }
}
