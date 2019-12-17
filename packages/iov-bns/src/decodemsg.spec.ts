import {
  Address,
  Amount,
  ChainId,
  Hash,
  isSendTransaction,
  isSwapAbortTransaction,
  isSwapClaimTransaction,
  isSwapOfferTransaction,
  Preimage,
  SwapIdBytes,
  TokenTicker,
  UnsignedTransaction,
} from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import { decodeMsg } from "./decodemsg";
import * as codecImpl from "./generated/codecimpl";
import {
  ActionKind,
  isCreateEscrowTx,
  isCreateMultisignatureTx,
  isCreateProposalTx,
  isRegisterUsernameTx,
  isReleaseEscrowTx,
  isReturnEscrowTx,
  isTransferUsernameTx,
  isUpdateEscrowPartiesTx,
  isUpdateMultisignatureTx,
  isUpdateTargetsOfUsernameTx,
  isVoteTx,
  Participant,
  VoteOption,
} from "./types";

const { fromHex } = Encoding;

/** A random user on an IOV testnet */
const alice = {
  bin: fromHex("ae8cf0f2d436db9ecbbe118cf1d1637d568797c9"),
  bech32: "tiov146x0puk5xmdeaja7zxx0r5tr04tg097fralsxd" as Address,
};

describe("decodeMsg", () => {
  const defaultBaseTx: UnsignedTransaction = {
    kind: "", // this should be overriden by decodeMsg
    chainId: "iov-chain" as ChainId,
  };

  const defaultSender = "tiov1dcg3fat5zrvw00xezzjk3jgedm7pg70y222af3" as Address;
  const defaultRecipient = "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address;
  const defaultArbiter = "tiov17yp0mh3yxwv6yxx386mxyfzlqnhe6q58edka6r" as Address;
  const defaultEscrowId = fromHex("0000000000000004");
  const defaultAmount: Amount = {
    quantity: "1000000001",
    fractionalDigits: 9,
    tokenTicker: "CASH" as TokenTicker,
  };
  const defaultSwapId = {
    data: fromHex("aabbccdd") as SwapIdBytes,
  };
  const defaultPreimage = fromHex("22334455") as Preimage;
  const defaultHash = fromHex("0033669900336699003366990033669900336699003366990033669900336699") as Hash;
  const defaultTimeout = {
    timestamp: 1568814406426,
  };

  // Token sends

  it("works for SendTransaction", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      cashSendMsg: {
        source: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
        destination: fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"),
        amount: {
          whole: 1,
          fractional: 1,
          ticker: "CASH",
        },
        memo: "some memo",
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isSendTransaction(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.amount).toEqual(defaultAmount);
    expect(parsed.sender).toEqual(defaultSender);
    expect(parsed.recipient).toEqual(defaultRecipient);
    expect(parsed.memo).toEqual("some memo");
  });

  // Atomic swaps

  it("works for SwapOfferTransaction", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      aswapCreateMsg: {
        source: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
        destination: fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"),
        preimageHash: defaultHash,
        timeout: defaultTimeout.timestamp,
        amount: [
          {
            whole: 1,
            fractional: 1,
            ticker: "CASH",
          },
        ],
        memo: "some memo",
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isSwapOfferTransaction(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.amounts).toEqual([defaultAmount]);
    expect(parsed.recipient).toEqual(defaultRecipient);
    expect(parsed.timeout).toEqual(defaultTimeout);
    expect(parsed.hash).toEqual(defaultHash);
    expect(parsed.memo).toEqual("some memo");
  });

  it("works for SwapClaimTransaction", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      aswapReleaseMsg: {
        swapId: defaultSwapId.data,
        preimage: defaultPreimage,
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isSwapClaimTransaction(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.preimage).toEqual(defaultPreimage);
    expect(parsed.swapId).toEqual(defaultSwapId);
  });

  it("works for SwapAbortTransaction", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      aswapReturnMsg: {
        swapId: defaultSwapId.data,
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isSwapAbortTransaction(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.swapId).toEqual(defaultSwapId);
  });

  // Usernames

  it("works for UpdateTargetsOfUsernameTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      usernameChangeTokenTargetsMsg: {
        username: "alice*iov",
        newTargets: [
          {
            blockchainId: "wonderland",
            address: "0xAABB001122DD",
          },
        ],
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isUpdateTargetsOfUsernameTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.username).toEqual("alice*iov");
    expect(parsed.targets).toEqual([
      {
        chainId: "wonderland" as ChainId,
        address: "0xAABB001122DD" as Address,
      },
    ]);
  });

  it("works for RegisterUsernameTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      usernameRegisterTokenMsg: {
        username: "bobby*iov",
        targets: [
          {
            blockchainId: "chain1",
            address: "23456782367823X",
          },
          {
            blockchainId: "chain2",
            address: "0x001100aabbccddffeeddaa8899776655",
          },
        ],
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isRegisterUsernameTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.username).toEqual("bobby*iov");
    expect(parsed.targets.length).toEqual(2);
    expect(parsed.targets[0]).toEqual({
      chainId: "chain1" as ChainId,
      address: "23456782367823X" as Address,
    });
    expect(parsed.targets[1]).toEqual({
      chainId: "chain2" as ChainId,
      address: "0x001100aabbccddffeeddaa8899776655" as Address,
    });
  });

  it("works for TransferUsernameTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      usernameTransferTokenMsg: {
        username: "bobby*iov",
        newOwner: fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"),
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isTransferUsernameTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.username).toEqual("bobby*iov");
    expect(parsed.newOwner).toEqual(defaultRecipient);
  });

  // Multisignature contracts

  it("works for CreateMultisignatureTx", () => {
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
    const transactionMessage: codecImpl.bnsd.ITx = {
      multisigCreateMsg: {
        participants: iParticipants,
        activationThreshold: 2,
        adminThreshold: 3,
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isCreateMultisignatureTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.participants).toEqual(participants);
    expect(parsed.activationThreshold).toEqual(2);
    expect(parsed.adminThreshold).toEqual(3);
  });

  it("works for UpdateMultisignatureTx", () => {
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
    const transactionMessage: codecImpl.bnsd.ITx = {
      multisigUpdateMsg: {
        contractId: fromHex("0123456789"),
        participants: iParticipants,
        activationThreshold: 2,
        adminThreshold: 3,
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isUpdateMultisignatureTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.contractId).toEqual(fromHex("0123456789"));
    expect(parsed.participants).toEqual(participants);
    expect(parsed.activationThreshold).toEqual(2);
    expect(parsed.adminThreshold).toEqual(3);
  });

  // Escrows

  it("works for CreateEscrowTx", () => {
    const timeout = 1560940182424;
    const memo = "testing 123";
    const transactionMessage: codecImpl.bnsd.ITx = {
      escrowCreateMsg: {
        source: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
        arbiter: fromHex("f102fdde243399a218d13eb662245f04ef9d0287"),
        destination: fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"),
        amount: [
          {
            whole: 3,
            fractional: 123456789,
            ticker: "ASH",
          },
        ],
        timeout: timeout,
        memo: memo,
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isCreateEscrowTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.sender).toEqual(defaultSender);
    expect(parsed.arbiter).toEqual(defaultArbiter);
    expect(parsed.recipient).toEqual(defaultRecipient);
    expect(parsed.amounts).toEqual([
      {
        quantity: "3123456789",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      },
    ]);
    expect(parsed.timeout.timestamp).toEqual(timeout);
    expect(parsed.memo).toEqual(memo);
  });

  it("works for ReleaseEscrowTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      escrowReleaseMsg: {
        escrowId: defaultEscrowId,
        amount: [
          {
            whole: 3,
            fractional: 123456789,
            ticker: "ASH",
          },
        ],
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isReleaseEscrowTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.escrowId).toEqual(4);
    expect(parsed.amounts).toEqual([
      {
        quantity: "3123456789",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      },
    ]);
  });

  it("works for ReturnEscrowTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      escrowReturnMsg: {
        escrowId: defaultEscrowId,
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isReturnEscrowTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.escrowId).toEqual(4);
  });

  it("works for UpdateEscrowPartiesTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      escrowUpdatePartiesMsg: {
        escrowId: defaultEscrowId,
        source: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
        arbiter: fromHex("f102fdde243399a218d13eb662245f04ef9d0287"),
        destination: fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"),
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isUpdateEscrowPartiesTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.escrowId).toEqual(4);
    expect(parsed.sender).toEqual(defaultSender);
    expect(parsed.arbiter).toEqual(defaultArbiter);
    expect(parsed.recipient).toEqual(defaultRecipient);
  });

  // Governance

  describe("CreateProposalTx", () => {
    it("works with CreateTextResolution action", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            govCreateTextResolutionMsg: {
              metadata: { schema: 1 },
              resolution: "la la la",
            },
          }).finish(),
          description: "foo bar",
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const parsed = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(parsed)) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed.title).toEqual("This will happen next");
      expect(parsed.action).toEqual({ kind: ActionKind.CreateTextResolution, resolution: "la la la" });
      expect(parsed.description).toEqual("foo bar");
      expect(parsed.electionRuleId).toEqual(806595967999);
      expect(parsed.startTime).toEqual(42424242);
      expect(parsed.author).toEqual("tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt");
    });

    it("works with ExecuteProposalBatch action with array of Send actions", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            executeProposalBatchMsg: {
              messages: [
                {
                  sendMsg: {
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
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const parsed = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(parsed)) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed.title).toEqual("This will happen next");
      expect(parsed.action).toEqual({
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
      });
      expect(parsed.description).toEqual("foo bar");
      expect(parsed.electionRuleId).toEqual(806595967999);
      expect(parsed.startTime).toEqual(42424242);
      expect(parsed.author).toEqual("tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt");
    });

    it("works with ReleaseGuaranteeFunds action", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            escrowReleaseMsg: {
              metadata: { schema: 1 },
              escrowId: defaultEscrowId,
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
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const parsed = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(parsed)) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed.title).toEqual("This will happen next");
      expect(parsed.action).toEqual({
        kind: ActionKind.ReleaseEscrow,
        escrowId: 4,
        amount: defaultAmount,
      });
      expect(parsed.description).toEqual("foo bar");
      expect(parsed.electionRuleId).toEqual(806595967999);
      expect(parsed.startTime).toEqual(42424242);
      expect(parsed.author).toEqual("tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt");
    });

    it("works with SetValidators action", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            validatorsApplyDiffMsg: {
              metadata: { schema: 1 },
              validatorUpdates: [
                { pubKey: { type: "type1", data: fromHex("abcd") }, power: 5 },
                { pubKey: { type: "type2", data: fromHex("ef12") }, power: 7 },
              ],
            },
          }).finish(),
          description: "foo bar",
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const parsed = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(parsed)) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed.title).toEqual("This will happen next");
      expect(parsed.action).toEqual({
        kind: ActionKind.SetValidators,
        validatorUpdates: {
          // eslint-disable-next-line @typescript-eslint/camelcase
          ed25519_abcd: { power: 5 },
          // eslint-disable-next-line @typescript-eslint/camelcase
          ed25519_ef12: { power: 7 },
        },
      });
      expect(parsed.description).toEqual("foo bar");
      expect(parsed.electionRuleId).toEqual(806595967999);
      expect(parsed.startTime).toEqual(42424242);
      expect(parsed.author).toEqual("tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt");
    });

    it("works for UpdateElectionRule action", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            govUpdateElectionRuleMsg: {
              metadata: { schema: 1 },
              electionRuleId: fromHex("0000000000000005"),
              threshold: {
                numerator: 6,
                denominator: 7,
              },
              quorum: {
                numerator: 2,
                denominator: 3,
              },
              votingPeriod: 3600,
            },
          }).finish(),
          description: "foo bar",
          electionRuleId: Encoding.fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: Encoding.fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const parsed = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(parsed)) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed.title).toEqual("This will happen next");
      expect(parsed.action).toEqual({
        kind: ActionKind.UpdateElectionRule,
        electionRuleId: 5,
        threshold: {
          numerator: 6,
          denominator: 7,
        },
        quorum: {
          numerator: 2,
          denominator: 3,
        },
        votingPeriod: 3600,
      });
      expect(parsed.description).toEqual("foo bar");
      expect(parsed.electionRuleId).toEqual(806595967999);
      expect(parsed.startTime).toEqual(42424242);
      expect(parsed.author).toEqual("tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt");
    });

    it("works with UpdateElectorate action", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            govUpdateElectorateMsg: {
              metadata: { schema: 1 },
              electorateId: fromHex("0000000000000005"),
              diffElectors: [
                {
                  address: fromHex("ff11223344556677889900112233445566778899"),
                  weight: 8,
                },
              ],
            },
          }).finish(),
          description: "foo bar",
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const parsed = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(parsed)) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed.title).toEqual("This will happen next");
      expect(parsed.action).toEqual({
        kind: ActionKind.UpdateElectorate,
        electorateId: 5,
        diffElectors: {
          tiov1lugjyv6y24n80zyeqqgjyv6y24n80zyedknaqd: { weight: 8 },
        },
      });
      expect(parsed.description).toEqual("foo bar");
      expect(parsed.electionRuleId).toEqual(806595967999);
      expect(parsed.startTime).toEqual(42424242);
      expect(parsed.author).toEqual("tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt");
    });

    it("works with SetMsgFee action", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
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
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const parsed = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(parsed)) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed.title).toEqual("This will happen next");
      expect(parsed.action).toEqual({
        kind: ActionKind.SetMsgFee,
        msgPath: "username/register_token",
        fee: {
          fractionalDigits: 9,
          quantity: "10000000001",
          tokenTicker: "CASH" as TokenTicker,
        },
      });
      expect(parsed.description).toEqual("foo bar");
      expect(parsed.electionRuleId).toEqual(806595967999);
      expect(parsed.startTime).toEqual(42424242);
      expect(parsed.author).toEqual("tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt");
    });
  });

  describe("VoteTx", () => {
    it("works for VoteTx with no voter set", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govVoteMsg: {
          metadata: { schema: 1 },
          proposalId: fromHex("0000aabbddeeffff"),
          selected: codecImpl.gov.VoteOption.VOTE_OPTION_YES,
        },
      };
      const parsed = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isVoteTx(parsed)) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed).toEqual(
        jasmine.objectContaining({
          selection: VoteOption.Yes,
          proposalId: 187723859034111,
          voter: null,
        }),
      );
    });

    it("works for VoteTx with voter set", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govVoteMsg: {
          metadata: { schema: 1 },
          proposalId: fromHex("0000aabbddeeffff"),
          selected: codecImpl.gov.VoteOption.VOTE_OPTION_YES,
          voter: alice.bin,
        },
      };
      const parsed = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isVoteTx(parsed)) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed).toEqual(
        jasmine.objectContaining({
          selection: VoteOption.Yes,
          proposalId: 187723859034111,
          voter: alice.bech32,
        }),
      );
    });
  });
});
