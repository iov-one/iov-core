import { fromHex } from "@iov/encoding";
import { JsonRpcSuccessResponse } from "@iov/jsonrpc";

import {
  assertArray,
  assertBoolean,
  assertNotEmpty,
  assertNumber,
  assertObject,
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
import * as responses from "../responses";
import { SubscriptionEvent } from "../rpcclients";
import { IpPortString, TxBytes, TxHash, ValidatorPubkey, ValidatorSignature } from "../types";
import { hashTx } from "./hasher";

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

interface RpcTag {
  readonly key: Base64String;
  readonly value: Base64String;
}

function decodeTag(tag: RpcTag): responses.Tag {
  return {
    key: Base64.decode(assertNotEmpty(tag.key)),
    value: Base64.decode(assertNotEmpty(tag.value)),
  };
}

function decodeTags(tags: readonly RpcTag[]): readonly responses.Tag[] {
  return assertArray(tags).map(decodeTag);
}

interface RpcEvent {
  readonly type: string;
  readonly attributes: readonly RpcTag[];
}

function decodeEvent(event: RpcEvent): responses.Event {
  return {
    type: event.type,
    attributes: decodeTags(event.attributes),
  };
}

function decodeEvents(events: readonly RpcEvent[]): readonly responses.Event[] {
  return assertArray(events).map(decodeEvent);
}

interface RpcTxData {
  readonly code?: number;
  readonly log?: string;
  readonly data?: Base64String;
  readonly events?: readonly RpcEvent[];
}

function decodeTxData(data: RpcTxData): responses.TxData {
  return {
    data: may(Base64.decode, data.data),
    log: data.log,
    code: Integer.parse(assertNumber(optional<number>(data.code, 0))),
    events: may(decodeEvents, data.events),
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
      data: Base64.decode(assertNotEmpty(data.value)),
    };
  }
  throw new Error(`unknown pubkey type: ${data.type}`);
}

// for evidence, block results, etc.
interface RpcValidatorUpdate {
  readonly address: HexString;
  readonly pub_key: RpcPubkey;
  readonly voting_power: IntegerString;
}

function decodeValidatorUpdate(data: RpcValidatorUpdate): responses.Validator {
  return {
    pubkey: decodePubkey(assertObject(data.pub_key)),
    votingPower: Integer.parse(assertNotEmpty(data.voting_power)),
    address: Hex.decode(assertNotEmpty(data.address)),
  };
}

interface RpcBlockParams {
  readonly max_bytes: IntegerString;
  readonly max_gas: IntegerString;
}

/**
 * Note: we do not parse block.time_iota_ms for now because of this CHANGELOG entry
 *
 * > Add time_iota_ms to block's consensus parameters (not exposed to the application)
 * https://github.com/tendermint/tendermint/blob/master/CHANGELOG.md#v0310
 */
function decodeBlockParams(data: RpcBlockParams): responses.BlockParams {
  return {
    maxBytes: Integer.parse(assertNotEmpty(data.max_bytes)),
    maxGas: Integer.parse(assertNotEmpty(data.max_gas)),
  };
}

interface RpcEvidenceParams {
  readonly max_age: IntegerString;
}

function decodeEvidenceParams(data: RpcEvidenceParams): responses.EvidenceParams {
  return {
    maxAge: Integer.parse(assertNotEmpty(data.max_age)),
  };
}

