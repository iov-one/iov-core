import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  FullSignature,
  Hash,
  Identity,
  Nonce,
  PubkeyBytes,
  SendTransaction,
  SignatureBytes,
  SwapOfferTransaction,
  TokenTicker,
  WithCreator,
} from "@iov/bcp";
import { Ed25519, Ed25519Keypair, Sha512 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import Long from "long";

import {
  buildMsg,
  buildSignedTx,
  buildUnsignedTx,
  encodeAmount,
  encodeFullSignature,
  encodePrivkey,
  encodePubkey,
} from "./encode";
import * as codecImpl from "./generated/codecimpl";
import {
  coinBin,
  coinJson,
  privBin,
  privJson,
  pubBin,
  pubJson,
  sendTxBin,
  sendTxJson,
  sendTxSignBytes,
  signedTxBin,
  signedTxJson,
  signedTxSig,
} from "./testdata.spec";
import {
  ActionKind,
  CreateEscrowTx,
  CreateMultisignatureTx,
  CreateProposalTx,
  Participant,
  RegisterUsernameTx,
  ReleaseEscrowTx,
  ReturnEscrowTx,
  TallyTx,
  UpdateEscrowPartiesTx,
  UpdateMultisignatureTx,
  UpdateTargetsOfUsernameTx,
  VoteOption,
  VoteTx,
} from "./types";
import { appendSignBytes } from "./util";

const { fromHex, toAscii, toUtf8 } = Encoding;

describe("Encode", () => {
  it("encode pubkey", () => {
    const pubkey = encodePubkey(pubJson);
    const encoded = codecImpl.crypto.PublicKey.encode(pubkey).finish();
    // force result into Uint8Array for tests so it passes
    // if buffer of correct type as well
    expect(Uint8Array.from(encoded)).toEqual(pubBin);
  });

  it("encode private key", () => {
    const privkey = encodePrivkey(privJson);
    const encoded = codecImpl.crypto.PublicKey.encode(privkey).finish();
    expect(Uint8Array.from(encoded)).toEqual(privBin);
  });

  describe("encodeAmount", () => {
    it("can encode amount 3.123456789 ASH", () => {
      const amount: Amount = {
        quantity: "3123456789",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      };
      const encoded = encodeAmount(amount);
      expect(encoded).toEqual({
        whole: 3,
        fractional: 123456789,
        ticker: "ASH",
      });
    });

    it("can encode amount 0.000000001 ASH", () => {
      const amount: Amount = {
        quantity: "1",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      };
      const encoded = encodeAmount(amount);
      expect(encoded).toEqual({
        whole: null,
        fractional: 1,
        ticker: "ASH",
      });
    });

    it("can encode max amount 999999999999999.999999999 ASH", () => {
      // https://github.com/iov-one/weave/blob/v0.9.3/x/codec.proto#L15
      const amount: Amount = {
        quantity: "999999999999999999999999",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      };
      const encoded = encodeAmount(amount);
      expect(encoded).toEqual({
        whole: 10 ** 15 - 1,
        fractional: 10 ** 9 - 1,
        ticker: "ASH",
      });
    });

    it("throws for encoding fractional digits other than 9", () => {
      const amount: Amount = {
        quantity: "1",
        fractionalDigits: 6,
        tokenTicker: "SMASH" as TokenTicker,
      };
      expect(() => encodeAmount(amount)).toThrowError(/fractional digits must be 9 but was 6/i);
    });

    it("is compatible to test data", () => {
      const encoded = encodeAmount(coinJson);
      const encodedBinary = Uint8Array.from(codecImpl.coin.Coin.encode(encoded).finish());
      expect(encodedBinary).toEqual(coinBin);
    });
  });

  it("encodes full signature", () => {
    const fullSignature: FullSignature = {
      nonce: 123 as Nonce,
      pubkey: {
        algo: Algorithm.Ed25519,
        data: fromHex("00aa1122bbddffeeddcc") as PubkeyBytes,
      },
      signature: fromHex("aabbcc22334455") as SignatureBytes,
    };
    const encoded = encodeFullSignature(fullSignature);
    expect(encoded.sequence).toEqual(123);
    expect(encoded.pubkey!.ed25519!).toEqual(fromHex("00aa1122bbddffeeddcc"));
    expect(encoded.signature!.ed25519).toEqual(fromHex("aabbcc22334455"));
  });

  describe("buildUnsignedTx", () => {
    const defaultCreator: Identity = {
      chainId: "some-chain" as ChainId,
      pubkey: {
        algo: Algorithm.Ed25519,
        // Random 32 bytes pubkey. Derived IOV address:
        // tiov1dcg3fat5zrvw00xezzjk3jgedm7pg70y222af3 / 6e1114f57410d8e7bcd910a568c9196efc1479e4
        data: fromHex("7196c465e4c95b3dce425784f51936b95da6bc58b3212648cdca64ee7198df47") as PubkeyBytes,
      },
    };
    const defaultSender = "tiov1dcg3fat5zrvw00xezzjk3jgedm7pg70y222af3" as Address;
    const defaultRecipient = "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address;

    const defaultAmount: Amount = {
      quantity: "1000000001",
      fractionalDigits: 9,
      tokenTicker: "CASH" as TokenTicker,
    };

    it("can encode transaction without fees", () => {
      const transaction: SendTransaction & WithCreator = {
        kind: "bcp/send",
        creator: defaultCreator,
        amount: defaultAmount,
        sender: defaultSender,
        recipient: defaultRecipient,
        memo: "free transaction",
      };

      const encoded = buildUnsignedTx(transaction);
      expect(encoded.fees).toBeFalsy();

      expect(encoded.cashSendMsg).toBeDefined();
      expect(encoded.cashSendMsg!.memo).toEqual("free transaction");
    });

    it("can encode transaction with fees", () => {
      const transaction: SendTransaction & WithCreator = {
        kind: "bcp/send",
        creator: defaultCreator,
        amount: defaultAmount,
        sender: defaultSender,
        recipient: defaultRecipient,
        memo: "paid transaction",
        fee: {
          tokens: defaultAmount,
        },
      };

      const encoded = buildUnsignedTx(transaction);
      expect(encoded.fees).toBeDefined();
      expect(encoded.fees!.fees!.whole).toEqual(1);
      expect(encoded.fees!.fees!.fractional).toEqual(1);
      expect(encoded.fees!.fees!.ticker).toEqual("CASH");
      expect(encoded.fees!.payer!).toEqual(fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"));

      expect(encoded.cashSendMsg).toBeDefined();
      expect(encoded.cashSendMsg!.memo).toEqual("paid transaction");
    });
  });

  describe("buildMsg", () => {
    const defaultCreator: Identity = {
      chainId: "registry-chain" as ChainId,
      pubkey: {
        algo: Algorithm.Ed25519,
        // Random 32 bytes pubkey. Derived IOV address:
        // tiov1dcg3fat5zrvw00xezzjk3jgedm7pg70y222af3 / 6e1114f57410d8e7bcd910a568c9196efc1479e4
        data: fromHex("7196c465e4c95b3dce425784f51936b95da6bc58b3212648cdca64ee7198df47") as PubkeyBytes,
      },
    };
    const defaultSender = "tiov1dcg3fat5zrvw00xezzjk3jgedm7pg70y222af3" as Address;
    const defaultRecipient = "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address;
    const defaultArbiter = "tiov17yp0mh3yxwv6yxx386mxyfzlqnhe6q58edka6r" as Address;
    const defaultAmount: Amount = {
      quantity: "1000000001",
      fractionalDigits: 9,
      tokenTicker: "CASH" as TokenTicker,
    };
    const defaultEscrowId = fromHex("0000000000000004");

    // Token sends

    it("works for SendTransaction", () => {
      const transaction: SendTransaction & WithCreator = {
        kind: "bcp/send",
        creator: defaultCreator,
        amount: defaultAmount,
        sender: defaultSender,
        recipient: defaultRecipient,
        memo: "abc",
      };

      const msg = buildMsg(transaction).cashSendMsg!;
      expect(msg.source).toEqual(fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"));
      expect(msg.destination).toEqual(fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"));
      expect(msg.memo).toEqual("abc");
      expect(msg.amount!.whole).toEqual(1);
      expect(msg.amount!.fractional).toEqual(1);
      expect(msg.amount!.ticker).toEqual("CASH");
      expect(msg.ref!.length).toEqual(0);
    });

    it("throws for SendTransaction with mismatched sender and creator", () => {
      const transaction: SendTransaction & WithCreator = {
        kind: "bcp/send",
        creator: defaultCreator,
        amount: {
          quantity: "1000000001",
          fractionalDigits: 9,
          tokenTicker: "CASH" as TokenTicker,
        },
        sender: defaultRecipient,
        recipient: defaultRecipient,
        memo: "abc",
      };
      expect(() => buildMsg(transaction)).toThrowError(/sender and creator do not match/i);
    });

    // Usernames

    it("works for UpdateTargetsOfUsernameTx", () => {
      const addAddress: UpdateTargetsOfUsernameTx & WithCreator = {
        kind: "bns/update_targets_of_username",
        creator: defaultCreator,
        username: "alice",
        targets: [
          {
            chainId: "other-land" as ChainId,
            address: "865765858O" as Address,
          },
        ],
      };
      const msg = buildMsg(addAddress).usernameChangeTokenTargetsMsg!;
      expect(msg.username).toEqual("alice");
      expect(msg.newTargets![0].blockchainId).toEqual("other-land");
      expect(msg.newTargets![0].address).toEqual(toUtf8("865765858O"));
    });

    it("works for RegisterUsernameTx", () => {
      const registerUsername: RegisterUsernameTx & WithCreator = {
        kind: "bns/register_username",
        creator: defaultCreator,
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
      const msg = buildMsg(registerUsername).usernameRegisterTokenMsg!;
      expect(msg.username).toEqual("alice*iov");
      expect(msg.targets).toBeDefined();
      expect(msg.targets!.length).toEqual(3);
      expect(msg.targets![0].blockchainId).toEqual("chain1");
      expect(msg.targets![0].address).toEqual(toAscii("367X"));
      expect(msg.targets![1].blockchainId).toEqual("chain3");
      expect(msg.targets![1].address).toEqual(toAscii("0xddffeeffddaa44"));
      expect(msg.targets![2].blockchainId).toEqual("chain2");
      expect(msg.targets![2].address).toEqual(toAscii("0x00aabbddccffee"));
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
      const createMultisignature: CreateMultisignatureTx & WithCreator = {
        kind: "bns/create_multisignature_contract",
        creator: defaultCreator,
        participants: participants,
        activationThreshold: 2,
        adminThreshold: 3,
      };
      const msg = buildMsg(createMultisignature).multisigCreateMsg!;
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
      const updateMultisignature: UpdateMultisignatureTx & WithCreator = {
        kind: "bns/update_multisignature_contract",
        creator: defaultCreator,
        contractId: fromHex("abcdef0123"),
        participants: participants,
        activationThreshold: 3,
        adminThreshold: 4,
      };
      const msg = buildMsg(updateMultisignature).multisigUpdateMsg!;
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
      const createEscrow: CreateEscrowTx & WithCreator = {
        kind: "bns/create_escrow",
        creator: defaultCreator,
        sender: defaultSender,
        arbiter: defaultArbiter,
        recipient: defaultRecipient,
        amounts: [defaultAmount],
        timeout: timeout,
        memo: memo,
      };
      const msg = buildMsg(createEscrow).escrowCreateMsg!;

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
      const releaseEscrow: ReleaseEscrowTx & WithCreator = {
        kind: "bns/release_escrow",
        creator: defaultCreator,
        escrowId: defaultEscrowId,
        amounts: [defaultAmount],
      };
      const msg = buildMsg(releaseEscrow).escrowReleaseMsg!;

      expect(msg.metadata).toEqual({ schema: 1 });
      expect(msg.escrowId).toEqual(defaultEscrowId);
      expect(msg.amount!.length).toEqual(1);
      expect(msg.amount![0].whole).toEqual(1);
      expect(msg.amount![0].fractional).toEqual(1);
      expect(msg.amount![0].ticker).toEqual("CASH");
    });

    it("works for ReturnEscrowTx", () => {
      const returnEscrow: ReturnEscrowTx & WithCreator = {
        kind: "bns/return_escrow",
        creator: defaultCreator,
        escrowId: defaultEscrowId,
      };
      const msg = buildMsg(returnEscrow).escrowReturnMsg!;

      expect(msg.metadata).toEqual({ schema: 1 });
      expect(msg.escrowId).toEqual(defaultEscrowId);
    });

    it("works for UpdateEscrowPartiesTx", () => {
      const updateEscrowSender: UpdateEscrowPartiesTx & WithCreator = {
        kind: "bns/update_escrow_parties",
        creator: defaultCreator,
        escrowId: defaultEscrowId,
        sender: defaultSender,
      };
      const msg1 = buildMsg(updateEscrowSender).escrowUpdatePartiesMsg!;

      expect(msg1.metadata).toEqual({ schema: 1 });
      expect(msg1.escrowId).toEqual(defaultEscrowId);
      expect(msg1.source).toEqual(fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"));

      const updateEscrowRecipient: UpdateEscrowPartiesTx & WithCreator = {
        kind: "bns/update_escrow_parties",
        creator: defaultCreator,
        escrowId: defaultEscrowId,
        recipient: defaultRecipient,
      };
      const msg2 = buildMsg(updateEscrowRecipient).escrowUpdatePartiesMsg!;

      expect(msg2.metadata).toEqual({ schema: 1 });
      expect(msg2.escrowId).toEqual(defaultEscrowId);
      expect(msg2.destination).toEqual(fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"));

      const updateEscrowArbiter: UpdateEscrowPartiesTx & WithCreator = {
        kind: "bns/update_escrow_parties",
        creator: defaultCreator,
        escrowId: defaultEscrowId,
        arbiter: defaultArbiter,
      };
      const msg3 = buildMsg(updateEscrowArbiter).escrowUpdatePartiesMsg!;

      expect(msg3.metadata).toEqual({ schema: 1 });
      expect(msg3.escrowId).toEqual(defaultEscrowId);
      expect(msg3.arbiter).toEqual(fromHex("f102fdde243399a218d13eb662245f04ef9d0287"));
    });

    it("only updates one party at a time", () => {
      const updateEscrowParties: UpdateEscrowPartiesTx & WithCreator = {
        kind: "bns/update_escrow_parties",
        creator: defaultCreator,
        escrowId: defaultEscrowId,
        sender: defaultSender,
        arbiter: defaultArbiter,
      };
      expect(() => buildMsg(updateEscrowParties)).toThrowError(/only one party can be updated at a time/i);
    });

    // Governance

    describe("CreateProposalTx", () => {
      it("works with CreateTextResolution action", () => {
        const createProposal: CreateProposalTx & WithCreator = {
          kind: "bns/create_proposal",
          creator: defaultCreator,
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
        const msg = buildMsg(createProposal).govCreateProposalMsg!;
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

      it("works with UpdateElectorate action", () => {
        const createProposal: CreateProposalTx & WithCreator = {
          kind: "bns/create_proposal",
          creator: defaultCreator,
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
        const msg = buildMsg(createProposal).govCreateProposalMsg!;
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

      it("works with ReleaseGuaranteeFunds action", () => {
        const createProposal: CreateProposalTx & WithCreator = {
          kind: "bns/create_proposal",
          creator: defaultCreator,
          title: "Why not try this?",
          action: {
            kind: ActionKind.ReleaseGuaranteeFunds,
            escrowId: defaultEscrowId,
            amount: defaultAmount,
          },
          description: "foo bar",
          electionRuleId: 4822531585417728,
          startTime: 1122334455,
          author: defaultSender,
        };
        const msg = buildMsg(createProposal).govCreateProposalMsg!;
        expect(msg).toEqual({
          metadata: { schema: 1 },
          title: "Why not try this?",
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
          electionRuleId: fromHex("0011221122112200"),
          startTime: 1122334455,
          author: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
        });
      });

      it("works with SetValidators action", () => {
        const createProposal: CreateProposalTx & WithCreator = {
          kind: "bns/create_proposal",
          creator: defaultCreator,
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
        const msg = buildMsg(createProposal).govCreateProposalMsg!;
        expect(msg).toEqual({
          metadata: { schema: 1 },
          title: "Why not try this?",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            validatorsApplyDiffMsg: {
              metadata: { schema: 1 },
              validatorUpdates: [
                {
                  pubKey: {
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
    });

    it("works for VoteTx", () => {
      const vote: VoteTx & WithCreator = {
        kind: "bns/vote",
        creator: defaultCreator,
        proposalId: 733292968738,
        selection: VoteOption.Abstain,
      };
      const msg = buildMsg(vote).govVoteMsg!;
      expect(msg).toEqual({
        metadata: { schema: 1 },
        proposalId: Uint8Array.from([0, 0, 0, ...fromHex("AABBAABB22")]),
        selected: codecImpl.gov.VoteOption.VOTE_OPTION_ABSTAIN,
      });
    });

    it("works for TallyTx", () => {
      const vote: TallyTx & WithCreator = {
        kind: "bns/tally",
        creator: defaultCreator,
        proposalId: 733292968738,
      };
      const msg = buildMsg(vote).govTallyMsg!;
      expect(msg).toEqual({
        metadata: { schema: 1 },
        proposalId: Uint8Array.from([0, 0, 0, ...fromHex("AABBAABB22")]),
      });
    });

    // Other

    it("encodes unset and empty memo the same way", () => {
      {
        const memoUnset: SendTransaction & WithCreator = {
          kind: "bcp/send",
          creator: defaultCreator,
          sender: defaultSender,
          amount: defaultAmount,
          recipient: "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address,
        };
        const memoEmpty: SendTransaction & WithCreator = {
          kind: "bcp/send",
          creator: defaultCreator,
          sender: defaultSender,
          amount: defaultAmount,
          recipient: "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address,
          memo: "",
        };
        expect(buildMsg(memoUnset)).toEqual(buildMsg(memoEmpty));
      }

      {
        const memoUnset: SwapOfferTransaction & WithCreator = {
          kind: "bcp/swap_offer",
          creator: defaultCreator,
          amounts: [],
          recipient: "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address,
          timeout: { timestamp: 22 },
          hash: fromHex("aabbccdd") as Hash,
        };
        const memoEmpty: SwapOfferTransaction & WithCreator = {
          kind: "bcp/swap_offer",
          creator: defaultCreator,
          amounts: [],
          recipient: "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address,
          timeout: { timestamp: 22 },
          hash: fromHex("aabbccdd") as Hash,
          memo: "",
        };
        expect(buildMsg(memoUnset)).toEqual(buildMsg(memoEmpty));
      }
    });
  });
});

describe("Encode transactions", () => {
  it("encodes unsigned message", () => {
    const tx = buildMsg(sendTxJson);
    const encoded = codecImpl.bnsd.Tx.encode(tx).finish();
    expect(Uint8Array.from(encoded)).toEqual(sendTxBin);
  });

  it("encodes unsigned transaction", () => {
    const tx = buildUnsignedTx(sendTxJson);
    const encoded = codecImpl.bnsd.Tx.encode(tx).finish();
    expect(Uint8Array.from(encoded)).toEqual(sendTxBin);
  });

  it("encodes signed transaction", () => {
    const tx = buildSignedTx(signedTxJson);
    const encoded = codecImpl.bnsd.Tx.encode(tx).finish();
    expect(Uint8Array.from(encoded)).toEqual(signedTxBin);
  });
});

describe("Ensure crypto", () => {
  it("private key and public key match", async () => {
    const keypair = Ed25519Keypair.fromLibsodiumPrivkey(privJson.data);
    const { pubkey } = keypair;
    // extracted pubkey should match serialized pubkey
    expect(pubkey).toEqual(pubJson.data);
    const msg = Uint8Array.from([12, 54, 98, 243, 11]);
    const signature = await Ed25519.createSignature(msg, keypair);
    const value = await Ed25519.verifySignature(signature, msg, pubkey);
    expect(value).toBeTruthy();
  });

  it("sign bytes match", async () => {
    const keypair = Ed25519Keypair.fromLibsodiumPrivkey(privJson.data);
    const pubKey = pubJson.data;

    const tx = buildUnsignedTx(sendTxJson);
    const encoded = codecImpl.bnsd.Tx.encode(tx).finish();
    const toSign = appendSignBytes(encoded, sendTxJson.creator.chainId, signedTxSig.nonce);
    // testvector output already has the sha-512 digest applied
    const prehash = new Sha512(toSign).digest();
    expect(prehash).toEqual(sendTxSignBytes);

    // make sure we can validate this signature (our signBytes are correct)
    const signature = signedTxSig.signature;
    const valid = await Ed25519.verifySignature(signature, prehash, pubKey);
    expect(valid).toEqual(true);

    // make sure we can generate a compatible signature
    const mySig = await Ed25519.createSignature(prehash, keypair);
    expect(mySig).toEqual(signature);
  });
});
