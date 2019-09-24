import { Address, ChainId, Hash, SwapId } from "@iov/bcp";
import { Sha256 } from "@iov/crypto";
import { Encoding, Uint64 } from "@iov/encoding";
import { As } from "type-tagger";

import { addressPrefix, encodeBnsAddress } from "./util";

/** A package-internal type representing a Weave Condition */
export type Condition = Uint8Array & As<"Condition">;

function buildCondition(extension: string, type: string, idBytes: Iterable<number>): Condition {
  // https://github.com/iov-one/weave/blob/v0.21.0/conditions.go#L35-L38
  const out = Uint8Array.from([...Encoding.toAscii(`${extension}/${type}/`), ...idBytes]);
  return out as Condition;
}

function buildSwapCondition(swap: { readonly id: SwapId; readonly hash: Hash }): Condition {
  // https://github.com/iov-one/weave/blob/v0.15.0/x/aswap/handler.go#L287
  const weaveSwapId = new Uint8Array([...swap.id.data, "|".charCodeAt(0), ...swap.hash]);
  return buildCondition("aswap", "pre_hash", weaveSwapId);
}

export function buildMultisignatureCondition(id: number): Condition {
  return buildCondition("multisig", "usage", Uint64.fromNumber(id).toBytesBigEndian());
}

export function buildEscrowCondition(id: number): Condition {
  // https://github.com/iov-one/weave/blob/v0.21.0/x/escrow/model.go#L83-L87
  return buildCondition("escrow", "seq", Uint64.fromNumber(id).toBytesBigEndian());
}

function buildElectionRuleCondition(id: number): Condition {
  return buildCondition("gov", "rule", Uint64.fromNumber(id).toBytesBigEndian());
}

export function conditionToWeaveAddress(cond: Condition): Uint8Array {
  return new Sha256(cond).digest().slice(0, 20);
}

export function conditionToAddress(chainId: ChainId, cond: Condition): Address {
  const prefix = addressPrefix(chainId);
  const bytes = conditionToWeaveAddress(cond);
  return encodeBnsAddress(prefix, bytes);
}

export function swapToAddress(chainId: ChainId, swap: { readonly id: SwapId; readonly hash: Hash }): Address {
  return conditionToAddress(chainId, buildSwapCondition(swap));
}

export function multisignatureIdToAddress(chainId: ChainId, multisignatureId: number): Address {
  return conditionToAddress(chainId, buildMultisignatureCondition(multisignatureId));
}

export function escrowIdToAddress(chainId: ChainId, escrowId: Uint8Array): Address {
  // TODO: remove this intermediate step in https://github.com/iov-one/iov-core/issues/1231
  const numericId = Uint64.fromBytesBigEndian(escrowId).toNumber();
  return conditionToAddress(chainId, buildEscrowCondition(numericId));
}

export function electionRuleIdToAddress(chainId: ChainId, electionRule: number): Address {
  return conditionToAddress(chainId, buildElectionRuleCondition(electionRule));
}
