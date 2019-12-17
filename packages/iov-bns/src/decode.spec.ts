import { Address, ChainId, isSendTransaction, Nonce, TokenTicker } from "@iov/bcp";
import { Bech32, Encoding } from "@iov/encoding";

import {
  decodeCashConfiguration,
  decodeElectionRule,
  decodeElectorate,
  decodePrivkey,
  decodeProposal,
  decodePubkey,
  decodeToken,
  decodeUserData,
  decodeUsernameNft,
  parseTx,
} from "./decode";
import * as codecImpl from "./generated/codecimpl";
import {
  chainId,
  privBin,
  privJson,
  pubBin,
  pubJson,
  sendTxBin,
  sendTxJson,
  signedTxBin,
} from "./testdata.spec";
import {
  ActionKind,
  isMultisignatureTx,
  Keyed,
  ProposalExecutorResult,
  ProposalResult,
  ProposalStatus,
} from "./types";

const { fromHex, toUtf8 } = Encoding;

describe("Decode", () => {
  it("decodes username NFT", () => {
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
    expect(decoded.owner).toEqual(Bech32.encode("tiov", fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472")));
    expect(decoded.targets.length).toEqual(1);
    expect(decoded.targets[0]).toEqual({
      chainId: "wonderland" as ChainId,
      address: "12345W" as Address,
    });
  });

  it("decode pubkey", () => {
    const decoded = codecImpl.crypto.PublicKey.decode(pubBin);
    const pubkey = decodePubkey(decoded);
    expect(pubkey).toEqual(pubJson);
  });

  it("decode privkey", () => {
    const decoded = codecImpl.crypto.PrivateKey.decode(privBin);
    const privkey = decodePrivkey(decoded);
    expect(privkey).toEqual(privJson);
  });

  describe("decodeUserData", () => {
    it("works", () => {
      const userData: codecImpl.sigs.IUserData = {
        pubkey: {
          ed25519: fromHex("aabbccdd"),
        },
        sequence: 7,
      };
      const decoded = decodeUserData(userData);
      expect(decoded).toEqual({
        nonce: 7 as Nonce,
      });
    });
  });

  it("has working decodeToken", () => {
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

  describe("decodeCashConfiguration", () => {
    it("can decode configuration with non-null minimal fee", () => {
      const config: codecImpl.cash.IConfiguration = {
        minimalFee: {
          whole: 1234567890,
          fractional: 123456789,
          ticker: "ASH",
        },
      };
      const decoded = decodeCashConfiguration(config);
      expect(decoded).toEqual({
        minimalFee: {
          quantity: "1234567890123456789",
          fractionalDigits: 9,
          tokenTicker: "ASH" as TokenTicker,
        },
      });
    });

    it("can decode configuration with null minimal fee", () => {
      const config: codecImpl.cash.IConfiguration = {
        minimalFee: {
          whole: 0,
          fractional: 0,
          ticker: "",
        },
      };
      const decoded = decodeCashConfiguration(config);
      expect(decoded).toEqual({
        minimalFee: null,
      });
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
  });

  describe("transactions", () => {
    it("decode invalid transaction fails", () => {
      /* tslint:disable-next-line:no-bitwise */
      const badBin = signedTxBin.map((x: number, i: number) => (i % 5 ? x ^ 0x01 : x));
      expect(() => codecImpl.bnsd.Tx.decode(badBin)).toThrowError();
    });

    // unsigned tx will fail as parsing requires a sig to extract signer
    it("decode unsigned transaction fails", () => {
      const decoded = codecImpl.bnsd.Tx.decode(sendTxBin);
      expect(() => parseTx(decoded, chainId)).toThrowError(/transaction has no signatures/i);
    });

    it("decode signed transaction", () => {
      const decoded = codecImpl.bnsd.Tx.decode(signedTxBin);
      const tx = parseTx(decoded, chainId);
      expect(tx.transaction).toEqual(sendTxJson);
    });

    it("decode multisig transaction", () => {
      const decoded: codecImpl.bnsd.ITx = {
        signatures: [
          {
            sequence: 0,
            pubkey: {
              ed25519: fromHex("c9df7bcba2238bedcc681e8b17bb21c1625d21d285b70c20cf53fdd473db9dfb"),
            },
            signature: {
              ed25519: fromHex(
                "7e899078b35b2d301893b82b0d840f4e1ceb715a86f4d28b2e88312ed605fea83d6b37f7ced4c8023a0d41f79ac9d5556df72c5ec58e26d7db4a6f8c6a537d0a",
              ),
            },
          },
        ],
        multisig: [fromHex("0000665544332211")],
        cashSendMsg: {
          metadata: { schema: 1 },
          source: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
          destination: fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"),
          amount: { whole: 1, fractional: 1, ticker: "CASH" },
        },
      };
      const tx = parseTx(decoded, chainId);
      if (!isSendTransaction(tx.transaction) || !isMultisignatureTx(tx.transaction)) {
        throw new Error("Expected multisignature send tx");
      }
      expect(tx.transaction).toEqual({
        kind: "bcp/send",
        chainId: chainId,
        amount: {
          quantity: "1000000001",
          fractionalDigits: 9,
          tokenTicker: "CASH" as TokenTicker,
        },
        sender: "tiov1dcg3fat5zrvw00xezzjk3jgedm7pg70y222af3" as Address,
        recipient: "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address,
        memo: undefined,
        multisig: [112516402455057],
      });
    });
  });
});
