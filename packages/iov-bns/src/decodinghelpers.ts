import { Address, Amount, ChainId, TokenTicker } from "@iov/bcp";
import { Encoding, Uint64 } from "@iov/encoding";
import BN from "bn.js";

import * as codecImpl from "./generated/codecimpl";
import {
  ActionKind,
  ChainAddressPair,
  Electors,
  Fraction,
  Participant,
  ProposalAction,
  SendAction,
  Validators,
} from "./types";
import { encodeBnsAddress, IovBech32Prefix } from "./util";

function decodeString(input: string | null | undefined): string {
  // weave encodes empty strings as null
  return input || "";
}

export function ensure<T>(maybe: T | null | undefined, msg?: string): T {
  if (maybe === null || maybe === undefined) {
    throw new Error("missing " + (msg || "field"));
  }
  return maybe;
}

/**
 * Decodes a protobuf int field (int32/uint32/int64/uint64) into a JavaScript
 * number.
 */
export function asIntegerNumber(maybeLong: Long | number | null | undefined): number {
  if (!maybeLong) {
    return 0;
  } else if (typeof maybeLong === "number") {
    if (!Number.isInteger(maybeLong)) {
      throw new Error("Number is not an integer.");
    }
    return maybeLong;
  } else {
    return maybeLong.toInt();
  }
}

export function decodeNumericId(id: Uint8Array): number {
  return Uint64.fromBytesBigEndian(id).toNumber();
}

export function decodeAmount(coin: codecImpl.coin.ICoin): Amount {
  const fractionalDigits = 9; // fixed for all tokens in BNS

  const wholeNumber = asIntegerNumber(coin.whole);
  if (wholeNumber < 0) {
    throw new Error("Component `whole` must not be negative");
  }

  const fractionalNumber = asIntegerNumber(coin.fractional);
  if (fractionalNumber < 0) {
    throw new Error("Component `fractional` must not be negative");
  }

  const quantity = new BN(wholeNumber)
    .imul(new BN(10 ** fractionalDigits))
    .iadd(new BN(fractionalNumber))
    .toString();

  return {
    quantity: quantity,
    fractionalDigits: fractionalDigits,
    tokenTicker: (coin.ticker || "") as TokenTicker,
  };
}

export function decodeChainAddressPair(pair: codecImpl.username.IBlockchainAddress): ChainAddressPair {
  return {
    chainId: ensure(pair.blockchainId, "blockchainId") as ChainId,
    address: ensure(pair.address, "address") as Address,
  };
}

export function decodeFraction(fraction: codecImpl.gov.IFraction): Fraction {
  const numerator = asIntegerNumber(fraction.numerator);
  const denominator = asIntegerNumber(fraction.denominator);
  if (denominator === 0) {
    throw new Error("Denominator must not be 0");
  }
  return { numerator: numerator, denominator: denominator };
}

export function decodeParticipants(
  prefix: IovBech32Prefix,
  // tslint:disable-next-line:readonly-array
  maybeParticipants?: codecImpl.multisig.IParticipant[] | null,
): readonly Participant[] {
  const participants = ensure(maybeParticipants, "participants");
  return participants.map((participant, i) => ({
    weight: ensure(participant.weight, `participants.$${i}.weight`),
    address: encodeBnsAddress(prefix, ensure(participant.signature, `participants.$${i}.signature`)),
  }));
}

function decodeElectors(prefix: IovBech32Prefix, electors: readonly codecImpl.gov.IElector[]): Electors {
  const map: Electors = {};
  return electors.reduce((accumulator, elector) => {
    const address = encodeBnsAddress(prefix, ensure(elector.address, "address"));
    return {
      ...accumulator,
      [address]: { weight: ensure(elector.weight, "weight") },
    };
  }, map);
}

function decodeValidators(validators: readonly codecImpl.weave.IValidatorUpdate[]): Validators {
  const initialValidators: Validators = {};
  return validators.reduce((result, validator) => {
    if (!validator.pubKey || !validator.pubKey.data) {
      throw new Error("Validator is missing pubKey data");
    }
    const index = `ed25519_${Encoding.toHex(validator.pubKey.data)}`;
    return {
      ...result,
      [index]: { power: asIntegerNumber(validator.power) },
    };
  }, initialValidators);
}

export function decodeRawProposalOption(prefix: IovBech32Prefix, rawOption: Uint8Array): ProposalAction {
  const option = codecImpl.bnsd.ProposalOptions.decode(rawOption);
  if (option.govCreateTextResolutionMsg) {
    return {
      kind: ActionKind.CreateTextResolution,
      resolution: decodeString(option.govCreateTextResolutionMsg.resolution),
    };
  } else if (option.escrowReleaseMsg) {
    return {
      kind: ActionKind.ReleaseEscrow,
      escrowId: decodeNumericId(ensure(option.escrowReleaseMsg.escrowId, "escrowId")),
      amount: ensure(ensure(option.escrowReleaseMsg.amount, "amount").map(decodeAmount)[0], "amount.0"),
    };
  } else if (option.executeProposalBatchMsg) {
    return {
      kind: ActionKind.ExecuteProposalBatch,
      messages: ensure(option.executeProposalBatchMsg.messages, "messages").map(message => {
        if (!message.sendMsg) {
          throw new Error("Only send actions are currently supported in proposal batch");
        }
        const messageWithoutMemo: SendAction = {
          kind: ActionKind.Send,
          sender: encodeBnsAddress(prefix, ensure(message.sendMsg.source, "source")),
          recipient: encodeBnsAddress(prefix, ensure(message.sendMsg.destination, "destination")),
          amount: decodeAmount(ensure(message.sendMsg.amount, "amount")),
        };

        return message.sendMsg.memo
          ? {
              ...messageWithoutMemo,
              memo: message.sendMsg.memo,
            }
          : messageWithoutMemo;
      }),
    };
  } else if (option.govUpdateElectionRuleMsg) {
    return {
      kind: ActionKind.UpdateElectionRule,
      electionRuleId: decodeNumericId(
        ensure(option.govUpdateElectionRuleMsg.electionRuleId, "electionRuleId"),
      ),
      threshold: option.govUpdateElectionRuleMsg.threshold
        ? decodeFraction(option.govUpdateElectionRuleMsg.threshold)
        : undefined,
      quorum: option.govUpdateElectionRuleMsg.quorum
        ? decodeFraction(option.govUpdateElectionRuleMsg.quorum)
        : undefined,
      votingPeriod: ensure(option.govUpdateElectionRuleMsg.votingPeriod, "votingPeriod"),
    };
  } else if (option.govUpdateElectorateMsg) {
    return {
      kind: ActionKind.UpdateElectorate,
      electorateId: decodeNumericId(ensure(option.govUpdateElectorateMsg.electorateId, "electorateId")),
      diffElectors: decodeElectors(
        prefix,
        ensure(option.govUpdateElectorateMsg.diffElectors, "diffElectors"),
      ),
    };
  } else if (option.validatorsApplyDiffMsg) {
    return {
      kind: ActionKind.SetValidators,
      validatorUpdates: decodeValidators(
        ensure(option.validatorsApplyDiffMsg.validatorUpdates, "validatorUpdates"),
      ),
    };
  } else if (option.msgfeeSetMsgFeeMsg) {
    return {
      kind: ActionKind.SetMsgFee,
      msgPath: ensure(option.msgfeeSetMsgFeeMsg.msgPath, "msgPath"),
      fee: decodeAmount(ensure(option.msgfeeSetMsgFeeMsg.fee, "fee")),
    };
  } else {
    throw new Error("Unsupported ProposalOptions");
  }
}
