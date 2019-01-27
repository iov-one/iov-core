import { Encoding } from "@iov/encoding";

import {
  assertBoolean,
  assertSet,
  Base64,
  Base64String,
  DateTime,
  DateTimeString,
  dictionaryToStringMap,
  Hex,
  HexString,
  Integer,
  IntegerString,
  may,
  optional,
} from "../encodings";
import { JsonRpcEvent, JsonRpcSuccess } from "../jsonrpc";
import * as responses from "../responses";
import { IpPortString, TxBytes, TxHash, ValidatorPubkey, ValidatorSignature } from "../types";
import { hashTx } from "./hasher";

/*** adaptor ***/

export class Responses {
  public static decodeAbciInfo(response: JsonRpcSuccess): responses.AbciInfoResponse {
    return decodeAbciInfo(assertSet((response.result as AbciInfoResult).response));
  }

  public static decodeAbciQuery(response: JsonRpcSuccess): responses.AbciQueryResponse {
    return decodeAbciQuery(assertSet((response.result as AbciQueryResult).response));
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
    return decodeGenesis(assertSet((response.result as GenesisResult).genesis));
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

interface AbciInfoResult {
  readonly response: RpcAbciInfoResponse;
}

interface RpcAbciInfoResponse {
  readonly data?: string;
  readonly last_block_height?: IntegerString;
  readonly last_block_app_hash?: Base64String;
}

function decodeAbciInfo(data: RpcAbciInfoResponse): responses.AbciInfoResponse {
  return {
    data: data.data,
    lastBlockHeight: may(Integer.parse, data.last_block_height),
    lastBlockAppHash: may(Base64.decode, data.last_block_app_hash),
  };
}

interface AbciQueryResult {
  readonly response: RpcAbciQueryResponse;
}

interface RpcAbciQueryResponse {
  readonly key: Base64String;
  readonly value?: Base64String;
  readonly proof?: Base64String;
  readonly height?: IntegerString;
  readonly index?: IntegerString;
  readonly code?: IntegerString; // only for errors
  readonly log?: string;
}

function decodeAbciQuery(data: RpcAbciQueryResponse): responses.AbciQueryResponse {
  return {
    key: Base64.decode(optional(data.key, "" as Base64String)),
    value: Base64.decode(optional(data.value, "" as Base64String)),
    // proof: may(Base64.decode, data.proof),
    height: may(Integer.parse, data.height),
    code: may(Integer.parse, data.code),
    index: may(Integer.parse, data.index),
    log: data.log,
  };
}

interface RpcBlockResultsResponse {
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

function decodeBlockResults(data: RpcBlockResultsResponse): responses.BlockResultsResponse {
  const res = optional(data.results.DeliverTx, [] as ReadonlyArray<RpcTxData>);
  const end = data.results.EndBlock;
  const validators = optional(end.validator_updates, [] as ReadonlyArray<RpcValidatorUpdate>);
  return {
    height: Integer.parse(assertSet(data.height)),
    results: res.map(decodeTxData),
    endBlock: {
      validatorUpdates: validators.map(decodeValidatorUpdate),
      consensusUpdates: may(decodeConsensusParams, end.consensus_param_updates),
      tags: may(decodeTags, end.tags),
    },
  };
}

interface RpcBlockchainResponse {
  readonly last_height: IntegerString;
  readonly block_metas: ReadonlyArray<RpcBlockMeta>;
}

function decodeBlockchain(data: RpcBlockchainResponse): responses.BlockchainResponse {
  return {
    lastHeight: Integer.parse(assertSet(data.last_height)),
    blockMetas: assertSet(data.block_metas).map(decodeBlockMeta),
  };
}

interface RpcBroadcastTxSyncResponse extends RpcTxData {
  readonly hash: HexString;
}

function decodeBroadcastTxSync(data: RpcBroadcastTxSyncResponse): responses.BroadcastTxSyncResponse {
  return {
    ...decodeTxData(data),
    hash: Encoding.fromHex(assertSet(data.hash)) as TxHash,
  };
}

interface RpcBroadcastTxCommitResponse {
  readonly height?: IntegerString;
  readonly hash: HexString;
  readonly check_tx: RpcTxData;
  readonly deliver_tx?: RpcTxData;
}

function decodeBroadcastTxCommit(data: RpcBroadcastTxCommitResponse): responses.BroadcastTxCommitResponse {
  return {
    height: may(Integer.parse, data.height),
    hash: Encoding.fromHex(assertSet(data.hash)) as TxHash,
    checkTx: decodeTxData(assertSet(data.check_tx)),
    deliverTx: may(decodeTxData, data.deliver_tx),
  };
}

interface RpcCommitResponse {
  readonly signed_header: {
    readonly header: RpcHeader;
    readonly commit: RpcCommit;
  };
  readonly canonical: boolean;
}

function decodeCommitResponse(data: RpcCommitResponse): responses.CommitResponse {
  return {
    canonical: assertSet(data.canonical),
    header: decodeHeader(data.signed_header.header),
    commit: decodeCommit(data.signed_header.commit),
  };
}

interface RpcGenesisResponse {
  readonly genesis_time: DateTimeString;
  readonly chain_id: string; // ChainId;
  readonly consensus_params: RpcConsensusParams;
  readonly validators: ReadonlyArray<RpcValidatorGenesis>;
  readonly app_hash: HexString; // HexString, Base64String??
  readonly app_state: {};
}

interface GenesisResult {
  readonly genesis: RpcGenesisResponse;
}

function decodeGenesis(data: RpcGenesisResponse): responses.GenesisResponse {
  return {
    genesisTime: DateTime.decode(assertSet(data.genesis_time)),
    chainId: assertSet(data.chain_id),
    consensusParams: decodeConsensusParams(data.consensus_params),
    validators: assertSet(data.validators).map(decodeValidatorGenesis),
    appHash: Encoding.fromHex(assertSet(data.app_hash)), // empty string in kvstore app
    appState: data.app_state,
  };
}

interface RpcStatusResponse {
  readonly node_info: RpcNodeInfo;
  readonly sync_info: RpcSyncInfo;
  readonly validator_info: RpcValidatorInfo;
}

function decodeStatus(data: RpcStatusResponse): responses.StatusResponse {
  return {
    nodeInfo: decodeNodeInfo(data.node_info),
    syncInfo: decodeSyncInfo(data.sync_info),
    validatorInfo: decodeValidatorInfo(data.validator_info),
  };
}

interface RpcTxResponse {
  readonly tx: Base64String;
  readonly tx_result: RpcTxData;
  readonly height: IntegerString;
  readonly index: number;
  readonly hash: HexString;
  readonly proof?: RpcTxProof;
}

function decodeTxResponse(data: RpcTxResponse): responses.TxResponse {
  return {
    tx: Base64.decode(assertSet(data.tx)) as TxBytes,
    result: decodeTxData(assertSet(data.tx_result)),
    height: Integer.parse(assertSet(data.height)),
    index: Integer.ensure(assertSet(data.index)),
    hash: Encoding.fromHex(assertSet(data.hash)) as TxHash,
    proof: may(decodeTxProof, data.proof),
  };
}

interface RpcTxSearchResponse {
  readonly txs: ReadonlyArray<RpcTxResponse>;
  readonly total_count: IntegerString;
}

function decodeTxSearch(data: RpcTxSearchResponse): responses.TxSearchResponse {
  return {
    totalCount: Integer.parse(assertSet(data.total_count)),
    txs: assertSet(data.txs).map(decodeTxResponse),
  };
}

interface RpcTxEvent {
  readonly tx: Base64String;
  readonly result: RpcTxData;
  readonly height: IntegerString;
  readonly index: number;
}

function decodeTxEvent(data: RpcTxEvent): responses.TxEvent {
  const tx = Base64.decode(assertSet(data.tx)) as TxBytes;
  return {
    tx: tx,
    hash: hashTx(tx),
    result: decodeTxData(data.result),
    height: Integer.parse(assertSet(data.height)),
    index: Integer.ensure(assertSet(data.index)),
  };
}

interface RpcValidatorsResponse {
  readonly block_height: IntegerString;
  readonly validators: ReadonlyArray<RpcValidatorData>;
}

function decodeValidators(data: RpcValidatorsResponse): responses.ValidatorsResponse {
  return {
    blockHeight: Integer.parse(assertSet(data.block_height)),
    results: assertSet(data.validators).map(decodeValidatorData),
  };
}

/**** Helper items used above ******/

interface RpcTag {
  readonly key: Base64String;
  readonly value: Base64String;
}

function decodeTag(data: RpcTag): responses.Tag {
  return {
    key: Base64.decode(assertSet(data.key)),
    value: Base64.decode(assertSet(data.value)),
  };
}

function decodeTags(tags: ReadonlyArray<RpcTag>): ReadonlyArray<responses.Tag> {
  return tags.map(decodeTag);
}

interface RpcTxData {
  readonly code?: number;
  readonly log?: string;
  readonly data?: Base64String;
  readonly tags?: ReadonlyArray<RpcTag>;
}

function decodeTxData(data: RpcTxData): responses.TxData {
  return {
    data: may(Base64.decode, data.data),
    log: data.log,
    code: Integer.ensure(optional<number>(data.code, 0)),
    tags: may(decodeTags, data.tags),
  };
}

/**
 * Example data:
 * {
 *   "RootHash": "10A1A17D5F818099B5CAB5B91733A3CC27C0DB6CE2D571AC27FB970C314308BB",
 *   "Data": "ZVlERVhDV2lVNEUwPXhTUjc4Tmp2QkNVSg==",
 *   "Proof": {
 *     "total": "1",
 *     "index": "0",
 *     "leaf_hash": "EKGhfV+BgJm1yrW5FzOjzCfA22zi1XGsJ/uXDDFDCLs=",
 *     "aunts": []
 *   }
 * }
 */
interface RpcTxProof {
  readonly Data: Base64String;
  readonly RootHash: HexString;
  readonly Proof: {
    readonly total: IntegerString;
    readonly index: IntegerString;
    readonly leaf_hash: Base64String;
    readonly aunts: ReadonlyArray<Base64String>;
  };
}

function decodeTxProof(data: RpcTxProof): responses.TxProof {
  return {
    data: Base64.decode(assertSet(data.Data)),
    rootHash: Encoding.fromHex(assertSet(data.RootHash)),
    proof: {
      total: Integer.parse(assertSet(data.Proof.total)),
      index: Integer.parse(assertSet(data.Proof.index)),
      // Field ignored as not present in general responses.TxProof
      // leaf_hash: Base64.decode(required(data.Proof.leaf_hash)),
      aunts: assertSet(data.Proof.aunts).map(Base64.decode),
    },
  };
}

interface RpcBlockId {
  readonly hash: HexString;
  readonly parts: {
    readonly total: IntegerString;
    readonly hash: HexString;
  };
}

function decodeBlockId(data: RpcBlockId): responses.BlockId {
  return {
    hash: Encoding.fromHex(assertSet(data.hash)),
    parts: {
      total: Integer.parse(assertSet(data.parts.total)),
      hash: Encoding.fromHex(assertSet(data.parts.hash)),
    },
  };
}

interface RpcHeader {
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

function decodeHeader(data: RpcHeader): responses.Header {
  return {
    chainId: assertSet(data.chain_id),
    height: Integer.parse(assertSet(data.height)),
    time: DateTime.decode(assertSet(data.time)),
    numTxs: Integer.parse(assertSet(data.num_txs)),
    totalTxs: Integer.parse(assertSet(data.total_txs)),
    lastBlockId: decodeBlockId(data.last_block_id),

    appHash: Encoding.fromHex(assertSet(data.app_hash)),
    consensusHash: Encoding.fromHex(assertSet(data.consensus_hash)),
    dataHash: Encoding.fromHex(assertSet(data.data_hash)),
    evidenceHash: Encoding.fromHex(assertSet(data.evidence_hash)),
    lastCommitHash: Encoding.fromHex(assertSet(data.last_commit_hash)),
    lastResultsHash: Encoding.fromHex(assertSet(data.last_results_hash)),
    validatorsHash: Encoding.fromHex(assertSet(data.validators_hash)),
  };
}

interface RpcBlockMeta {
  readonly block_id: RpcBlockId;
  readonly header: RpcHeader;
}

function decodeBlockMeta(data: RpcBlockMeta): responses.BlockMeta {
  return {
    blockId: decodeBlockId(data.block_id),
    header: decodeHeader(data.header),
  };
}

interface RpcCommit {
  readonly block_id: RpcBlockId;
  readonly precommits: ReadonlyArray<RpcVote>;
}

function decodeCommit(data: RpcCommit): responses.Commit {
  return {
    blockId: decodeBlockId(assertSet(data.block_id)),
    precommits: assertSet(data.precommits).map(decodeVote),
  };
}

interface RpcBlock {
  readonly header: RpcHeader;
  readonly last_commit: RpcCommit;
  readonly data: {
    readonly txs?: ReadonlyArray<Base64String>;
  };
  readonly evidence?: {
    readonly evidence?: ReadonlyArray<RpcEvidence>;
  };
}

function decodeBlock(data: RpcBlock): responses.Block {
  return {
    header: decodeHeader(assertSet(data.header)),
    lastCommit: decodeCommit(assertSet(data.last_commit)),
    txs: data.data.txs ? data.data.txs.map(Base64.decode) : [],
    evidence: data.evidence && may(decodeEvidences, data.evidence.evidence),
  };
}

interface RpcBlockResponse {
  readonly block_meta: RpcBlockMeta;
  readonly block: RpcBlock;
}

function decodeBlockResponse(data: RpcBlockResponse): responses.BlockResponse {
  return {
    blockMeta: decodeBlockMeta(data.block_meta),
    block: decodeBlock(data.block),
  };
}

interface RpcEvidence {
  readonly type: string;
  readonly validator: RpcValidatorUpdate;
  readonly height: IntegerString;
  readonly time: IntegerString;
  readonly totalVotingPower: IntegerString;
}

function decodeEvidence(data: RpcEvidence): responses.Evidence {
  return {
    type: assertSet(data.type),
    height: Integer.parse(assertSet(data.height)),
    time: Integer.parse(assertSet(data.time)),
    totalVotingPower: Integer.parse(assertSet(data.totalVotingPower)),
    validator: decodeValidatorUpdate(data.validator),
  };
}

function decodeEvidences(ev: ReadonlyArray<RpcEvidence>): ReadonlyArray<responses.Evidence> {
  return ev.map(decodeEvidence);
}

interface RpcVote {
  readonly type: number;
  readonly validator_address: HexString;
  readonly validator_index: IntegerString;
  readonly height: IntegerString;
  readonly round: IntegerString;
  readonly timestamp: DateTimeString;
  readonly block_id: RpcBlockId;
  readonly signature: RpcSignature;
}

function decodeVote(data: RpcVote): responses.Vote {
  return {
    type: Integer.ensure(assertSet(data.type)),
    validatorAddress: Encoding.fromHex(assertSet(data.validator_address)),
    validatorIndex: Integer.parse(assertSet(data.validator_index)),
    height: Integer.parse(assertSet(data.height)),
    round: Integer.parse(assertSet(data.round)),
    timestamp: DateTime.decode(assertSet(data.timestamp)),
    blockId: decodeBlockId(assertSet(data.block_id)),
    signature: decodeSignature(assertSet(data.signature)),
  };
}

interface RpcNodeInfo {
  readonly id: HexString;
  readonly listen_addr: IpPortString;
  readonly network: string;
  readonly version: string;
  readonly channels: string; // ???
  readonly moniker: string;
  readonly protocol_version: {
    readonly p2p: IntegerString;
    readonly block: IntegerString;
    readonly app: IntegerString;
  };
  /**
   * Additional information. E.g.
   * {
   *   "tx_index": "on",
   *   "rpc_address":"tcp://0.0.0.0:26657"
   * }
   */
  readonly other: object;
}

function decodeNodeInfo(data: RpcNodeInfo): responses.NodeInfo {
  return {
    id: Encoding.fromHex(assertSet(data.id)),
    listenAddr: assertSet(data.listen_addr),
    network: assertSet(data.network),
    version: assertSet(data.version),
    channels: assertSet(data.channels),
    moniker: assertSet(data.moniker),
    other: dictionaryToStringMap(data.other),
  };
}

interface RpcSyncInfo {
  readonly latest_block_hash: HexString;
  readonly latest_app_hash: HexString;
  readonly latest_block_height: IntegerString;
  readonly latest_block_time: DateTimeString;
  readonly catching_up: boolean;
}

function decodeSyncInfo(data: RpcSyncInfo): responses.SyncInfo {
  return {
    latestBlockHash: Encoding.fromHex(assertSet(data.latest_block_hash)),
    latestAppHash: Encoding.fromHex(assertSet(data.latest_app_hash)),
    latestBlockTime: DateTime.decode(assertSet(data.latest_block_time)),
    latestBlockHeight: Integer.parse(assertSet(data.latest_block_height)),
    catchingUp: assertBoolean(data.catching_up),
  };
}

interface RpcValidatorGenesis {
  readonly pub_key: RpcPubkey;
  readonly power: IntegerString;
  readonly name?: string;
}

function decodeValidatorGenesis(data: RpcValidatorGenesis): responses.Validator {
  return {
    pubkey: decodePubkey(assertSet(data.pub_key)),
    votingPower: Integer.parse(assertSet(data.power)),
    name: data.name,
  };
}

// for evidence, block results, etc.
interface RpcValidatorUpdate {
  readonly address: HexString;
  readonly pub_key: RpcPubkey;
  readonly voting_power: IntegerString;
}

function decodeValidatorUpdate(data: RpcValidatorUpdate): responses.Validator {
  return {
    pubkey: decodePubkey(assertSet(data.pub_key)),
    votingPower: Integer.parse(assertSet(data.voting_power)),
    address: Hex.decode(assertSet(data.address)),
  };
}

// for validators
interface RpcValidatorData extends RpcValidatorUpdate {
  readonly accum?: IntegerString;
}

function decodeValidatorData(data: RpcValidatorData): responses.Validator {
  return {
    ...decodeValidatorUpdate(data),
    accum: may(Integer.parse, data.accum),
  };
}

// this is in status
interface RpcValidatorInfo {
  readonly address: HexString;
  readonly pub_key: RpcPubkey;
  readonly voting_power: IntegerString;
}

function decodeValidatorInfo(data: RpcValidatorInfo): responses.Validator {
  return {
    pubkey: decodePubkey(assertSet(data.pub_key)),
    votingPower: Integer.parse(assertSet(data.voting_power)),
    address: Encoding.fromHex(assertSet(data.address)),
  };
}

/**
 * Example data:
 * {
 *   "block_size": {
 *     "max_bytes": "22020096",
 *     "max_gas": "-1"
 *   },
 *   "evidence": {
 *     "max_age": "100000"
 *   },
 *   "validator": {
 *     "pub_key_types": [
 *       "ed25519"
 *     ]
 *   }
 * }
 */
interface RpcConsensusParams {
  readonly block_size: RpcBlockSizeParams;
  readonly evidence: RpcEvidenceParams;
}

function decodeConsensusParams(data: RpcConsensusParams): responses.ConsensusParams {
  return {
    blockSize: decodeBlockSizeParams(assertSet(data.block_size)),
    evidence: decodeEvidenceParams(assertSet(data.evidence)),
  };
}

interface RpcBlockSizeParams {
  readonly max_bytes: IntegerString;
  readonly max_gas: IntegerString;
}

function decodeBlockSizeParams(data: RpcBlockSizeParams): responses.BlockSizeParams {
  return {
    maxBytes: Integer.parse(assertSet(data.max_bytes)),
    maxGas: Integer.parse(assertSet(data.max_gas)),
  };
}

interface RpcEvidenceParams {
  readonly max_age: IntegerString;
}

function decodeEvidenceParams(data: RpcEvidenceParams): responses.EvidenceParams {
  return {
    maxAge: Integer.parse(assertSet(data.max_age)),
  };
}

// yes, a different format for status and dump consensus state
interface RpcPubkey {
  readonly type: string;
  readonly value: Base64String;
}

function decodePubkey(data: RpcPubkey): ValidatorPubkey {
  if (data.type === "tendermint/PubKeyEd25519") {
    // go-amino special code
    return {
      algorithm: "ed25519",
      data: Base64.decode(assertSet(data.value)),
    };
  }
  throw new Error(`unknown pubkey type: ${data.type}`);
}

type RpcSignature = Base64String;

function decodeSignature(data: RpcSignature): ValidatorSignature {
  return {
    algorithm: "ed25519",
    data: Base64.decode(assertSet(data)),
  };
}
