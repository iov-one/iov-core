import { Address, ChainId, SwapData } from "@iov/bcp";
import { Sha256 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { As } from "type-tagger";

import { addressPrefix, encodeBnsAddress } from "./util";

/** A package-internal type representing a Weave Condition */
export type Condition = Uint8Array & As<"Condition">;

function buildCondition(extension: string, typ: string, id: Uint8Array): Condition {
  // https://github.com/iov-one/weave/blob/v0.21.0/conditions.go#L35-L38
  const res = Uint8Array.from([...Encoding.toAscii(`${extension}/${typ}/`), ...id]);
  return res as Condition;
}

export function buildSwapCondition(swap: SwapData): Condition {
  // https://github.com/iov-one/weave/blob/v0.15.0/x/aswap/handler.go#L287
  const weaveSwapId = new Uint8Array([...swap.id.data, "|".charCodeAt(0), ...swap.hash]);
  return buildCondition("aswap", "pre_hash", weaveSwapId);
}

export function buildMultisignatureCondition(multisignatureId: Uint8Array): Condition {
  return buildCondition("multisig", "usage", multisignatureId);
}

export function buildEscrowCondition(id: Uint8Array): Condition {
  // https://github.com/iov-one/weave/blob/v0.21.0/x/escrow/model.go#L83-L87
  return buildCondition("escrow", "seq", id);
}

export function conditionToWeaveAddress(cond: Condition): Uint8Array {
  return new Sha256(cond).digest().slice(0, 20);
}

export function conditionToAddress(chainId: ChainId, cond: Condition): Address {
  const prefix = addressPrefix(chainId);
  const bytes = conditionToWeaveAddress(cond);
  return encodeBnsAddress(prefix, bytes);
}
