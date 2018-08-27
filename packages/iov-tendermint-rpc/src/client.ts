import { Stream } from "xstream";

import { Adaptor, Decoder, Encoder, findAdaptor, Params, Responses } from "./adaptor";
import { default as requests, Method, SubscribeRequestQuery, SubscriptionEventType } from "./requests";
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
    const query: requests.AbciInfoRequest = { method: Method.ABCI_INFO };
    return this.doCall(query, this.p.encodeAbciInfo, this.r.decodeAbciInfo);
  }

  public abciQuery(params: requests.AbciQueryParams): Promise<responses.AbciQueryResponse> {
    const query: requests.AbciQueryRequest = { params, method: Method.ABCI_QUERY };
    return this.doCall(query, this.p.encodeAbciQuery, this.r.decodeAbciQuery);
  }

  public block(height?: number): Promise<responses.BlockResponse> {
    const query: requests.BlockRequest = { method: Method.BLOCK, params: { height } };
    return this.doCall(query, this.p.encodeBlock, this.r.decodeBlock);
  }

  public blockResults(height?: number): Promise<responses.BlockResultsResponse> {
    const query: requests.BlockResultsRequest = { method: Method.BLOCK_RESULTS, params: { height } };
    return this.doCall(query, this.p.encodeBlockResults, this.r.decodeBlockResults);
  }

  public blockchain(minHeight?: number, maxHeight?: number): Promise<responses.BlockchainResponse> {
    const query: requests.BlockchainRequest = { method: Method.BLOCKCHAIN, params: { minHeight, maxHeight } };
    return this.doCall(query, this.p.encodeBlockchain, this.r.decodeBlockchain);
  }

  public broadcastTxSync(params: requests.BroadcastTxParams): Promise<responses.BroadcastTxSyncResponse> {
    const query: requests.BroadcastTxRequest = { params, method: Method.BROADCAST_TX_SYNC };
    return this.doCall(query, this.p.encodeBroadcastTx, this.r.decodeBroadcastTxSync);
  }

  public broadcastTxAsync(params: requests.BroadcastTxParams): Promise<responses.BroadcastTxAsyncResponse> {
    const query: requests.BroadcastTxRequest = { params, method: Method.BROADCAST_TX_ASYNC };
    return this.doCall(query, this.p.encodeBroadcastTx, this.r.decodeBroadcastTxAsync);
  }

  public broadcastTxCommit(params: requests.BroadcastTxParams): Promise<responses.BroadcastTxCommitResponse> {
    const query: requests.BroadcastTxRequest = { params, method: Method.BROADCAST_TX_COMMIT };
    return this.doCall(query, this.p.encodeBroadcastTx, this.r.decodeBroadcastTxCommit);
  }

  public commit(height?: number): Promise<responses.CommitResponse> {
    const query: requests.CommitRequest = { method: Method.COMMIT, params: { height } };
    return this.doCall(query, this.p.encodeCommit, this.r.decodeCommit);
  }

  public genesis(): Promise<responses.GenesisResponse> {
    const query: requests.GenesisRequest = { method: Method.GENESIS };
    return this.doCall(query, this.p.encodeGenesis, this.r.decodeGenesis);
  }

  public health(): Promise<responses.HealthResponse> {
    const query: requests.HealthRequest = { method: Method.HEALTH };
    return this.doCall(query, this.p.encodeHealth, this.r.decodeHealth);
  }

  public status(): Promise<responses.StatusResponse> {
    const query: requests.StatusRequest = { method: Method.STATUS };
    return this.doCall(query, this.p.encodeStatus, this.r.decodeStatus);
  }

  public subscribe(
    eventType: SubscriptionEventType,
    query?: SubscribeRequestQuery,
  ): Stream<responses.SubscriptionEvent> {
    if (!instanceOfRpcStreamingClient(this.client)) {
      throw new Error("This RPC client type cannot subscribe to events");
    }

    const request: requests.SubscribeRequest = { method: Method.SUBSCRIBE, type: eventType };
    const req = this.p.encodeSubscribe(request, query || undefined);
    const eventStream = this.client.listen(req);
    return eventStream.map<responses.SubscriptionEvent>(event => {
      // tslint:disable-next-line:no-console
      // console.log(JSON.stringify(event));
      return this.r.decodeSubscriptionEvent(event);
    });
  }

  public tx(params: requests.TxParams): Promise<responses.TxResponse> {
    const query: requests.TxRequest = { params, method: Method.TX };
    return this.doCall(query, this.p.encodeTx, this.r.decodeTx);
  }

  public txSearch(params: requests.TxSearchParams): Promise<responses.TxSearchResponse> {
    const query: requests.TxSearchRequest = { params, method: Method.TX_SEARCH };
    return this.doCall(query, this.p.encodeTxSearch, this.r.decodeTxSearch);
  }

  public validators(height?: number): Promise<responses.ValidatorsResponse> {
    const query: requests.ValidatorsRequest = { method: Method.VALIDATORS, params: { height } };
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
}
