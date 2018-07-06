export type RpcId = string;

// Base64String is just a note that the string should be base64 encoded bytes
export type Base64String = string;
export type HexString = string;

// these are strings with certains meanings that can be parsed
export type IpPort = string;
export type DateTimeString = string;

export interface JsonRpc {
  readonly jsonrpc: "2.0";
  readonly id: RpcId;
}

export interface JsonRpcQuery extends JsonRpc {
  readonly method: Method;
  readonly params: ReadonlyArray<Param>;
}

export type JsonRpcResponse = JsonRpcSuccess | JsonRpcError;

export interface JsonRpcSuccess extends JsonRpc {
  readonly result: Result;
}

export interface JsonRpcError extends JsonRpc {
  readonly error: string;
}

export type Param = any;
export type Result = any;

// union type of all possible methods?
export const enum Method {
  ABCI_INFO = "abci_info",
  ABCI_QUERY = "abci_query",
  BLOCK = "block",
  BLOCKCHAIN = "blockchain",
  BROADCAST_TX_ASYNC = "broadcast_tx_async",
  BROADCAST_TX_SYNC = "broadcast_tx_sync",
  BROADCAST_TX_COMMIT = "broadcast_tx_commit",
  COMMIT = "commit",
  GENESIS = "genesis",
  HEALTH = "health",
  STATUS = "status",
  TX = "tx",
  VALIDATORS = "validators",
  // TODO: subscribe, unsubscribe, random commands
}

export type AbciInfoParams = ReadonlyArray<undefined>;

export interface AbciInfoResult {
  readonly response: {
    readonly data: string;
    readonly last_block_height: number;
    readonly last_block_app_hash: Base64String;
  };
}

export type StatusParams = ReadonlyArray<undefined>;

export interface StatusResult {
  readonly response: StatusResponse;
}

export interface StatusResponse {
  readonly node_info: NodeInfo;
  readonly sync_info: SyncInfo;
  readonly validator_info: ValidatorInfo;
}

export interface NodeInfo {
  readonly id: HexString;
  readonly listen_addr: IpPort;
  readonly network: string;
  readonly version: string;
  readonly channels: string; // ???
  readonly moniker: string;
  readonly other: ReadonlyArray<string>;
  // [
  //   "amino_version=0.9.9",
  //   "p2p_version=0.5.0",
  //   "consensus_version=v1/0.2.2",
  //   "rpc_version=0.7.0/3",
  //   "tx_index=on",
  //   "rpc_addr=tcp://0.0.0.0:46657"
  // ]
}

export interface SyncInfo {
  readonly latest_block_hash: HexString;
  readonly latest_app_hash: HexString;
  readonly latest_block_height: number;
  readonly latest_block_time: DateTimeString;
  readonly syncing: boolean;
}

export interface ValidatorInfo {
  readonly address: HexString;
  readonly pub_key: RpcPubKey;
  readonly voting_power: number;
}

export interface RpcPubKey {
  readonly type: HexString;
  readonly value: Base64String;
}
