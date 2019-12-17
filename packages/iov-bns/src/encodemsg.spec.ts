import { Address, Amount, ChainId, Hash, SendTransaction, SwapOfferTransaction, TokenTicker } from "@iov/bcp";
import { Encoding } from "@iov/encoding";
import Long from "long";

import { encodeMsg } from "./encodemsg";
import * as codecImpl from "./generated/codecimpl";
import { pubJson, sendTxBin, sendTxJson } from "./testdata.spec";
import {
  ActionKind,
  CreateEscrowTx,
  CreateMultisignatureTx,
  CreateProposalTx,
  Participant,
  RegisterUsernameTx,
  ReleaseEscrowTx,
  ReturnEscrowTx,
  TransferUsernameTx,
  UpdateEscrowPartiesTx,
  UpdateMultisignatureTx,
  UpdateTargetsOfUsernameTx,
  VoteOption,
  VoteTx,
} from "./types";

const { fromHex } = Encoding;

/** A random user on an IOV testnet */
const alice = {
  bin: fromHex("ae8cf0f2d436db9ecbbe118cf1d1637d568797c9"),
  bech32: "tiov146x0puk5xmdeaja7zxx0r5tr04tg097fralsxd" as Address,
};

describe("encodeMsg", () => {
  const defaultChainId = "registry-chain" as ChainId;
  const defaultSender = "tiov1dcg3fat5zrvw00xezzjk3jgedm7pg70y222af3" as Address;
  // weave address hex: b1ca7e78f74423ae01da3b51e676934d9105f282
  const defaultRecipient = "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address;
  const defaultArbiter = "tiov17yp0mh3yxwv6yxx386mxyfzlqnhe6q58edka6r" as Address;
  const defaultAmount: Amount = {
    quantity: "1000000001",
    fractionalDigits: 9,
    tokenTicker: "CASH" as TokenTicker,
  };
  const defaultEscrowId = 4;

  it("works for testdata", () => {
    const tx = encodeMsg(sendTxJson);
    const encoded = Uint8Array.from(codecImpl.bnsd.Tx.encode(tx).finish());
    expect(encoded).toEqual(sendTxBin);
  });

  // Token sends

  it("works for SendTransaction", () => {
    const transaction: SendTransaction = {
      kind: "bcp/send",
      chainId: defaultChainId,
      amount: defaultAmount,
      sender: defaultSender,
      recipient: defaultRecipient,
      memo: "abc",
    };

    const msg = encodeMsg(transaction).cashSendMsg!;
    expect(msg.source).toEqual(fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"));
    expect(msg.destination).toEqual(fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"));
    expect(msg.memo).toEqual("abc");
    expect(msg.amount!.whole).toEqual(1);
    expect(msg.amount!.fractional).toEqual(1);
    expect(msg.amount!.ticker).toEqual("CASH");
    expect(msg.ref!.length).toEqual(0);
  });

  it("works for SendTransaction with mismatched sender pubkey and address", () => {
    const transaction: SendTransaction = {
      kind: "bcp/send",
      chainId: defaultChainId,
      amount: {
        quantity: "1000000001",
        fractionalDigits: 9,
        tokenTicker: "CASH" as TokenTicker,
      },
      senderPubkey: pubJson,
      sender: defaultRecipient,
      recipient: defaultRecipient,
      memo: "abc",
    };
    const msg = encodeMsg(transaction).cashSendMsg!;
    expect(msg.source).toEqual(fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"));
    expect(msg.destination).toEqual(fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"));
    expect(msg.memo).toEqual("abc");
    expect(msg.amount!.whole).toEqual(1);
    expect(msg.amount!.fractional).toEqual(1);
    expect(msg.amount!.ticker).toEqual("CASH");
    expect(msg.ref!.length).toEqual(0);
  });

  // Usernames

  it("works for UpdateTargetsOfUsernameTx", () => {
    const addAddress: UpdateTargetsOfUsernameTx = {
      kind: "bns/update_targets_of_username",
      chainId: defaultChainId,
      username: "alice*iov",
      targets: [
        {
          chainId: "other-land" as ChainId,
          address: "865765858O" as Address,
        },
      ],
    };
    const msg = encodeMsg(addAddress).usernameChangeTokenTargetsMsg!;
    expect(msg.username).toEqual("alice*iov");
    expect(msg.newTargets![0].blockchainId).toEqual("other-land");
    expect(msg.newTargets![0].address).toEqual("865765858O");
  });

  it("works for RegisterUsernameTx", () => {
    const registerUsername: RegisterUsernameTx = {
      kind: "bns/register_username",
      chainId: defaultChainId,
      username: "alice*iov",
      targets: [
        {
          chainId: "chain1" as ChainId,
          address: "367X" as Address,
        },
        {
          chainId: "chain3" as ChainId,
          address: "0xddffeeffddaa44" as Address,
        },
        {
          chainId: "chain2" as ChainId,
          address: "0x00aabbddccffee" as Address,
        },
      ],
    };
    const msg = encodeMsg(registerUsername).usernameRegisterTokenMsg!;
    expect(msg.username).toEqual("alice*iov");
    expect(msg.targets).toBeDefined();
    expect(msg.targets!.length).toEqual(3);
    expect(msg.targets![0].blockchainId).toEqual("chain1");
    expect(msg.targets![0].address).toEqual("367X");
    expect(msg.targets![1].blockchainId).toEqual("chain3");
    expect(msg.targets![1].address).toEqual("0xddffeeffddaa44");
    expect(msg.targets![2].blockchainId).toEqual("chain2");
    expect(msg.targets![2].address).toEqual("0x00aabbddccffee");
  });

  it("works for TransferUsernameTx", () => {
    const transfer: TransferUsernameTx = {
      kind: "bns/transfer_username",
      chainId: defaultChainId,
      username: "alice*iov",
      newOwner: defaultRecipient,
    };
    const msg = encodeMsg(transfer).usernameTransferTokenMsg!;
    expect(msg.username).toEqual("alice*iov");
    expect(msg.newOwner).toEqual(fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"));
  });

  // Multisignature contracts

  it("works for CreateMultisignatureTx", () => {
    const participants: readonly Participant[] = [
      {
        address: "tiov1zg69v7yszg69v7yszg69v7yszg69v7ysy7xxgy" as Address,
        weight: 4,
      },
      {
        address: "tiov140x77qfr40x77qfr40x77qfr40x77qfrj4zpp5" as Address,
        weight: 1,
      },
      {
        address: "tiov1nxvenxvenxvenxvenxvenxvenxvenxverxe7mm" as Address,
        weight: 1,
      },
    ];
    // tslint:disable-next-line:readonly-array
    const iParticipants: codecImpl.multisig.IParticipant[] = [
      {
        signature: fromHex("1234567890123456789012345678901234567890"),
        weight: 4,
      },
      {
        signature: fromHex("abcdef0123abcdef0123abcdef0123abcdef0123"),
        weight: 1,
      },
      {
        signature: fromHex("9999999999999999999999999999999999999999"),
        weight: 1,
      },
    ];
    const createMultisignature: CreateMultisignatureTx = {
      kind: "bns/create_multisignature_contract",
      chainId: defaultChainId,
      participants: participants,
      activationThreshold: 2,
      adminThreshold: 3,
    };
    const msg = encodeMsg(createMultisignature).multisigCreateMsg!;
    expect(msg.participants).toEqual(iParticipants);
    expect(msg.activationThreshold).toEqual(2);
    expect(msg.adminThreshold).toEqual(3);
  });

  it("works for UpdateMultisignatureTx", () => {
    const participants: readonly Participant[] = [
      {
        address: "tiov1zg69v7yszg69v7yszg69v7yszg69v7ysy7xxgy" as Address,
        weight: 4,
      },
      {
        address: "tiov140x77qfr40x77qfr40x77qfr40x77qfrj4zpp5" as Address,
        weight: 1,
      },
      {
        address: "tiov1nxvenxvenxvenxvenxvenxvenxvenxverxe7mm" as Address,
        weight: 1,
      },
    ];
    // tslint:disable-next-line:readonly-array
    const iParticipants: codecImpl.multisig.IParticipant[] = [
      {
        signature: fromHex("1234567890123456789012345678901234567890"),
        weight: 4,
      },
      {
        signature: fromHex("abcdef0123abcdef0123abcdef0123abcdef0123"),
        weight: 1,
      },
      {
        signature: fromHex("9999999999999999999999999999999999999999"),
        weight: 1,
      },
    ];
    const updateMultisignature: UpdateMultisignatureTx = {
      kind: "bns/update_multisignature_contract",
      chainId: defaultChainId,
      contractId: fromHex("abcdef0123"),
      participants: participants,
      activationThreshold: 3,
      adminThreshold: 4,
    };
    const msg = encodeMsg(updateMultisignature).multisigUpdateMsg!;
    expect(msg.contractId).toEqual(fromHex("abcdef0123"));
    expect(msg.participants).toEqual(iParticipants);
    expect(msg.activationThreshold).toEqual(3);
    expect(msg.adminThreshold).toEqual(4);
  });

  // Escrows

  it("works for CreateEscrowTx", () => {
    const timeout = {
      timestamp: new Date().valueOf(),
    };
    const memo = "testing 123";
    const createEscrow: CreateEscrowTx = {
      kind: "bns/create_escrow",
      chainId: defaultChainId,
      sender: defaultSender,
      arbiter: defaultArbiter,
      recipient: defaultRecipient,
      amounts: [defaultAmount],
      timeout: timeout,
      memo: memo,
    };
    const msg = encodeMsg(createEscrow).escrowCreateMsg!;

    expect(msg.metadata).toEqual({ schema: 1 });
    expect(msg.source).toEqual(fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"));
    expect(msg.arbiter).toEqual(fromHex("f102fdde243399a218d13eb662245f04ef9d0287"));
    expect(msg.destination).toEqual(fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"));
    expect(msg.amount!.length).toEqual(1);
    expect(msg.amount![0].whole).toEqual(1);
    expect(msg.amount![0].fractional).toEqual(1);
    expect(msg.amount![0].ticker).toEqual("CASH");
    expect(msg.timeout).toEqual(timeout.timestamp);
    expect(msg.memo).toEqual(memo);
  });

  it("works for ReleaseEscrowTx", () => {
    const releaseEscrow: ReleaseEscrowTx = {
      kind: "bns/release_escrow",
      chainId: defaultChainId,
      escrowId: defaultEscrowId,
      amounts: [defaultAmount],
    };
    const msg = encodeMsg(releaseEscrow).escrowReleaseMsg!;

    expect(msg.metadata).toEqual({ schema: 1 });
    expect(msg.escrowId).toEqual(fromHex("0000000000000004"));
    expect(msg.amount!.length).toEqual(1);
    expect(msg.amount![0].whole).toEqual(1);
    expect(msg.amount![0].fractional).toEqual(1);
    expect(msg.amount![0].ticker).toEqual("CASH");
  });

  it("works for ReturnEscrowTx", () => {
    const returnEscrow: ReturnEscrowTx = {
      kind: "bns/return_escrow",
      chainId: defaultChainId,
      escrowId: defaultEscrowId,
    };
    const msg = encodeMsg(returnEscrow).escrowReturnMsg!;

    expect(msg.metadata).toEqual({ schema: 1 });
    expect(msg.escrowId).toEqual(fromHex("0000000000000004"));
  });

  it("works for UpdateEscrowPartiesTx", () => {
    const updateEscrowSender: UpdateEscrowPartiesTx = {
      kind: "bns/update_escrow_parties",
      chainId: defaultChainId,
      escrowId: defaultEscrowId,
      sender: defaultSender,
    };
    const msg1 = encodeMsg(updateEscrowSender).escrowUpdatePartiesMsg!;

    expect(msg1.metadata).toEqual({ schema: 1 });
    expect(msg1.escrowId).toEqual(fromHex("0000000000000004"));
    expect(msg1.source).toEqual(fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"));

    const updateEscrowRecipient: UpdateEscrowPartiesTx = {
      kind: "bns/update_escrow_parties",
      chainId: defaultChainId,
      escrowId: defaultEscrowId,
      recipient: defaultRecipient,
    };
    const msg2 = encodeMsg(updateEscrowRecipient).escrowUpdatePartiesMsg!;

    expect(msg2.metadata).toEqual({ schema: 1 });
    expect(msg2.escrowId).toEqual(fromHex("0000000000000004"));
    expect(msg2.destination).toEqual(fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"));

    const updateEscrowArbiter: UpdateEscrowPartiesTx = {
      kind: "bns/update_escrow_parties",
      chainId: defaultChainId,
      escrowId: defaultEscrowId,
      arbiter: defaultArbiter,
    };
    const msg3 = encodeMsg(updateEscrowArbiter).escrowUpdatePartiesMsg!;

    expect(msg3.metadata).toEqual({ schema: 1 });
    expect(msg3.escrowId).toEqual(fromHex("0000000000000004"));
    expect(msg3.arbiter).toEqual(fromHex("f102fdde243399a218d13eb662245f04ef9d0287"));
  });

  it("only updates one party at a time", () => {
    const updateEscrowParties: UpdateEscrowPartiesTx = {
      kind: "bns/update_escrow_parties",
      chainId: defaultChainId,
      escrowId: defaultEscrowId,
      sender: defaultSender,
      arbiter: defaultArbiter,
    };
    expect(() => encodeMsg(updateEscrowParties)).toThrowError(/only one party can be updated at a time/i);
  });

  // Governance

  describe("CreateProposalTx", () => {
    it("works with CreateTextResolution action", () => {
      const createProposal: CreateProposalTx = {
        kind: "bns/create_proposal",
        chainId: defaultChainId,
        title: "Why not try this?",
        action: {
          kind: ActionKind.CreateTextResolution,
          resolution: "la la la",
        },
        description: "foo bar",
        electionRuleId: 4822531585417728,
        startTime: 1122334455,
        author: defaultSender,
      };
      const msg = encodeMsg(createProposal).govCreateProposalMsg!;
      expect(msg).toEqual({
        metadata: { schema: 1 },
        title: "Why not try this?",
        rawOption: codecImpl.bnsd.ProposalOptions.encode({
          govCreateTextResolutionMsg: {
            metadata: { schema: 1 },
            resolution: "la la la",
          },
        }).finish(),
        description: "foo bar",
        electionRuleId: fromHex("0011221122112200"),
        startTime: 1122334455,
        author: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
      });
    });

    it("works with ExecuteProposalBatch action with array of Send actions", () => {
      const createProposal: CreateProposalTx = {
        kind: "bns/create_proposal",
        chainId: defaultChainId,
        title: "Why not try this?",
        action: {
          kind: ActionKind.ExecuteProposalBatch,
          messages: [
            {
              kind: ActionKind.Send,
              sender: defaultSender,
              recipient: defaultRecipient,
              amount: defaultAmount,
              memo: "say hi",
            },
            {
              kind: ActionKind.Send,
              sender: defaultRecipient,
              recipient: defaultSender,
              amount: {
                quantity: "3000000003",
                fractionalDigits: 9,
                tokenTicker: "MASH" as TokenTicker,
              },
            },
          ],
        },
        description: "foo bar",
        electionRuleId: 4822531585417728,
        startTime: 1122334455,
        author: defaultSender,
      };
      const msg = encodeMsg(createProposal).govCreateProposalMsg!;
      expect(msg).toEqual({
        metadata: { schema: 1 },
        title: "Why not try this?",
        rawOption: codecImpl.bnsd.ProposalOptions.encode({
          executeProposalBatchMsg: {
            messages: [
              {
                sendMsg: {
                  metadata: { schema: 1 },
                  source: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
                  destination: fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"),
                  amount: {
                    whole: 1,
                    fractional: 1,
                    ticker: "CASH",
                  },
                  memo: "say hi",
                },
              },
              {
                sendMsg: {
                  metadata: { schema: 1 },
                  source: fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"),
                  destination: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
                  amount: {
                    whole: 3,
                    fractional: 3,
                    ticker: "MASH",
                  },
                },
              },
            ],
          },
        }).finish(),
        description: "foo bar",
        electionRuleId: fromHex("0011221122112200"),
        startTime: 1122334455,
        author: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
      });
    });

    it("works with ReleaseEscrow action", () => {
      const createProposal: CreateProposalTx = {
        kind: "bns/create_proposal",
        chainId: defaultChainId,
        title: "Why not try this?",
        action: {
          kind: ActionKind.ReleaseEscrow,
          escrowId: defaultEscrowId,
          amount: defaultAmount,
        },
        description: "foo bar",
        electionRuleId: 4822531585417728,
        startTime: 1122334455,
        author: defaultSender,
      };
      const msg = encodeMsg(createProposal).govCreateProposalMsg!;
      expect(msg).toEqual({
        metadata: { schema: 1 },
        title: "Why not try this?",
        rawOption: codecImpl.bnsd.ProposalOptions.encode({
          escrowReleaseMsg: {
            metadata: { schema: 1 },
            escrowId: fromHex("0000000000000004"),
            amount: [
              {
                whole: 1,
                fractional: 1,
                ticker: "CASH",
              },
            ],
          },
        }).finish(),
        description: "foo bar",
        electionRuleId: fromHex("0011221122112200"),
        startTime: 1122334455,
        author: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
      });
    });

    it("works with SetValidators action", () => {
      const createProposal: CreateProposalTx = {
        kind: "bns/create_proposal",
        chainId: defaultChainId,
        title: "Why not try this?",
        action: {
          kind: ActionKind.SetValidators,
          validatorUpdates: {
            // eslint-disable-next-line @typescript-eslint/camelcase
            ed25519_0902bb5de30ccb15b6decb6aa1fdb4f0c1c7317df62dcafa81ccad82ce88dd22: { power: 5 },
          },
        },
        description: "foo bar",
        electionRuleId: 4822531585417728,
        startTime: 1122334455,
        author: defaultSender,
      };
      const msg = encodeMsg(createProposal).govCreateProposalMsg!;
      expect(msg).toEqual({
        metadata: { schema: 1 },
        title: "Why not try this?",
        rawOption: codecImpl.bnsd.ProposalOptions.encode({
          validatorsApplyDiffMsg: {
            metadata: { schema: 1 },
            validatorUpdates: [
              {
                pubKey: {
                  type: "ed25519",
                  data: fromHex("0902bb5de30ccb15b6decb6aa1fdb4f0c1c7317df62dcafa81ccad82ce88dd22"),
                },
                power: Long.fromNumber(5),
              },
            ],
          },
        }).finish(),
        description: "foo bar",
        electionRuleId: fromHex("0011221122112200"),
        startTime: 1122334455,
        author: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
      });
    });

    it("works with UpdateElectionRule action", () => {
      const createProposal: CreateProposalTx = {
        kind: "bns/create_proposal",
        chainId: defaultChainId,
        title: "Why not try this?",
        action: {
          kind: ActionKind.UpdateElectionRule,
          electionRuleId: 5,
          threshold: {
            numerator: 2,
            denominator: 7,
          },
          quorum: {
            numerator: 4,
            denominator: 5,
          },
          votingPeriod: 3600,
        },
        description: "foo bar",
        electionRuleId: 4822531585417728,
        startTime: 1122334455,
        author: defaultSender,
      };
      const msg = encodeMsg(createProposal).govCreateProposalMsg!;
      expect(msg).toEqual({
        metadata: { schema: 1 },
        title: "Why not try this?",
        rawOption: codecImpl.bnsd.ProposalOptions.encode({
          govUpdateElectionRuleMsg: {
            metadata: { schema: 1 },
            electionRuleId: fromHex("0000000000000005"),
            threshold: {
              numerator: 2,
              denominator: 7,
            },
            quorum: {
              numerator: 4,
              denominator: 5,
            },
            votingPeriod: 3600,
          },
        }).finish(),
        description: "foo bar",
        electionRuleId: fromHex("0011221122112200"),
        startTime: 1122334455,
        author: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
      });
    });

    it("works with UpdateElectorate action", () => {
      const createProposal: CreateProposalTx = {
        kind: "bns/create_proposal",
        chainId: defaultChainId,
        title: "Why not try this?",
        action: {
          kind: ActionKind.UpdateElectorate,
          electorateId: 5,
          diffElectors: {
            [defaultSender]: { weight: 8 },
          },
        },
        description: "foo bar",
        electionRuleId: 4822531585417728,
        startTime: 1122334455,
        author: defaultSender,
      };
      const msg = encodeMsg(createProposal).govCreateProposalMsg!;
      expect(msg).toEqual({
        metadata: { schema: 1 },
        title: "Why not try this?",
        rawOption: codecImpl.bnsd.ProposalOptions.encode({
          govUpdateElectorateMsg: {
            metadata: { schema: 1 },
            electorateId: fromHex("0000000000000005"),
            diffElectors: [{ address: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"), weight: 8 }],
          },
        }).finish(),
        description: "foo bar",
        electionRuleId: fromHex("0011221122112200"),
        startTime: 1122334455,
        author: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
      });
    });

    it("works with SetMsgFee action", () => {
      const createProposal: CreateProposalTx = {
        kind: "bns/create_proposal",
        chainId: defaultChainId,
        title: "Why not try this?",
        action: {
          kind: ActionKind.SetMsgFee,
          msgPath: "username/register_token",
          fee: {
            fractionalDigits: 9,
            quantity: "10000000001",
            tokenTicker: "CASH" as TokenTicker,
          },
        },
        description: "foo bar",
        electionRuleId: 4822531585417728,
        startTime: 1122334455,
        author: defaultSender,
      };
      const msg = encodeMsg(createProposal).govCreateProposalMsg!;
      expect(msg).toEqual({
        metadata: { schema: 1 },
        title: "Why not try this?",
        rawOption: codecImpl.bnsd.ProposalOptions.encode({
          msgfeeSetMsgFeeMsg: {
            metadata: { schema: 1 },
            msgPath: "username/register_token",
            fee: {
              whole: 10,
              fractional: 1,
              ticker: "CASH",
            },
          },
        }).finish(),
        description: "foo bar",
        electionRuleId: fromHex("0011221122112200"),
        startTime: 1122334455,
        author: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
      });
    });
  });

  describe("VoteTx", () => {
    it("works for VoteTx with voter set", () => {
      const vote: VoteTx = {
        kind: "bns/vote",
        chainId: defaultChainId,
        proposalId: 733292968738,
        selection: VoteOption.Abstain,
        voter: alice.bech32,
      };
      const msg = encodeMsg(vote).govVoteMsg!;
      expect(msg).toEqual({
        metadata: { schema: 1 },
        proposalId: fromHex("000000AABBAABB22"),
        selected: codecImpl.gov.VoteOption.VOTE_OPTION_ABSTAIN,
        voter: alice.bin,
      });
    });

    it("throws if voter is not set (in strict mode)", () => {
      const vote: VoteTx = {
        kind: "bns/vote",
        chainId: defaultChainId,
        proposalId: 733292968738,
        selection: VoteOption.Abstain,
        voter: null,
      };
      expect(() => encodeMsg(vote)).toThrowError(/VoteTx\.voter must be set/i);
    });

    it("works for VoteTx with no voter set (in non-strict mode)", () => {
      const vote: VoteTx = {
        kind: "bns/vote",
        chainId: defaultChainId,
        proposalId: 733292968738,
        selection: VoteOption.Abstain,
        voter: null,
      };
      const msg = encodeMsg(vote, false).govVoteMsg!;
      expect(msg).toEqual({
        metadata: { schema: 1 },
        proposalId: fromHex("000000AABBAABB22"),
        selected: codecImpl.gov.VoteOption.VOTE_OPTION_ABSTAIN,
        voter: undefined,
      });
    });
  });

  // Other

  it("encodes unset and empty memo the same way", () => {
    {
      const memoUnset: SendTransaction = {
        kind: "bcp/send",
        chainId: defaultChainId,
        sender: defaultSender,
        amount: defaultAmount,
        recipient: "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address,
      };
      const memoEmpty: SendTransaction = {
        kind: "bcp/send",
        chainId: defaultChainId,
        sender: defaultSender,
        amount: defaultAmount,
        recipient: "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address,
        memo: "",
      };
      expect(encodeMsg(memoUnset)).toEqual(encodeMsg(memoEmpty));
    }

    {
      const memoUnset: SwapOfferTransaction = {
        kind: "bcp/swap_offer",
        chainId: defaultChainId,
        amounts: [],
        sender: "tiov1dcg3fat5zrvw00xezzjk3jgedm7pg70y222af3" as Address,
        recipient: "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address,
        timeout: { timestamp: 22 },
        hash: fromHex("aabbccdd") as Hash,
      };
      const memoEmpty: SwapOfferTransaction = {
        kind: "bcp/swap_offer",
        chainId: defaultChainId,
        amounts: [],
        sender: "tiov1dcg3fat5zrvw00xezzjk3jgedm7pg70y222af3" as Address,
        recipient: "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address,
        timeout: { timestamp: 22 },
        hash: fromHex("aabbccdd") as Hash,
        memo: "",
      };
      expect(encodeMsg(memoUnset)).toEqual(encodeMsg(memoEmpty));
    }
  });

  it("throws for transactions with invalid memo length", () => {
    {
      const transaction: SendTransaction = {
        kind: "bcp/send",
        chainId: defaultChainId,
        amount: {
          quantity: "1000000001",
          fractionalDigits: 9,
          tokenTicker: "CASH" as TokenTicker,
        },
        sender: defaultRecipient,
        recipient: defaultRecipient,
        // max length is 128; this emoji has string length 3 but byte length 7
        memo: "a".repeat(122) + "7️⃣",
      };
      expect(() => encodeMsg(transaction)).toThrowError(/invalid memo length/i);
    }
    {
      const transaction: SwapOfferTransaction = {
        kind: "bcp/swap_offer",
        chainId: defaultChainId,
        amounts: [],
        sender: "tiov1dcg3fat5zrvw00xezzjk3jgedm7pg70y222af3" as Address,
        recipient: "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address,
        timeout: { timestamp: 22 },
        hash: fromHex("aabbccdd") as Hash,
        // max length is 128; this emoji has string length 3 but byte length 7
        memo: "a".repeat(122) + "7️⃣",
      };
      expect(() => encodeMsg(transaction)).toThrowError(/invalid memo length/i);
    }
  });
});
