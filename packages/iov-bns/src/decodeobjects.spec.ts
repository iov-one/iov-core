import { Address, ChainId, TokenTicker } from "@iov/bcp";
import { Bech32, Encoding } from "@iov/encoding";

import {
  decodeAccount,
  decodeAccountConfiguration,
  decodeAccountMsgFee,
  decodeAmount,
  decodeBlockchainAddress,
  decodeCashConfiguration,
  decodeDomain,
  decodeElectionRule,
  decodeElectorate,
  decodeProposal,
  decodeToken,
  decodeUsernameNft,
} from "./decodeobjects";
import * as codecImpl from "./generated/codecimpl";
import { coinBin, coinJson } from "./testdata.spec";
import { ActionKind, Keyed, ProposalExecutorResult, ProposalResult, ProposalStatus } from "./types";

const { fromHex, toUtf8 } = Encoding;

describe("decodeobjects", () => {
  describe("decodeToken", () => {
    it("works", () => {
      const token: codecImpl.currency.ITokenInfo & Keyed = {
        _id: toUtf8("TRASH"),
        name: "Trash",
      };
      const ticker = decodeToken(token);
      expect(ticker).toEqual({
        tokenTicker: "TRASH" as TokenTicker,
        tokenName: "Trash",
        fractionalDigits: 9,
      });
    });
  });

  describe("decodeAmount", () => {
    it("can decode amount 3.123456789 ASH", () => {
      const backendAmount: codecImpl.coin.ICoin = {
        whole: 3,
        fractional: 123456789,
        ticker: "ASH",
      };
      const decoded = decodeAmount(backendAmount);
      expect(decoded).toEqual({
        quantity: "3123456789",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      });
    });

    it("can decode amount 0.000000001 ASH", () => {
      const backendAmount: codecImpl.coin.ICoin = {
        whole: 0,
        fractional: 1,
        ticker: "ASH",
      };
      const decoded = decodeAmount(backendAmount);
      expect(decoded).toEqual({
        quantity: "1",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      });
    });

    it("can decode max amount 999999999999999.999999999 ASH", () => {
      // https://github.com/iov-one/weave/blob/v0.9.3/x/codec.proto#L15
      const backendAmount: codecImpl.coin.ICoin = {
        whole: 10 ** 15 - 1,
        fractional: 10 ** 9 - 1,
        ticker: "ASH",
      };
      const decoded = decodeAmount(backendAmount);
      expect(decoded).toEqual({
        quantity: "999999999999999999999999",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      });
    });

    it("is compatible to test data", () => {
      const decoded = codecImpl.coin.Coin.decode(coinBin);
      const amount = decodeAmount(decoded);
      expect(amount).toEqual(coinJson);
    });

    it("throws for decoding negative amount", () => {
      // ICoin allows negative values, which are now supported client-side
      {
        // -3.0 ASH
        const backendAmount: codecImpl.coin.ICoin = {
          whole: -3,
          fractional: 0,
          ticker: "ASH",
        };
        expect(() => decodeAmount(backendAmount)).toThrowError(/`whole` must not be negative/i);
      }
      {
        // -0.123456789 ASH
        const backendAmount: codecImpl.coin.ICoin = {
          whole: 0,
          fractional: -123456789,
          ticker: "ASH",
        };
        expect(() => decodeAmount(backendAmount)).toThrowError(/`fractional` must not be negative/i);
      }
    });
  });

  describe("decodeCashConfiguration", () => {
    const prefix = "tiov";

    it("can decode configuration with non-null minimal fee", () => {
      const config: codecImpl.cash.IConfiguration = {
        owner: fromHex("0011223344556677889900112233445566778899"),
        collectorAddress: fromHex("04C3DB7CCCACF58EEFCC296FF7AD0F6DB7C2FA17"),
        minimalFee: {
          whole: 1234567890,
          fractional: 123456789,
          ticker: "ASH",
        },
      };
      const decoded = decodeCashConfiguration(prefix, config);
      expect(decoded).toEqual({
        owner: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        collectorAddress: "tiov1qnpaklxv4n6cam7v99hl0tg0dkmu97sh56x6uz",
        minimalFee: {
          quantity: "1234567890123456789",
          fractionalDigits: 9,
          tokenTicker: "ASH" as TokenTicker,
        },
      });
    });

    it("can decode configuration with null minimal fee", () => {
      const config: codecImpl.cash.IConfiguration = {
        owner: fromHex("0011223344556677889900112233445566778899"),
        collectorAddress: fromHex("04C3DB7CCCACF58EEFCC296FF7AD0F6DB7C2FA17"),
        minimalFee: {
          whole: 0,
          fractional: 0,
          ticker: "",
        },
      };
      const decoded = decodeCashConfiguration(prefix, config);
      expect(decoded).toEqual({
        owner: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        collectorAddress: "tiov1qnpaklxv4n6cam7v99hl0tg0dkmu97sh56x6uz",
        minimalFee: null,
      });
    });
  });

  describe("decodeUsernameNft", () => {
    it("works", () => {
      const nft: codecImpl.username.IToken & Keyed = {
        _id: toUtf8("alice"),
        owner: fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472"),
        targets: [
          {
            blockchainId: "wonderland",
            address: "12345W",
          },
        ],
      };
      const decoded = decodeUsernameNft(nft, "iov-testchain" as ChainId);
      expect(decoded.id).toEqual("alice");
      expect(decoded.owner).toEqual(
        Bech32.encode("tiov", fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472")),
      );
      expect(decoded.targets.length).toEqual(1);
      expect(decoded.targets[0]).toEqual({
        chainId: "wonderland" as ChainId,
        address: "12345W" as Address,
      });
    });
  });

  describe("decodeAccountConfiguration", () => {
    it("works", () => {
      const prefix = "tiov";
      const conf: codecImpl.account.IConfiguration & Keyed = {
        _id: toUtf8("alice"),
        owner: fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472"),
        validDomain: "hole",
        validName: "rabbit",
        validBlockchainId: "wonderland",
        validBlockchainAddress: "12345W",
        domainRenew: 1234,
        domainGracePeriod: 12345,
      };
      const decoded = decodeAccountConfiguration(prefix, conf);
      expect(decoded.owner).toEqual(
        Bech32.encode(prefix, fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472")),
      );
      expect(decoded.validDomain).toEqual("hole");
      expect(decoded.validName).toEqual("rabbit");
      expect(decoded.validBlockchainId).toEqual("wonderland");
      expect(decoded.validBlockchainAddress).toEqual("12345W");
      expect(decoded.domainRenew).toEqual(1234);
      expect(decoded.domainGracePeriod).toEqual(12345);
    });
  });

  describe("decodeAccountMsgFee", () => {
    it("works", () => {
      const msgFee: codecImpl.account.IAccountMsgFee & Keyed = {
        _id: toUtf8("some-id"),
        msgPath: "some-msg-path",
        fee: { whole: 0, fractional: 123456789, ticker: "ASH" },
      };
      const decoded = decodeAccountMsgFee(msgFee);
      expect(decoded.msgPath).toEqual("some-msg-path");
      expect(decoded.fee).toEqual(decodeAmount({ whole: 0, fractional: 123456789, ticker: "ASH" }));
    });
  });

  describe("decodeBlockchainAddress", () => {
    it("works", () => {
      const blockchainAddress: codecImpl.account.IBlockchainAddress & Keyed = {
        _id: toUtf8("some-id"),
        blockchainId: "some-id",
        address: "some-address",
      };
      const decoded = decodeBlockchainAddress(blockchainAddress);
      expect(decoded.chainId).toEqual("some-id");
      expect(decoded.address).toEqual("some-address");
    });
  });

  describe("decodeAccount", () => {
    it("works", () => {
      const prefix = "tiov";
      const account: codecImpl.account.IAccount & Keyed = {
        _id: toUtf8("alice"),
        domain: "hole",
        name: "rabbit",
        owner: fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472"),
        validUntil: 1234,
        targets: [{ blockchainId: "wonderland", address: "12345W" }],
        certificates: [fromHex("214390591e6ac697319f20887405915e9d2690fd")],
      };
      const decoded = decodeAccount(prefix, account);
      expect(decoded.domain).toEqual("hole");
      expect(decoded.name).toEqual("rabbit");
      expect(decoded.owner).toEqual(
        Bech32.encode(prefix, fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472")),
      );
      expect(decoded.validUntil).toEqual(1234);
      expect(decoded.targets).toEqual([{ chainId: "wonderland", address: "12345W" }]);
      expect(decoded.certificates).toEqual([fromHex("214390591e6ac697319f20887405915e9d2690fd")]);
    });
  });

  describe("decodeDomain", () => {
    it("works", () => {
      const prefix = "tiov";
      const account: codecImpl.account.IDomain & Keyed = {
        _id: toUtf8("alice"),
        domain: "hole",
        admin: fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472"),
        validUntil: 1234,
        hasSuperuser: true,
        msgFees: [{ msgPath: "some-msg-path", fee: { whole: 0, fractional: 123456789, ticker: "ASH" } }],
        accountRenew: 5678,
      };
      const decoded = decodeDomain(prefix, account);
      expect(decoded.domain).toEqual("hole");
      expect(decoded.admin).toEqual("tiov1p62uqw00znhr98gwp8vylyyul844aarjhe9duq" as Address);
      expect(decoded.validUntil).toEqual(1234);
      expect(decoded.hasSuperuser).toEqual(true);
      expect(decoded.msgFees).toEqual([
        { msgPath: "some-msg-path", fee: decodeAmount({ whole: 0, fractional: 123456789, ticker: "ASH" }) },
      ]);
      expect(decoded.accountRenew).toEqual(5678);
    });
  });

  describe("decodeElectorate", () => {
    it("works", () => {
      const electorate: codecImpl.gov.IElectorate & Keyed = {
        _id: fromHex("000000000000000500000003"),
        metadata: { schema: 1 },
        version: 3,
        admin: fromHex("5555556688770011001100110011001100110011"),
        title: "A committee",
        electors: [
          {
            address: fromHex("1111111111111111111111111111111111111111"),
            weight: 1,
          },
          {
            address: fromHex("2222222222222222222222222222222222222222"),
            weight: 2,
          },
          {
            address: fromHex("3333333333333333333333333333333333333333"),
            weight: 3,
          },
        ],
        totalElectorateWeight: 6,
      };

      expect(decodeElectorate("tiov", electorate)).toEqual({
        id: 5,
        version: 3,
        admin: "tiov124242e5gwuqpzqq3qqgsqygqzyqpzqq350k5np" as Address,
        title: "A committee",
        electors: {
          tiov1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3scsw6l: { weight: 1 },
          tiov1yg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zl94gjg: { weight: 2 },
          tiov1xvenxvenxvenxvenxvenxvenxvenxvendmz486: { weight: 3 },
        },
        totalWeight: 6,
      });
    });
  });

  describe("decodeElectionRule", () => {
    it("works", () => {
      const rule: codecImpl.gov.IElectionRule & Keyed = {
        _id: fromHex("000000000000000200000003"),
        metadata: { schema: 1 },
        version: 3,
        admin: fromHex("5555556688770011001100110011001100110011"),
        electorateId: fromHex("0000000000000007"),
        title: "This is how it works",
        votingPeriod: 11223344556677,
        threshold: {
          numerator: 1,
          denominator: 2,
        },
        quorum: {
          numerator: 3,
          denominator: 4,
        },
      };
      expect(decodeElectionRule("tiov", rule)).toEqual({
        id: 2,
        version: 3,
        admin: "tiov124242e5gwuqpzqq3qqgsqygqzyqpzqq350k5np" as Address,
        electorateId: 7,
        title: "This is how it works",
        votingPeriod: 11223344556677,
        threshold: {
          numerator: 1,
          denominator: 2,
        },
        quorum: {
          numerator: 3,
          denominator: 4,
        },
      });
    });
  });

  describe("decodeProposal", () => {
    it("works", () => {
      const proposal: codecImpl.gov.IProposal & Keyed = {
        _id: fromHex("001100220033aabb"),
        metadata: { schema: 1 },
        title: "This will happen next",
        rawOption: codecImpl.bnsd.ProposalOptions.encode({
          govCreateTextResolutionMsg: {
            metadata: { schema: 1 },
            resolution: "la la la",
          },
        }).finish(),
        description: "foo bar",
        electionRuleRef: {
          id: fromHex("0000aabbccddbbff"),
          version: 28,
        },
        electorateRef: {
          id: fromHex("001100110011aabb"),
          version: 3,
        },
        votingStartTime: 42424242,
        votingEndTime: 42424243,
        submissionTime: 3003,
        author: fromHex("0011223344556677889900112233445566778899"),
        voteState: {
          totalYes: 1,
          totalNo: 2,
          totalAbstain: 3,
          totalElectorateWeight: 10,
        },
        status: codecImpl.gov.Proposal.Status.PROPOSAL_STATUS_SUBMITTED,
        result: codecImpl.gov.Proposal.Result.PROPOSAL_RESULT_UNDEFINED,
        executorResult: codecImpl.gov.Proposal.ExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN,
      };

      expect(decodeProposal("tiov", proposal)).toEqual({
        id: 4785220636355259,
        title: "This will happen next",
        action: {
          kind: ActionKind.CreateTextResolution,
          resolution: "la la la",
        },
        description: "foo bar",
        electionRule: {
          id: 187723572689919,
          version: 28,
        },
        electorate: {
          id: 4785147619683003,
          version: 3,
        },
        votingStartTime: 42424242,
        votingEndTime: 42424243,
        submissionTime: 3003,
        author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt" as Address,
        state: {
          totalYes: 1,
          totalNo: 2,
          totalAbstain: 3,
          totalElectorateWeight: 10,
        },
        status: ProposalStatus.Submitted,
        result: ProposalResult.Undefined,
        executorResult: ProposalExecutorResult.NotRun,
      });
    });

    it("migrationUpgradeSchemaMsg", () => {
      const proposal: codecImpl.gov.IProposal & Keyed = {
        _id: fromHex("001100220033aabb"),
        metadata: { schema: 1 },
        title: "This will happen next",
        rawOption: codecImpl.bnsd.ProposalOptions.encode({
          migrationUpgradeSchemaMsg: {
            metadata: { schema: 1 },
            pkg: "datamigration",
            toVersion: 1,
          },
        }).finish(),
        description: "foo bar",
        electionRuleRef: {
          id: fromHex("0000aabbccddbbff"),
          version: 28,
        },
        electorateRef: {
          id: fromHex("001100110011aabb"),
          version: 3,
        },
        votingStartTime: 42424242,
        votingEndTime: 42424243,
        submissionTime: 3003,
        author: fromHex("0011223344556677889900112233445566778899"),
        voteState: {
          totalYes: 1,
          totalNo: 2,
          totalAbstain: 3,
          totalElectorateWeight: 10,
        },
        status: codecImpl.gov.Proposal.Status.PROPOSAL_STATUS_SUBMITTED,
        result: codecImpl.gov.Proposal.Result.PROPOSAL_RESULT_UNDEFINED,
        executorResult: codecImpl.gov.Proposal.ExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN,
      };

      expect(decodeProposal("tiov", proposal)).toEqual({
        id: 4785220636355259,
        title: "This will happen next",
        action: {
          kind: ActionKind.UpgradeSchema,
          pkg: "datamigration",
          toVersion: 1,
        },
        description: "foo bar",
        electionRule: {
          id: 187723572689919,
          version: 28,
        },
        electorate: {
          id: 4785147619683003,
          version: 3,
        },
        votingStartTime: 42424242,
        votingEndTime: 42424243,
        submissionTime: 3003,
        author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt" as Address,
        state: {
          totalYes: 1,
          totalNo: 2,
          totalAbstain: 3,
          totalElectorateWeight: 10,
        },
        status: ProposalStatus.Submitted,
        result: ProposalResult.Undefined,
        executorResult: ProposalExecutorResult.NotRun,
      });
    });

    it("accountRegisterDomainMsg", () => {
      const proposal: codecImpl.gov.IProposal & Keyed = {
        _id: fromHex("001100220033aabb"),
        metadata: { schema: 1 },
        title: "This will happen next",
        rawOption: codecImpl.bnsd.ProposalOptions.encode({
          accountRegisterDomainMsg: {
            metadata: { schema: 1 },
            accountRenew: 456789,
            admin: fromHex("5555556688770011001100110011001100110011"),
            broker: fromHex("0011223344556677889900112233445566778899"),
            domain: "dave",
            hasSuperuser: true,
            msgFees: [{ msgPath: "some-msg-path", fee: { whole: 0, fractional: 123456789, ticker: "ASH" } }],
          },
        }).finish(),
        description: "foo bar",
        electionRuleRef: {
          id: fromHex("0000aabbccddbbff"),
          version: 28,
        },
        electorateRef: {
          id: fromHex("001100110011aabb"),
          version: 3,
        },
        votingStartTime: 42424242,
        votingEndTime: 42424243,
        submissionTime: 3003,
        author: fromHex("0011223344556677889900112233445566778899"),
        voteState: {
          totalYes: 1,
          totalNo: 2,
          totalAbstain: 3,
          totalElectorateWeight: 10,
        },
        status: codecImpl.gov.Proposal.Status.PROPOSAL_STATUS_SUBMITTED,
        result: codecImpl.gov.Proposal.Result.PROPOSAL_RESULT_UNDEFINED,
        executorResult: codecImpl.gov.Proposal.ExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN,
      };

      expect(decodeProposal("tiov", proposal)).toEqual({
        id: 4785220636355259,
        title: "This will happen next",
        action: {
          kind: ActionKind.RegisterDomain,
          accountRenew: 456789,
          admin: "tiov124242e5gwuqpzqq3qqgsqygqzyqpzqq350k5np" as Address,
          broker: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt" as Address,
          domain: "dave",
          hasSuperuser: true,
          msgFees: [
            {
              msgPath: "some-msg-path",
              fee: decodeAmount({ whole: 0, fractional: 123456789, ticker: "ASH" }),
            },
          ],
        },
        description: "foo bar",
        electionRule: {
          id: 187723572689919,
          version: 28,
        },
        electorate: {
          id: 4785147619683003,
          version: 3,
        },
        votingStartTime: 42424242,
        votingEndTime: 42424243,
        submissionTime: 3003,
        author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt" as Address,
        state: {
          totalYes: 1,
          totalNo: 2,
          totalAbstain: 3,
          totalElectorateWeight: 10,
        },
        status: ProposalStatus.Submitted,
        result: ProposalResult.Undefined,
        executorResult: ProposalExecutorResult.NotRun,
      });
    });

    it("accountRenewDomainMsg", () => {
      const proposal: codecImpl.gov.IProposal & Keyed = {
        _id: fromHex("001100220033aabb"),
        metadata: { schema: 1 },
        title: "This will happen next",
        rawOption: codecImpl.bnsd.ProposalOptions.encode({
          accountRenewDomainMsg: {
            metadata: { schema: 1 },
            domain: "dave",
          },
        }).finish(),
        description: "foo bar",
        electionRuleRef: {
          id: fromHex("0000aabbccddbbff"),
          version: 28,
        },
        electorateRef: {
          id: fromHex("001100110011aabb"),
          version: 3,
        },
        votingStartTime: 42424242,
        votingEndTime: 42424243,
        submissionTime: 3003,
        author: fromHex("0011223344556677889900112233445566778899"),
        voteState: {
          totalYes: 1,
          totalNo: 2,
          totalAbstain: 3,
          totalElectorateWeight: 10,
        },
        status: codecImpl.gov.Proposal.Status.PROPOSAL_STATUS_SUBMITTED,
        result: codecImpl.gov.Proposal.Result.PROPOSAL_RESULT_UNDEFINED,
        executorResult: codecImpl.gov.Proposal.ExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN,
      };

      expect(decodeProposal("tiov", proposal)).toEqual({
        id: 4785220636355259,
        title: "This will happen next",
        action: {
          kind: ActionKind.RenewDomain,
          domain: "dave",
        },
        description: "foo bar",
        electionRule: {
          id: 187723572689919,
          version: 28,
        },
        electorate: {
          id: 4785147619683003,
          version: 3,
        },
        votingStartTime: 42424242,
        votingEndTime: 42424243,
        submissionTime: 3003,
        author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt" as Address,
        state: {
          totalYes: 1,
          totalNo: 2,
          totalAbstain: 3,
          totalElectorateWeight: 10,
        },
        status: ProposalStatus.Submitted,
        result: ProposalResult.Undefined,
        executorResult: ProposalExecutorResult.NotRun,
      });
    });

    it("accountReplaceAccountMsgFeesMsg", () => {
      const proposal: codecImpl.gov.IProposal & Keyed = {
        _id: fromHex("001100220033aabb"),
        metadata: { schema: 1 },
        title: "This will happen next",
        rawOption: codecImpl.bnsd.ProposalOptions.encode({
          accountReplaceAccountMsgFeesMsg: {
            metadata: { schema: 1 },
            domain: "dave",
            newMsgFees: [
              { msgPath: "some-msg-path", fee: { whole: 0, fractional: 123456789, ticker: "ASH" } },
            ],
          },
        }).finish(),
        description: "foo bar",
        electionRuleRef: {
          id: fromHex("0000aabbccddbbff"),
          version: 28,
        },
        electorateRef: {
          id: fromHex("001100110011aabb"),
          version: 3,
        },
        votingStartTime: 42424242,
        votingEndTime: 42424243,
        submissionTime: 3003,
        author: fromHex("0011223344556677889900112233445566778899"),
        voteState: {
          totalYes: 1,
          totalNo: 2,
          totalAbstain: 3,
          totalElectorateWeight: 10,
        },
        status: codecImpl.gov.Proposal.Status.PROPOSAL_STATUS_SUBMITTED,
        result: codecImpl.gov.Proposal.Result.PROPOSAL_RESULT_UNDEFINED,
        executorResult: codecImpl.gov.Proposal.ExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN,
      };

      expect(decodeProposal("tiov", proposal)).toEqual({
        id: 4785220636355259,
        title: "This will happen next",
        action: {
          kind: ActionKind.SetAccountMsgFees,
          domain: "dave",
          newMsgFees: [
            {
              msgPath: "some-msg-path",
              fee: decodeAmount({ whole: 0, fractional: 123456789, ticker: "ASH" }),
            },
          ],
        },
        description: "foo bar",
        electionRule: {
          id: 187723572689919,
          version: 28,
        },
        electorate: {
          id: 4785147619683003,
          version: 3,
        },
        votingStartTime: 42424242,
        votingEndTime: 42424243,
        submissionTime: 3003,
        author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt" as Address,
        state: {
          totalYes: 1,
          totalNo: 2,
          totalAbstain: 3,
          totalElectorateWeight: 10,
        },
        status: ProposalStatus.Submitted,
        result: ProposalResult.Undefined,
        executorResult: ProposalExecutorResult.NotRun,
      });
    });

    it("accountReplaceAccountTargetsMsg", () => {
      const proposal: codecImpl.gov.IProposal & Keyed = {
        _id: fromHex("001100220033aabb"),
        metadata: { schema: 1 },
        title: "This will happen next",
        rawOption: codecImpl.bnsd.ProposalOptions.encode({
          accountReplaceAccountTargetsMsg: {
            metadata: { schema: 1 },
            domain: "dave",
            name: "coinbase",
            newTargets: [{ blockchainId: "wonderland", address: "12345W" }],
          },
        }).finish(),
        description: "foo bar",
        electionRuleRef: {
          id: fromHex("0000aabbccddbbff"),
          version: 28,
        },
        electorateRef: {
          id: fromHex("001100110011aabb"),
          version: 3,
        },
        votingStartTime: 42424242,
        votingEndTime: 42424243,
        submissionTime: 3003,
        author: fromHex("0011223344556677889900112233445566778899"),
        voteState: {
          totalYes: 1,
          totalNo: 2,
          totalAbstain: 3,
          totalElectorateWeight: 10,
        },
        status: codecImpl.gov.Proposal.Status.PROPOSAL_STATUS_SUBMITTED,
        result: codecImpl.gov.Proposal.Result.PROPOSAL_RESULT_UNDEFINED,
        executorResult: codecImpl.gov.Proposal.ExecutorResult.PROPOSAL_EXECUTOR_RESULT_NOT_RUN,
      };

      expect(decodeProposal("tiov", proposal)).toEqual({
        id: 4785220636355259,
        title: "This will happen next",
        action: {
          kind: ActionKind.SetAccountTargets,
          domain: "dave",
          name: "coinbase",
          newTargets: [decodeBlockchainAddress({ blockchainId: "wonderland", address: "12345W" })],
        },
        description: "foo bar",
        electionRule: {
          id: 187723572689919,
          version: 28,
        },
        electorate: {
          id: 4785147619683003,
          version: 3,
        },
        votingStartTime: 42424242,
        votingEndTime: 42424243,
        submissionTime: 3003,
        author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt" as Address,
        state: {
          totalYes: 1,
          totalNo: 2,
          totalAbstain: 3,
          totalElectorateWeight: 10,
        },
        status: ProposalStatus.Submitted,
        result: ProposalResult.Undefined,
        executorResult: ProposalExecutorResult.NotRun,
      });
    });
  });
});
