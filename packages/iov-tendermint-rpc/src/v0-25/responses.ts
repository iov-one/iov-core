import {
  Algorithm,
  ChainId,
  PostableBytes,
  PublicKeyBundle,
  PublicKeyBytes,
  SignatureBytes,
  TxId,
} from "@iov/base-types";
import { Encoding } from "@iov/encoding";

import { JsonRpcEvent, JsonRpcSuccess } from "../common";
import {
  Base64,
  Base64String,
  DateTime,
  DateTimeString,
  Hex,
  HexString,
  IntegerString,
  IpPortString,
  may,
  optional,
  parseInteger,
  required,
} from "../encodings";
import * as responses from "../responses";

/*** adaptor ***/

export class Responses {
  public static decodeAbciInfo(response: JsonRpcSuccess): responses.AbciInfoResponse {
    return decodeAbciInfo(required((response.result as AbciInfoResult).response));
  }

  public static decodeAbciQuery(response: JsonRpcSuccess): responses.AbciQueryResponse {
    return decodeAbciQuery(required((response.result as AbciQueryResult).response));
  }

  public static decodeBlock(response: JsonRpcSuccess): responses.BlockResponse {
    return decodeBlockResponse(response.result as RpcBlockResponse);
  }

  public static decodeBlockResults(response: JsonRpcSuccess): responses.BlockResultsResponse {
    return decodeBlockResults(response.result as RpcBlockResultsResponse);
  }

  public static decodeBlockchain(response: JsonRpcSuccess): responses.BlockchainResponse {
    return decodeBlockchain(response.result as RpcBlockchainResponse);
  }

  public static decodeBroadcastTxSync(response: JsonRpcSuccess): responses.BroadcastTxSyncResponse {
    return decodeBroadcastTxSync(response.result as RpcBroadcastTxSyncResponse);
  }

  public static decodeBroadcastTxAsync(response: JsonRpcSuccess): responses.BroadcastTxAsyncResponse {
    return this.decodeBroadcastTxSync(response);
  }

  public static decodeBroadcastTxCommit(response: JsonRpcSuccess): responses.BroadcastTxCommitResponse {
    return decodeBroadcastTxCommit(response.result as RpcBroadcastTxCommitResponse);
  }

  public static decodeCommit(response: JsonRpcSuccess): responses.CommitResponse {
    return decodeCommitResponse(response.result as RpcCommitResponse);
  }

  public static decodeGenesis(response: JsonRpcSuccess): responses.GenesisResponse {
    return decodeGenesis(required((response.result as GenesisResult).genesis));
  }

  public static decodeHealth(): responses.HealthResponse {
    return null;
  }

  public static decodeStatus(response: JsonRpcSuccess): responses.StatusResponse {
    return decodeStatus(response.result as RpcStatusResponse);
  }

  public static decodeNewBlockEvent(event: JsonRpcEvent): responses.NewBlockEvent {
    return decodeBlock(event.data.value.block as RpcBlock);
  }

  public static decodeNewBlockHeaderEvent(event: JsonRpcEvent): responses.NewBlockHeaderEvent {
    return decodeHeader(event.data.value.header as RpcHeader);
  }

  public static decodeTxEvent(event: JsonRpcEvent): responses.TxEvent {
    return decodeTxEvent(event.data.value.TxResult as RpcTxEvent);
  }

  public static decodeTx(response: JsonRpcSuccess): responses.TxResponse {
    return decodeTxResponse(response.result as RpcTxResponse);
  }

  public static decodeTxSearch(response: JsonRpcSuccess): responses.TxSearchResponse {
    return decodeTxSearch(response.result as RpcTxSearchResponse);
  }

  public static decodeValidators(response: JsonRpcSuccess): responses.ValidatorsResponse {
    return decodeValidators(response.result as RpcValidatorsResponse);
  }
}

/**** results *****/

