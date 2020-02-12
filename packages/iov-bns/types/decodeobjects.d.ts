import { Amount, ChainId, Token } from "@iov/bcp";
import * as codecImpl from "./generated/codecimpl";
import {
  AccountConfiguration,
  AccountMsgFee,
  AccountNft,
  BnsUsernameNft,
  CashConfiguration,
  ChainAddressPair,
  Domain,
  ElectionRule,
  Electorate,
  Fraction,
  Keyed,
  Participant,
  Proposal,
  ProposalAction,
  TxFeeConfiguration,
  Vote,
  VoteOption,
} from "./types";
import { IovBech32Prefix } from "./util";
export declare function decodeToken(data: codecImpl.currency.ITokenInfo & Keyed): Token;
export declare function decodeAmount(coin: codecImpl.coin.ICoin): Amount;
export declare function decodeCashConfiguration(config: codecImpl.cash.IConfiguration): CashConfiguration;
export declare function decodeTxFeeConfiguration(config: codecImpl.txfee.IConfiguration): TxFeeConfiguration;
export declare function decodeChainAddressPair(pair: codecImpl.username.IBlockchainAddress): ChainAddressPair;
export declare function decodeUsernameNft(
  nft: codecImpl.username.IToken & Keyed,
  registryChainId: ChainId,
): BnsUsernameNft;
export declare function decodeAccountConfiguration(
  prefix: IovBech32Prefix,
  patch: codecImpl.account.IConfiguration,
): AccountConfiguration;
export declare function decodeAccountMsgFee(msgFee: codecImpl.account.IAccountMsgFee): AccountMsgFee;
export declare function decodeBlockchainAddress(pair: codecImpl.account.IBlockchainAddress): ChainAddressPair;
export declare function decodeAccount(
  prefix: IovBech32Prefix,
  account: codecImpl.account.IAccount,
): AccountNft;
export declare function decodeDomain(prefix: IovBech32Prefix, domain: codecImpl.account.IDomain): Domain;
export declare function decodeElectorate(
  prefix: IovBech32Prefix,
  electorate: codecImpl.gov.IElectorate & Keyed,
): Electorate;
export declare function decodeFraction(fraction: codecImpl.gov.IFraction): Fraction;
export declare function decodeParticipants(
  prefix: IovBech32Prefix,
  maybeParticipants?: codecImpl.multisig.IParticipant[] | null,
): readonly Participant[];
export declare function decodeElectionRule(
  prefix: IovBech32Prefix,
  rule: codecImpl.gov.IElectionRule & Keyed,
): ElectionRule;
export declare function decodeRawProposalOption(
  prefix: IovBech32Prefix,
  rawOption: Uint8Array,
): ProposalAction;
export declare function decodeProposal(
  prefix: IovBech32Prefix,
  proposal: codecImpl.gov.IProposal & Keyed,
): Proposal;
export declare function decodeVoteOption(option: codecImpl.gov.VoteOption): VoteOption;
export declare function decodeVote(prefix: IovBech32Prefix, vote: codecImpl.gov.IVote & Keyed): Vote;