/**
 * Example data:
 * {
 *   "block": {
 *     "max_bytes": "22020096",
 *     "max_gas": "-1",
 *     "time_iota_ms": "1000"
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
  readonly block: RpcBlockParams;
  readonly evidence: RpcEvidenceParams;
}

function decodeConsensusParams(data: RpcConsensusParams): responses.ConsensusParams {
  return {
    block: decodeBlockParams(assertObject(data.block)),
    evidence: decodeEvidenceParams(assertObject(data.evidence)),
  };
}

interface RpcBlockResultsResponse {
  readonly height: IntegerString;
  readonly results: {
    readonly deliver_tx: readonly RpcTxData[];
    readonly end_block: {
      readonly validator_updates?: readonly RpcValidatorUpdate[];
      readonly consensus_param_updates?: RpcConsensusParams;
      readonly tags?: readonly RpcTag[];
    };
  };
}

function decodeBlockResults(data: RpcBlockResultsResponse): responses.BlockResultsResponse {
  const res = optional(data.results.deliver_tx, [] as readonly RpcTxData[]);
  const end = data.results.end_block;
  const validators = optional(end.validator_updates, [] as readonly RpcValidatorUpdate[]);
  return {
    height: Integer.parse(assertNotEmpty(data.height)),
    results: assertArray(res).map(decodeTxData),
    endBlock: {
      validatorUpdates: assertArray(validators).map(decodeValidatorUpdate),
      consensusUpdates: may(decodeConsensusParams, end.consensus_param_updates),
      tags: may(decodeTags, end.tags),
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
    hash: fromHex(assertNotEmpty(data.hash)),
    parts: {
      total: Integer.parse(assertNotEmpty(data.parts.total)),
      hash: fromHex(assertNotEmpty(data.parts.hash)),
    },
  };
}

interface RpcBlockVersion {
  readonly block: IntegerString;
  readonly app: IntegerString;
}

function decodeBlockVersion(data: RpcBlockVersion): responses.Version {
  return {
    block: Integer.parse(data.block),
    app: Integer.parse(data.app),
  };
}

interface RpcHeader {
  readonly version: RpcBlockVersion;
  readonly chain_id: string;
  readonly height: IntegerString;
  readonly time: DateTimeString;
  readonly num_txs: IntegerString;
  readonly total_txs: IntegerString;

  readonly last_block_id: RpcBlockId;

  readonly last_commit_hash: HexString;
  readonly data_hash: HexString;

  readonly validators_hash: HexString;
  readonly next_validators_hash: HexString;
  readonly consensus_hash: HexString;
  readonly app_hash: HexString;
  readonly last_results_hash: HexString;

  readonly evidence_hash: HexString;
  readonly proposer_address: HexString;
}

function decodeHeader(data: RpcHeader): responses.Header {
  return {
    version: decodeBlockVersion(data.version),
    chainId: assertNotEmpty(data.chain_id),
    height: Integer.parse(assertNotEmpty(data.height)),
    time: DateTime.decode(assertNotEmpty(data.time)),
    numTxs: Integer.parse(assertNotEmpty(data.num_txs)),
    totalTxs: Integer.parse(assertNotEmpty(data.total_txs)),

    lastBlockId: decodeBlockId(data.last_block_id),

    lastCommitHash: fromHex(assertNotEmpty(data.last_commit_hash)),
    dataHash: fromHex(assertSet(data.data_hash)),

    validatorsHash: fromHex(assertNotEmpty(data.validators_hash)),
    nextValidatorsHash: fromHex(assertNotEmpty(data.next_validators_hash)),
    consensusHash: fromHex(assertNotEmpty(data.consensus_hash)),
    appHash: fromHex(assertNotEmpty(data.app_hash)),
    lastResultsHash: fromHex(assertSet(data.last_results_hash)),

    evidenceHash: fromHex(assertSet(data.evidence_hash)),
    proposerAddress: fromHex(assertNotEmpty(data.proposer_address)),
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

interface RpcBlockchainResponse {
  readonly last_height: IntegerString;
  readonly block_metas: readonly RpcBlockMeta[];
}

function decodeBlockchain(data: RpcBlockchainResponse): responses.BlockchainResponse {
  return {
    lastHeight: Integer.parse(assertNotEmpty(data.last_height)),
    blockMetas: assertArray(data.block_metas).map(decodeBlockMeta),
  };
}

interface RpcBroadcastTxSyncResponse extends RpcTxData {
  readonly hash: HexString;
}

function decodeBroadcastTxSync(data: RpcBroadcastTxSyncResponse): responses.BroadcastTxSyncResponse {
  return {
    ...decodeTxData(data),
    hash: fromHex(assertNotEmpty(data.hash)) as TxHash,
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
    hash: fromHex(assertNotEmpty(data.hash)) as TxHash,
    checkTx: decodeTxData(assertObject(data.check_tx)),
    deliverTx: may(decodeTxData, data.deliver_tx),
  };
}

type RpcSignature = Base64String;

function decodeSignature(data: RpcSignature): ValidatorSignature {
  return {
    algorithm: "ed25519",
    data: Base64.decode(assertNotEmpty(data)),
  };
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
    type: Integer.parse(assertNumber(data.type)),
    validatorAddress: fromHex(assertNotEmpty(data.validator_address)),
    validatorIndex: Integer.parse(assertNotEmpty(data.validator_index)),
    height: Integer.parse(assertNotEmpty(data.height)),
    round: Integer.parse(assertNotEmpty(data.round)),
    timestamp: DateTime.decode(assertNotEmpty(data.timestamp)),
    blockId: decodeBlockId(assertObject(data.block_id)),
    signature: decodeSignature(assertNotEmpty(data.signature)),
  };
}

interface RpcCommit {
  readonly block_id: RpcBlockId;
  readonly precommits: readonly RpcVote[];
}

function decodeCommit(data: RpcCommit): responses.Commit {
  return {
    blockId: decodeBlockId(assertObject(data.block_id)),
    precommits: assertArray(data.precommits).map(decodeVote),
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
    canonical: assertBoolean(data.canonical),
    header: decodeHeader(data.signed_header.header),
    commit: decodeCommit(data.signed_header.commit),
  };
}

interface RpcValidatorGenesis {
  readonly pub_key: RpcPubkey;
  readonly power: IntegerString;
  readonly name?: string;
}

function decodeValidatorGenesis(data: RpcValidatorGenesis): responses.Validator {
  return {
    pubkey: decodePubkey(assertObject(data.pub_key)),
    votingPower: Integer.parse(assertNotEmpty(data.power)),
    name: data.name,
  };
}

interface RpcGenesisResponse {
  readonly genesis_time: DateTimeString;
  readonly chain_id: string;
  readonly consensus_params: RpcConsensusParams;
  readonly validators: readonly RpcValidatorGenesis[];
  readonly app_hash: HexString;
  readonly app_state: {} | undefined;
}

interface GenesisResult {
  readonly genesis: RpcGenesisResponse;
}

function decodeGenesis(data: RpcGenesisResponse): responses.GenesisResponse {
  return {
    genesisTime: DateTime.decode(assertNotEmpty(data.genesis_time)),
    chainId: assertNotEmpty(data.chain_id),
    consensusParams: decodeConsensusParams(data.consensus_params),
    validators: assertArray(data.validators).map(decodeValidatorGenesis),
    appHash: fromHex(assertSet(data.app_hash)), // empty string in kvstore app
    appState: data.app_state,
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
    pubkey: decodePubkey(assertObject(data.pub_key)),
    votingPower: Integer.parse(assertNotEmpty(data.voting_power)),
    address: fromHex(assertNotEmpty(data.address)),
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
    id: fromHex(assertNotEmpty(data.id)),
    listenAddr: assertNotEmpty(data.listen_addr),
    network: assertNotEmpty(data.network),
    version: assertNotEmpty(data.version),
    channels: assertNotEmpty(data.channels),
    moniker: assertNotEmpty(data.moniker),
    other: dictionaryToStringMap(data.other),
    protocolVersion: {
      app: Integer.parse(assertNotEmpty(data.protocol_version.app)),
      block: Integer.parse(assertNotEmpty(data.protocol_version.block)),
      p2p: Integer.parse(assertNotEmpty(data.protocol_version.p2p)),
    },
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
    latestBlockHash: fromHex(assertNotEmpty(data.latest_block_hash)),
    latestAppHash: fromHex(assertNotEmpty(data.latest_app_hash)),
    latestBlockTime: DateTime.decode(assertNotEmpty(data.latest_block_time)),
    latestBlockHeight: Integer.parse(assertNotEmpty(data.latest_block_height)),
    catchingUp: assertBoolean(data.catching_up),
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
    readonly aunts: readonly Base64String[];
  };
}

function decodeTxProof(data: RpcTxProof): responses.TxProof {
  return {
    data: Base64.decode(assertNotEmpty(data.Data)),
    rootHash: fromHex(assertNotEmpty(data.RootHash)),
    proof: {
      total: Integer.parse(assertNotEmpty(data.Proof.total)),
      index: Integer.parse(assertNotEmpty(data.Proof.index)),
      leafHash: Base64.decode(assertNotEmpty(data.Proof.leaf_hash)),
      aunts: assertArray(data.Proof.aunts).map(Base64.decode),
    },
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
    tx: Base64.decode(assertNotEmpty(data.tx)) as TxBytes,
    result: decodeTxData(assertObject(data.tx_result)),
    height: Integer.parse(assertNotEmpty(data.height)),
    index: Integer.parse(assertNumber(data.index)),
    hash: fromHex(assertNotEmpty(data.hash)) as TxHash,
    proof: may(decodeTxProof, data.proof),
  };
}

interface RpcTxSearchResponse {
  readonly txs: readonly RpcTxResponse[];
  readonly total_count: IntegerString;
}

function decodeTxSearch(data: RpcTxSearchResponse): responses.TxSearchResponse {
  return {
    totalCount: Integer.parse(assertNotEmpty(data.total_count)),
    txs: assertArray(data.txs).map(decodeTxResponse),
  };
}

interface RpcTxEvent {
  readonly tx: Base64String;
  readonly result: RpcTxData;
  readonly height: IntegerString;
  readonly index: number;
}

function decodeTxEvent(data: RpcTxEvent): responses.TxEvent {
  const tx = Base64.decode(assertNotEmpty(data.tx)) as TxBytes;
  return {
    tx: tx,
    hash: hashTx(tx),
    result: decodeTxData(data.result),
    height: Integer.parse(assertNotEmpty(data.height)),
    index: Integer.parse(assertNumber(data.index)),
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

interface RpcValidatorsResponse {
  readonly block_height: IntegerString;
  readonly validators: readonly RpcValidatorData[];
}

function decodeValidators(data: RpcValidatorsResponse): responses.ValidatorsResponse {
  return {
    blockHeight: Integer.parse(assertNotEmpty(data.block_height)),
    results: assertArray(data.validators).map(decodeValidatorData),
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
    type: assertNotEmpty(data.type),
    height: Integer.parse(assertNotEmpty(data.height)),
    time: Integer.parse(assertNotEmpty(data.time)),
    totalVotingPower: Integer.parse(assertNotEmpty(data.totalVotingPower)),
    validator: decodeValidatorUpdate(data.validator),
  };
}

function decodeEvidences(ev: readonly RpcEvidence[]): readonly responses.Evidence[] {
  return assertArray(ev).map(decodeEvidence);
}

interface RpcBlock {
  readonly header: RpcHeader;
  readonly last_commit: RpcCommit;
  readonly data: {
    readonly txs?: readonly Base64String[];
  };
  readonly evidence?: {
    readonly evidence?: readonly RpcEvidence[];
  };
}

function decodeBlock(data: RpcBlock): responses.Block {
  return {
    header: decodeHeader(assertObject(data.header)),
    lastCommit: decodeCommit(assertObject(data.last_commit)),
    txs: data.data.txs ? assertArray(data.data.txs).map(Base64.decode) : [],
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

export class Responses {
  public static decodeAbciInfo(response: JsonRpcSuccessResponse): responses.AbciInfoResponse {
    return decodeAbciInfo(assertObject((response.result as AbciInfoResult).response));
  }

  public static decodeAbciQuery(response: JsonRpcSuccessResponse): responses.AbciQueryResponse {
    return decodeAbciQuery(assertObject((response.result as AbciQueryResult).response));
  }

  public static decodeBlock(response: JsonRpcSuccessResponse): responses.BlockResponse {
    return decodeBlockResponse(response.result as RpcBlockResponse);
  }

  public static decodeBlockResults(response: JsonRpcSuccessResponse): responses.BlockResultsResponse {
    return decodeBlockResults(response.result as RpcBlockResultsResponse);
  }

  public static decodeBlockchain(response: JsonRpcSuccessResponse): responses.BlockchainResponse {
    return decodeBlockchain(response.result as RpcBlockchainResponse);
  }

  public static decodeBroadcastTxSync(response: JsonRpcSuccessResponse): responses.BroadcastTxSyncResponse {
    return decodeBroadcastTxSync(response.result as RpcBroadcastTxSyncResponse);
  }

  public static decodeBroadcastTxAsync(response: JsonRpcSuccessResponse): responses.BroadcastTxAsyncResponse {
    return this.decodeBroadcastTxSync(response);
  }

  public static decodeBroadcastTxCommit(
    response: JsonRpcSuccessResponse,
  ): responses.BroadcastTxCommitResponse {
    return decodeBroadcastTxCommit(response.result as RpcBroadcastTxCommitResponse);
  }

  public static decodeCommit(response: JsonRpcSuccessResponse): responses.CommitResponse {
    return decodeCommitResponse(response.result as RpcCommitResponse);
  }

  public static decodeGenesis(response: JsonRpcSuccessResponse): responses.GenesisResponse {
    return decodeGenesis(assertObject((response.result as GenesisResult).genesis));
  }

  public static decodeHealth(): responses.HealthResponse {
    return null;
  }

  public static decodeStatus(response: JsonRpcSuccessResponse): responses.StatusResponse {
    return decodeStatus(response.result as RpcStatusResponse);
  }

  public static decodeNewBlockEvent(event: SubscriptionEvent): responses.NewBlockEvent {
    return decodeBlock(event.data.value.block as RpcBlock);
  }

  public static decodeNewBlockHeaderEvent(event: SubscriptionEvent): responses.NewBlockHeaderEvent {
    return decodeHeader(event.data.value.header as RpcHeader);
  }

  public static decodeTxEvent(event: SubscriptionEvent): responses.TxEvent {
    return decodeTxEvent(event.data.value.TxResult as RpcTxEvent);
  }

  public static decodeTx(response: JsonRpcSuccessResponse): responses.TxResponse {
    return decodeTxResponse(response.result as RpcTxResponse);
  }

  public static decodeTxSearch(response: JsonRpcSuccessResponse): responses.TxSearchResponse {
    return decodeTxSearch(response.result as RpcTxSearchResponse);
  }

  public static decodeValidators(response: JsonRpcSuccessResponse): responses.ValidatorsResponse {
    return decodeValidators(response.result as RpcValidatorsResponse);
  }
}