export interface AbciInfoResult {
  readonly response: RpcAbciInfoResponse;
}
export interface RpcAbciInfoResponse {
  readonly data?: string;
  readonly last_block_height?: IntegerString;
  readonly last_block_app_hash?: Base64String;
}
const decodeAbciInfo = (data: RpcAbciInfoResponse): responses.AbciInfoResponse => ({
  data: data.data,
  lastBlockHeight: may(parseInt, data.last_block_height),
  lastBlockAppHash: may(Base64.decode, data.last_block_app_hash),
});

export interface AbciQueryResult {
  readonly response: RpcAbciQueryResponse;
}
export interface RpcAbciQueryResponse {
  readonly key: Base64String;
  readonly value?: Base64String;
  readonly proof?: Base64String;
  readonly height?: IntegerString;
  readonly index?: IntegerString;
  readonly code?: IntegerString; // only for errors
  readonly log?: string;
}
const decodeAbciQuery = (data: RpcAbciQueryResponse): responses.AbciQueryResponse => ({
  key: Base64.decode(optional(data.key, "" as Base64String)),
  value: Base64.decode(optional(data.value, "" as Base64String)),
  // proof: may(Base64.decode, data.proof),
  height: may(parseInteger, data.height),
  code: may(parseInteger, data.code),
  index: may(parseInteger, data.index),
  log: data.log,
});

export interface RpcBlockResponse {
  readonly block_meta: RpcBlockMeta;
  readonly block: RpcBlock;
}
const decodeBlockResponse = (data: RpcBlockResponse): responses.BlockResponse => ({
  blockMeta: decodeBlockMeta(data.block_meta),
  block: decodeBlock(data.block),
});

export interface RpcBlockResultsResponse {
  readonly height: IntegerString;
  readonly results: {
    readonly DeliverTx: ReadonlyArray<RpcTxData>;
    readonly EndBlock: {
      readonly validator_updates?: ReadonlyArray<RpcValidatorUpdate>;
      readonly consensus_param_updates?: RpcConsensusParams;
      readonly tags?: ReadonlyArray<RpcTag>;
    };
  };
}
const decodeBlockResults = (data: RpcBlockResultsResponse): responses.BlockResultsResponse => {
  const res = optional(data.results.DeliverTx, [] as ReadonlyArray<RpcTxData>);
  const end = data.results.EndBlock;
  const validators = optional(end.validator_updates, [] as ReadonlyArray<RpcValidatorUpdate>);
  return {
    height: parseInteger(required(data.height)),
    results: res.map(decodeTxData),
    endBlock: {
      validatorUpdates: validators.map(decodeValidatorUpdate),
      consensusUpdates: may(decodeConsensusParams, end.consensus_param_updates),
      tags: may(decodeTags, end.tags),
    },
  };
};

export interface RpcBlockchainResponse {
  readonly last_height: IntegerString;
  readonly block_metas: ReadonlyArray<RpcBlockMeta>;
}
const decodeBlockchain = (data: RpcBlockchainResponse): responses.BlockchainResponse => ({
  lastHeight: parseInteger(required(data.last_height)),
  blockMetas: required(data.block_metas).map(decodeBlockMeta),
});

export type RpcBroadcastTxAsyncResponse = RpcBroadcastTxSyncResponse;
export interface RpcBroadcastTxSyncResponse extends RpcTxData {
  readonly hash: HexString;
}
const decodeBroadcastTxSync = (data: RpcBroadcastTxSyncResponse): responses.BroadcastTxSyncResponse => ({
  ...decodeTxData(data),
  hash: Encoding.fromHex(required(data.hash)),
});

export interface RpcBroadcastTxCommitResponse {
  readonly height?: IntegerString;
  readonly hash: HexString;
  readonly check_tx: RpcTxData;
  readonly deliver_tx?: RpcTxData;
}
const decodeBroadcastTxCommit = (
  data: RpcBroadcastTxCommitResponse,
): responses.BroadcastTxCommitResponse => ({
  height: may(parseInteger, data.height),
  hash: Encoding.fromHex(required(data.hash)) as TxId,
  checkTx: decodeTxData(required(data.check_tx)),
  deliverTx: may(decodeTxData, data.deliver_tx),
});

