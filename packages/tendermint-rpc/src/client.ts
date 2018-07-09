import * as requests from "./requests";
import * as responses from "./responses";
import { RpcClient } from "./rpcclient";
import { Adaptor, findAdaptor } from "./versions";

export class Client {
  public static async detectVersion(client: RpcClient): Promise<Client> {
    const adaptor = await findAdaptor(client);
    return new Client(client, adaptor);
  }

  private readonly adaptor: Adaptor;
  private readonly client: RpcClient;

  constructor(client: RpcClient, adaptor: Adaptor) {
    this.client = client;
    this.adaptor = adaptor;
  }

  public async abciInfo(): Promise<responses.AbciInfoResponse> {
    const query: requests.AbciInfoRequest = { method: requests.Method.ABCI_INFO };
    const req = this.adaptor.params.encodeAbciInfo(query);
    const result = await this.client.rpc(req);
    return this.adaptor.responses.decodeAbciInfo(result);
  }
}
