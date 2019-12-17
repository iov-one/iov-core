/// <reference types="long" />
import { Amount } from "@iov/bcp";
import * as codecImpl from "./generated/codecimpl";
import { ChainAddressPair, Fraction, Participant, ProposalAction } from "./types";
import { IovBech32Prefix } from "./util";
export declare function ensure<T>(maybe: T | null | undefined, msg?: string): T;
/**
 * Decodes a protobuf int field (int32/uint32/int64/uint64) into a JavaScript
 * number.
 */
export declare function asIntegerNumber(maybeLong: Long | number | null | undefined): number;
export declare function decodeNumericId(id: Uint8Array): number;
export declare function decodeAmount(coin: codecImpl.coin.ICoin): Amount;
export declare function decodeChainAddressPair(pair: codecImpl.username.IBlockchainAddress): ChainAddressPair;
export declare function decodeFraction(fraction: codecImpl.gov.IFraction): Fraction;
export declare function decodeParticipants(
  prefix: IovBech32Prefix,
  maybeParticipants?: codecImpl.multisig.IParticipant[] | null,
): readonly Participant[];
export declare function decodeRawProposalOption(
  prefix: IovBech32Prefix,
  rawOption: Uint8Array,
): ProposalAction;
