import { Adaptor, Decoder, Encoder, findAdaptor, Params, Responses } from "./adaptor";
import { default as requests, Method } from "./requests";
import * as responses from "./responses";
import { RpcClient } from "./rpcclient";

export class Client {
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

  public abciInfo(): Promise<responses.AbciInfoResponse> {
    const query: requests.AbciInfoRequest = { method: Method.ABCI_INFO };
    return this.doCall(query, this.p.encodeAbciInfo, this.r.decodeAbciInfo);
  }

  public abciQuery(params: requests.AbciQueryParams): Promise<responses.AbciQueryResponse> {
    const query: requests.AbciQueryRequest = { params, method: Method.ABCI_QUERY };
    return this.doCall(query, this.p.encodeAbciQuery, this.r.decodeAbciQuery);
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