export interface RpcCommitResponse {
  readonly SignedHeader: {
    readonly header: RpcHeader;
    readonly commit: RpcCommit;
  };
  readonly canonical: boolean;
}
const decodeCommitResponse = (data: RpcCommitResponse): responses.CommitResponse => ({
  canonical: required(data.canonical),
  header: decodeHeader(data.SignedHeader.header),
  commit: decodeCommit(data.SignedHeader.commit),
});

export interface GenesisResult {
  readonly genesis: RpcGenesisResponse;
}
export interface RpcGenesisResponse {
  readonly genesis_time: DateTimeString;
  readonly chain_id: string; // ChainId;
  readonly consensus_params: RpcConsensusParams;
  readonly validators: ReadonlyArray<RpcValidatorGenesis>;
  readonly app_hash: HexString; // HexString, Base64String??
  readonly app_state: {};
}
const decodeGenesis = (data: RpcGenesisResponse): responses.GenesisResponse => ({
  genesisTime: DateTime.decode(required(data.genesis_time)),
  chainId: required(data.chain_id) as ChainId,
  consensusParams: decodeConsensusParams(data.consensus_params),
  validators: required(data.validators).map(decodeValidatorGenesis),
  appHash: Encoding.fromHex(required(data.app_hash)),
  appState: data.app_state,
});

export type HealthResponse = null;

// status
export interface RpcStatusResponse {
  readonly node_info: RpcNodeInfo;
  readonly sync_info: RpcSyncInfo;
  readonly validator_info: RpcValidatorInfo;
}
const decodeStatus = (data: RpcStatusResponse): responses.StatusResponse => ({
  nodeInfo: decodeNodeInfo(data.node_info),
  syncInfo: decodeSyncInfo(data.sync_info),
  validatorInfo: decodeValidatorInfo(data.validator_info),
});

export interface RpcTxResponse {
  readonly tx: Base64String;
  readonly tx_result: RpcTxData;
  readonly height: IntegerString;
  readonly index: IntegerString;
  readonly hash: HexString;
  readonly proof?: RpcTxProof;
}
const decodeTxResponse = (data: RpcTxResponse): responses.TxResponse => ({
  tx: Base64.decode(required(data.tx)) as PostableBytes,
  txResult: decodeTxData(required(data.tx_result)),
  height: parseInteger(required(data.height)),
  index: parseInteger(required(data.index)),
  hash: Encoding.fromHex(required(data.hash)) as TxId,
  proof: may(decodeTxProof, data.proof),
});

export interface RpcTxSearchResponse {
  readonly txs: ReadonlyArray<RpcTxResponse>;
  readonly total_count: IntegerString;
}
const decodeTxSearch = (data: RpcTxSearchResponse): responses.TxSearchResponse => ({
  totalCount: parseInteger(required(data.total_count)),
  txs: required(data.txs).map(decodeTxResponse),
});

export interface RpcTxEvent {
  readonly tx: Base64String;
  readonly result: RpcTxData;
  readonly height: IntegerString;
  readonly index: IntegerString;
}

function decodeTxEvent(data: RpcTxEvent): responses.TxEvent {
  const tx = Base64.decode(required(data.tx)) as PostableBytes;
  return {
    tx,
    hash: Uint8Array.from([]) as TxId, // TODO
    result: decodeTxData(data.result),
    height: parseInteger(required(data.height)),
    index: parseInteger(required(data.index)),
  };
}

export interface RpcValidatorsResponse {
  readonly block_height: IntegerString;
  readonly validators: ReadonlyArray<RpcValidatorData>;
}
const decodeValidators = (data: RpcValidatorsResponse): responses.ValidatorsResponse => ({
  blockHeight: parseInteger(required(data.block_height)),
  results: required(data.validators).map(decodeValidatorData),
});

/**** Helper items used above ******/

export interface RpcTag {
  readonly key: Base64String;
  readonly value: Base64String;
}
const decodeTag = (data: RpcTag): responses.Tag => ({
  key: Base64.decode(required(data.key)),
  value: Base64.decode(required(data.value)),
});
const decodeTags = (tags: ReadonlyArray<RpcTag>) => tags.map(decodeTag);

export interface RpcTxData {
  readonly code?: IntegerString;
  readonly log?: string;
  readonly data?: Base64String;
  readonly tags?: ReadonlyArray<RpcTag>;
}
const decodeTxData = (data: RpcTxData): responses.TxData => ({
  data: may(Base64.decode, data.data),
  log: data.log,
  code: parseInteger(optional(data.code, "0" as IntegerString)),
  tags: may(decodeTags, data.tags),
});

export interface RpcTxProof {
  readonly Data: Base64String;
  readonly RootHash: HexString;
  readonly Total: IntegerString;
  readonly Index: IntegerString;
  readonly Proof: {
    readonly aunts: ReadonlyArray<Base64String>;
  };
}
const decodeTxProof = (data: RpcTxProof): responses.TxProof => ({
  data: Base64.decode(required(data.Data)),
  rootHash: Encoding.fromHex(required(data.RootHash)),
  total: parseInteger(required(data.Total)),
  index: parseInteger(required(data.Index)),
  proof: {
    aunts: required(data.Proof.aunts).map(Base64.decode),
  },
});

export interface RpcBlockMeta {
  readonly block_id: RpcBlockId;
  readonly header: RpcHeader;
}
const decodeBlockMeta = (data: RpcBlockMeta): responses.BlockMeta => ({
  blockId: decodeBlockId(data.block_id),
  header: decodeHeader(data.header),
});

export interface RpcBlockId {
  readonly hash: HexString;
  readonly parts: {
    readonly total: IntegerString;
    readonly hash: HexString;
  };
}
const decodeBlockId = (data: RpcBlockId): responses.BlockId => ({
  hash: Encoding.fromHex(required(data.hash)),
  parts: {
    total: parseInteger(required(data.parts.total)),
    hash: Encoding.fromHex(required(data.parts.hash)),
  },
});

export interface RpcBlock {
  readonly header: RpcHeader;
  readonly last_commit: RpcCommit;
  readonly data: {
    readonly txs?: ReadonlyArray<Base64String>;
  };
  readonly evidence?: {
    readonly evidence?: ReadonlyArray<RpcEvidence>;
  };
}
const decodeBlock = (data: RpcBlock): responses.Block => ({
  header: decodeHeader(required(data.header)),
  lastCommit: decodeCommit(required(data.last_commit)),
  txs: data.data.txs ? data.data.txs.map(Base64.decode) : [],
  evidence: data.evidence && may(decodeEvidences, data.evidence.evidence),
});

export interface RpcEvidence {
  readonly type: string;
  readonly validator: RpcValidatorUpdate;
  readonly height: IntegerString;
  readonly time: IntegerString;
  readonly totalVotingPower: IntegerString;
}
const decodeEvidence = (data: RpcEvidence): responses.Evidence => ({
  type: required(data.type),
  height: parseInteger(required(data.height)),
  time: parseInteger(required(data.time)),
  totalVotingPower: parseInteger(required(data.totalVotingPower)),
  validator: decodeValidatorUpdate(data.validator),
});
const decodeEvidences = (ev: ReadonlyArray<RpcEvidence>) => ev.map(decodeEvidence);

export interface RpcCommit {
  readonly block_id: RpcBlockId;
  readonly precommits: ReadonlyArray<RpcVote>;
}
const decodeCommit = (data: RpcCommit): responses.Commit => ({
  blockId: decodeBlockId(required(data.block_id)),
  precommits: required(data.precommits).map(decodeVote),
});

function ensureInt(n: number): number {
  if (typeof n !== "number") {
    throw(`${n} is not a number`);
  }
  return n;
}
export interface RpcVote {
  readonly type: number;
  readonly validator_address: HexString;
  readonly validator_index: IntegerString;
  readonly height: IntegerString;
  readonly round: IntegerString;
  readonly timestamp: DateTimeString;
  readonly block_id: RpcBlockId;
  readonly signature: RpcSignature;
}
const decodeVote = (data: RpcVote): responses.Vote => ({
  type: ensureInt(required(data.type)),
  validatorAddress: Encoding.fromHex(required(data.validator_address)),
  validatorIndex: parseInteger(required(data.validator_index)),
  height: parseInteger(required(data.height)),
  round: parseInteger(required(data.round)),
  timestamp: DateTime.decode(required(data.timestamp)),
  blockId: decodeBlockId(required(data.block_id)),
  signature: decodeSignature(required(data.signature)),
});

export interface RpcHeader {
  readonly chain_id: string; // ChainId
  readonly height: IntegerString;
  readonly time: DateTimeString;
  readonly num_txs: IntegerString;
  readonly last_block_id: RpcBlockId;
  readonly total_txs: IntegerString;

  // merkle roots for proofs
  readonly app_hash: HexString;
  readonly consensus_hash: HexString;
  readonly data_hash: HexString;
  readonly evidence_hash: HexString;
  readonly last_commit_hash: HexString;
  readonly last_results_hash: HexString;
  readonly validators_hash: HexString;
}
const decodeHeader = (data: RpcHeader): responses.Header => ({
  chainId: required(data.chain_id) as ChainId,
  height: parseInteger(required(data.height)),
  time: DateTime.decode(required(data.time)),
  numTxs: parseInteger(required(data.num_txs)),
  totalTxs: parseInteger(required(data.total_txs)),
  lastBlockId: decodeBlockId(data.last_block_id),

  appHash: Encoding.fromHex(required(data.app_hash)),
  consensusHash: Encoding.fromHex(required(data.consensus_hash)),
  dataHash: Encoding.fromHex(required(data.data_hash)),
  evidenceHash: Encoding.fromHex(required(data.evidence_hash)),
  lastCommitHash: Encoding.fromHex(required(data.last_commit_hash)),
  lastResultsHash: Encoding.fromHex(required(data.last_results_hash)),
  validatorsHash: Encoding.fromHex(required(data.validators_hash)),
});

export interface RpcNodeInfo {
  readonly id: HexString;
  readonly listen_addr: IpPortString;
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
const decodeNodeInfo = (data: RpcNodeInfo): responses.NodeInfo => ({
  id: Encoding.fromHex(required(data.id)),
  listenAddr: required(data.listen_addr),
  network: required(data.network) as ChainId,
  version: required(data.version),
  channels: required(data.channels),
  moniker: required(data.moniker),
  other: required(data.other),
});

export interface RpcSyncInfo {
  readonly latest_block_hash: HexString;
  readonly latest_app_hash: HexString;
  readonly latest_block_height: IntegerString;
  readonly latest_block_time: DateTimeString;
  readonly syncing: boolean;
}
const decodeSyncInfo = (data: RpcSyncInfo): responses.SyncInfo => ({
  latestBlockHash: Encoding.fromHex(required(data.latest_block_hash)),
  latestAppHash: Encoding.fromHex(required(data.latest_app_hash)),
  latestBlockTime: DateTime.decode(required(data.latest_block_time)),
  latestBlockHeight: parseInteger(required(data.latest_block_height)),
  syncing: required(data.syncing),
});

// this is in genesis
export interface RpcValidatorGenesis {
  readonly pub_key: RpcPubkey;
  readonly power: IntegerString;
  readonly name?: string;
}
const decodeValidatorGenesis = (data: RpcValidatorGenesis): responses.Validator => ({
  pubkey: decodePubkey(required(data.pub_key)),
  votingPower: parseInteger(required(data.power)),
  name: data.name,
});

// for evidence, block results, etc.
export interface RpcValidatorUpdate {
  readonly address: HexString;
  readonly pub_key: RpcPubkey;
  readonly power: number;
}
const decodeValidatorUpdate = (data: RpcValidatorUpdate): responses.Validator => ({
  pubkey: decodePubkey(required(data.pub_key)),
  votingPower: required(data.power),
  address: Hex.decode(required(data.address)),
});

// for validators
export interface RpcValidatorData extends RpcValidatorUpdate {
  readonly accum?: IntegerString;
}
const decodeValidatorData = (data: RpcValidatorData): responses.Validator => ({
  ...decodeValidatorUpdate(data),
  accum: may(parseInteger, data.accum),
});

// this is in status
export interface RpcValidatorInfo {
  readonly address: HexString;
  readonly pub_key: RpcAminoPubkey;
  readonly voting_power: IntegerString;
}
const decodeValidatorInfo = (data: RpcValidatorInfo): responses.Validator => ({
  pubkey: decodeAminoPubkey(required(data.pub_key)),
  votingPower: parseInteger(required(data.voting_power)),
  address: Encoding.fromHex(required(data.address)),
});

export interface RpcConsensusParams {
  readonly block_size_params: RpcBlockSizeParams;
  readonly tx_size_params: RpcTxSizeParams;
  readonly block_gossip_params: RpcBlockGossipParams;
  readonly evidence_params: RpcEvidenceParams;
}
const decodeConsensusParams = (data: RpcConsensusParams): responses.ConsensusParams => ({
  blockSizeParams: decodeBlockSizeParams(required(data.block_size_params)),
  txSizeParams: decodeTxSizeParams(required(data.tx_size_params)),
  blockGossipParams: decodeBlockGossipParams(required(data.block_gossip_params)),
  evidenceParams: decodeEvidenceParams(required(data.evidence_params)),
});

export interface RpcBlockSizeParams {
  readonly max_bytes: IntegerString;
  readonly max_txs: IntegerString;
  readonly max_gas: IntegerString;
}
const decodeBlockSizeParams = (data: RpcBlockSizeParams): responses.BlockSizeParams => ({
  maxBytes: parseInteger(required(data.max_bytes)),
  maxTxs: parseInteger(required(data.max_txs)),
  maxGas: parseInteger(required(data.max_gas)),
});

export interface RpcTxSizeParams {
  readonly max_bytes: IntegerString;
  readonly max_gas: IntegerString;
}
const decodeTxSizeParams = (data: RpcTxSizeParams): responses.TxSizeParams => ({
  maxBytes: parseInteger(required(data.max_bytes)),
  maxGas: parseInteger(required(data.max_gas)),
});

export interface RpcBlockGossipParams {
  readonly block_part_size_bytes: IntegerString;
}
const decodeBlockGossipParams = (data: RpcBlockGossipParams): responses.BlockGossipParams => ({
  blockPartSizeBytes: parseInteger(required(data.block_part_size_bytes)),
});

export interface RpcEvidenceParams {
  readonly max_age: IntegerString;
}
const decodeEvidenceParams = (data: RpcEvidenceParams): responses.EvidenceParams => ({
  maxAge: parseInteger(required(data.max_age)),
});

export interface RpcPubkey {
  readonly type: string;
  readonly value: HexString;
}
const decodePubkey = (data: RpcPubkey): PublicKeyBundle => {
  if (data.type === "ed25519") {
    // go-amino special code
    return {
      algo: Algorithm.Ed25519,
      data: Hex.decode(required(data.value)) as PublicKeyBytes,
    };
  }
  throw new Error(`unknown pubkey type: ${data.type}`);
};

// yes, a different format for status and dump consensus state
export interface RpcAminoPubkey {
  readonly type: string;
  readonly value: Base64String;
}
const decodeAminoPubkey = (data: RpcAminoPubkey): PublicKeyBundle => {
  if (data.type === "tendermint/PubKeyEd25519") {
    // go-amino special code
    return {
      algo: Algorithm.Ed25519,
      data: Base64.decode(required(data.value)) as PublicKeyBytes,
    };
  }
  throw new Error(`unknown pubkey type: ${data.type}`);
};

export interface RpcSignature {
  readonly type: string;
  readonly value: HexString;
}
const decodeSignature = (data: RpcSignature): responses.VoteSignatureBundle => {
  if (data.type === "6BF5903DA1DB28") {
    // go-amino special code
    return {
      algo: Algorithm.Ed25519,
      signature: Hex.decode(required(data.value)) as SignatureBytes,
    };
  }
  throw new Error(`unknown signature type: ${data.type}`);
};
