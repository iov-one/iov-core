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
import { fromHex } from "@iov/encoding";

import { decodeMsg } from "./decodemsg";
import { decodeAmount } from "./decodeobjects";
import { encodeNumericId } from "./encodinghelpers";
import * as codecImpl from "./generated/codecimpl";
import {
  ActionKind,
  isAddAccountCertificateTx,
  isCreateEscrowTx,
  isCreateMultisignatureTx,
  isCreateProposalTx,
  isDeleteAccountCertificateTx,
  isDeleteAccountTx,
  isDeleteAllAccountsTx,
  isDeleteDomainTx,
  isRegisterAccountTx,
  isRegisterDomainTx,
  isRegisterUsernameTx,
  isReleaseEscrowTx,
  isRenewAccountTx,
  isRenewDomainTx,
  isReplaceAccountMsgFeesTx,
  isReplaceAccountTargetsTx,
  isReturnEscrowTx,
  isTransferAccountTx,
  isTransferDomainTx,
  isTransferUsernameTx,
  isUpdateAccountConfigurationTx,
  isUpdateEscrowPartiesTx,
  isUpdateMultisignatureTx,
  isUpdateTargetsOfUsernameTx,
  isVoteTx,
  Participant,
  VoteOption,
} from "./types";

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

  // Accounts

  it("works for UpdateAccountConfigurationTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      accountUpdateConfigurationMsg: {
        patch: {
          owner: fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472"),
          validDomain: "hole",
          validName: "rabbit",
          validBlockchainId: "wonderland",
          validBlockchainAddress: "12345W",
          domainRenew: 1234,
          domainGracePeriod: 69,
        },
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isUpdateAccountConfigurationTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.configuration).toEqual({
      owner: "tiov1p62uqw00znhr98gwp8vylyyul844aarjhe9duq" as Address,
      validDomain: "hole",
      validName: "rabbit",
      validBlockchainId: "wonderland",
      validBlockchainAddress: "12345W",
      domainRenew: 1234,
      domainGracePeriod: 69,
    });
  });

  it("works for RegisterDomainTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      accountRegisterDomainMsg: {
        domain: "some-domain",
        admin: fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472"),
        hasSuperuser: true,
        broker: fromHex("1234567890123456789012345678901234567890"),
        msgFees: [{ msgPath: "some-msg-path", fee: { whole: 0, fractional: 123456789, ticker: "ASH" } }],
        accountRenew: 1234,
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isRegisterDomainTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.domain).toEqual("some-domain");
    expect(parsed.admin).toEqual("tiov1p62uqw00znhr98gwp8vylyyul844aarjhe9duq" as Address);
    expect(parsed.hasSuperuser).toEqual(true);
    expect(parsed.broker).toEqual("tiov1zg69v7yszg69v7yszg69v7yszg69v7ysy7xxgy" as Address);
    expect(parsed.msgFees).toEqual([
      { msgPath: "some-msg-path", fee: decodeAmount({ whole: 0, fractional: 123456789, ticker: "ASH" }) },
    ]);
    expect(parsed.accountRenew).toEqual(1234);
  });

  it("works for TransferDomainTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      accountTransferDomainMsg: {
        domain: "some-domain",
        newAdmin: fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472"),
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isTransferDomainTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.domain).toEqual("some-domain");
    expect(parsed.newAdmin).toEqual("tiov1p62uqw00znhr98gwp8vylyyul844aarjhe9duq" as Address);
  });

  it("works for RenewDomainTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      accountRenewDomainMsg: {
        domain: "some-domain",
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isRenewDomainTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.domain).toEqual("some-domain");
  });

  it("works for DeleteDomainTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      accountDeleteDomainMsg: {
        domain: "some-domain",
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isDeleteDomainTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.domain).toEqual("some-domain");
  });

  it("works for RegisterAccountTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      accountRegisterAccountMsg: {
        domain: "hole",
        name: "alice",
        owner: fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472"),
        targets: [{ blockchainId: "wonderland", address: "12345W" }],
        broker: fromHex("1234567890123456789012345678901234567890"),
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isRegisterAccountTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.domain).toEqual("hole");
    expect(parsed.name).toEqual("alice");
    expect(parsed.owner).toEqual("tiov1p62uqw00znhr98gwp8vylyyul844aarjhe9duq" as Address);
    expect(parsed.targets).toEqual([{ chainId: "wonderland", address: "12345W" }]);
    expect(parsed.broker).toEqual("tiov1zg69v7yszg69v7yszg69v7yszg69v7ysy7xxgy" as Address);
  });

  it("works for TransferAccountTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      accountTransferAccountMsg: {
        domain: "hole",
        name: "alice",
        newOwner: fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472"),
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isTransferAccountTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.domain).toEqual("hole");
    expect(parsed.name).toEqual("alice");
    expect(parsed.newOwner).toEqual("tiov1p62uqw00znhr98gwp8vylyyul844aarjhe9duq" as Address);
  });

  it("works for ReplaceAccountTargetsTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      accountReplaceAccountTargetsMsg: {
        domain: "hole",
        name: "alice",
        newTargets: [{ blockchainId: "wonderland", address: "12345W" }],
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isReplaceAccountTargetsTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.domain).toEqual("hole");
    expect(parsed.name).toEqual("alice");
    expect(parsed.newTargets).toEqual([{ chainId: "wonderland", address: "12345W" }]);
  });

  it("works for DeleteAccountTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      accountDeleteAccountMsg: {
        domain: "hole",
        name: "alice",
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isDeleteAccountTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.domain).toEqual("hole");
    expect(parsed.name).toEqual("alice");
  });

  it("works for DeleteAllAccountsTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      accountFlushDomainMsg: {
        domain: "hole",
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isDeleteAllAccountsTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.domain).toEqual("hole");
  });

  it("works for RenewAccountTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      accountRenewAccountMsg: {
        domain: "hole",
        name: "alice",
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isRenewAccountTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.domain).toEqual("hole");
    expect(parsed.name).toEqual("alice");
  });

  it("works for AddAccountCertificateTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      accountAddAccountCertificateMsg: {
        domain: "hole",
        name: "alice",
        certificate: fromHex("214390591e6ac697319f20887405915e9d2690fd"),
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isAddAccountCertificateTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.domain).toEqual("hole");
    expect(parsed.name).toEqual("alice");
    expect(parsed.certificate).toEqual(fromHex("214390591e6ac697319f20887405915e9d2690fd"));
  });

  it("works for ReplaceAccountMsgFeesTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      accountReplaceAccountMsgFeesMsg: {
        domain: "hole",
        newMsgFees: [{ msgPath: "some-msg-path", fee: { whole: 0, fractional: 123456789, ticker: "ASH" } }],
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isReplaceAccountMsgFeesTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.domain).toEqual("hole");
    expect(parsed.newMsgFees).toEqual([
      { msgPath: "some-msg-path", fee: decodeAmount({ whole: 0, fractional: 123456789, ticker: "ASH" }) },
    ]);
  });

  it("works for DeleteAccountCertificateTx", () => {
    const transactionMessage: codecImpl.bnsd.ITx = {
      accountDeleteAccountCertificateMsg: {
        domain: "hole",
        name: "alice",
        certificateHash: fromHex("214390591e6ac697319f20887405915e9d2690fd"),
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isDeleteAccountCertificateTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.domain).toEqual("hole");
    expect(parsed.name).toEqual("alice");
    expect(parsed.certificateHash).toEqual(fromHex("214390591e6ac697319f20887405915e9d2690fd"));
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
        contractId: encodeNumericId(Number.MAX_SAFE_INTEGER),
        participants: iParticipants,
        activationThreshold: 2,
        adminThreshold: 3,
      },
    };
    const parsed = decodeMsg(defaultBaseTx, transactionMessage);
    if (!isUpdateMultisignatureTx(parsed)) {
      throw new Error("unexpected transaction kind");
    }
    expect(parsed.contractId).toEqual(Number.MAX_SAFE_INTEGER);
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
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
          action: {
            kind: ActionKind.CreateTextResolution,
            resolution: "la la la",
          },
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
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
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
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
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
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
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
          action: {
            kind: ActionKind.ReleaseEscrow,
            escrowId: 4,
            amount: defaultAmount,
          },
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
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
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
          action: {
            kind: ActionKind.SetValidators,
            validatorUpdates: {
              // eslint-disable-next-line @typescript-eslint/camelcase
              ed25519_abcd: { power: 5 },
              // eslint-disable-next-line @typescript-eslint/camelcase
              ed25519_ef12: { power: 7 },
            },
          },
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
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
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
          action: {
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
          },
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
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
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
          action: {
            kind: ActionKind.UpdateElectorate,
            electorateId: 5,
            diffElectors: {
              tiov1lugjyv6y24n80zyeqqgjyv6y24n80zyedknaqd: { weight: 8 },
            },
          },
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
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
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
          action: {
            kind: ActionKind.SetMsgFee,
            msgPath: "username/register_token",
            fee: {
              fractionalDigits: 9,
              quantity: "10000000001",
              tokenTicker: "CASH" as TokenTicker,
            },
          },
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
    });

    it("works with ExecuteMigration action", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            datamigrationExecuteMigrationMsg: {
              metadata: { schema: 1 },
              migrationId: "hg2048hgß2c3rß 2u3r9c23r2",
            },
          }).finish(),
          description: "foo bar",
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
          action: {
            kind: ActionKind.ExecuteMigration,
            id: "hg2048hgß2c3rß 2u3r9c23r2",
          },
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
    });

    it("works with UpgradeSchema action", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            migrationUpgradeSchemaMsg: {
              metadata: { schema: 1 },
              pkg: "datamigration",
              toVersion: 1,
            },
          }).finish(),
          description: "foo bar",
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
          action: {
            kind: ActionKind.UpgradeSchema,
            pkg: "datamigration",
            toVersion: 1,
          },
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
    });

    it("works with SetMsgFeeConfiguration action", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            msgfeeUpdateConfigurationMsg: {
              metadata: { schema: 1 },
              patch: {
                owner: fromHex("0011223344556677889900112233445566778899"),
                feeAdmin: fromHex("0011223344556677889900112233445566778899"),
              },
            },
          }).finish(),
          description: "foo bar",
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
          action: {
            kind: ActionKind.SetMsgFeeConfiguration,
            patch: {
              owner: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
              feeAdmin: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
            },
          },
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
    });

    it("works with SetPreRegistrationConfiguration action", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            preregistrationUpdateConfigurationMsg: {
              metadata: { schema: 1 },
              patch: {
                owner: fromHex("0011223344556677889900112233445566778899"),
              },
            },
          }).finish(),
          description: "foo bar",
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
          action: {
            kind: ActionKind.SetPreRegistrationConfiguration,
            patch: {
              owner: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
            },
          },
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
    });

    it("works with SetQualityScoreConfiguration action", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            qualityscoreUpdateConfigurationMsg: {
              metadata: { schema: 1 },
              patch: {
                owner: fromHex("0011223344556677889900112233445566778899"),
                c: { numerator: 2, denominator: 3 },
                k: { numerator: 3, denominator: 5 },
                kp: { numerator: 5, denominator: 7 },
                q0: { numerator: 7, denominator: 11 },
                x: { numerator: 11, denominator: 13 },
                xInf: { numerator: 13, denominator: 17 },
                xSup: { numerator: 17, denominator: 19 },
                delta: { numerator: 19, denominator: 23 },
              },
            },
          }).finish(),
          description: "foo bar",
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
          action: {
            kind: ActionKind.SetQualityScoreConfiguration,
            patch: {
              owner: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
              c: { numerator: 2, denominator: 3 },
              k: { numerator: 3, denominator: 5 },
              kp: { numerator: 5, denominator: 7 },
              q0: { numerator: 7, denominator: 11 },
              x: { numerator: 11, denominator: 13 },
              xInf: { numerator: 13, denominator: 17 },
              xSup: { numerator: 17, denominator: 19 },
              delta: { numerator: 19, denominator: 23 },
            },
          },
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
    });

    it("works with SetTermDepositConfiguration action", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            termdepositUpdateConfigurationMsg: {
              metadata: { schema: 1 },
              patch: {
                owner: fromHex("0011223344556677889900112233445566778899"),
                admin: fromHex("04C3DB7CCCACF58EEFCC296FF7AD0F6DB7C2FA17"),
                // standardRates
                bonuses: [
                  { lockinPeriod: 69, bonus: { numerator: 2, denominator: 3 } },
                  { lockinPeriod: 70, bonus: { numerator: 5, denominator: 7 } },
                ],
                // customRates
                baseRates: [
                  {
                    address: fromHex("0011223344556677889900112233445566778899"),
                    rate: { numerator: 11, denominator: 13 },
                  },
                  {
                    address: fromHex("04C3DB7CCCACF58EEFCC296FF7AD0F6DB7C2FA17"),
                    rate: { numerator: 17, denominator: 19 },
                  },
                ],
              },
            },
          }).finish(),
          description: "foo bar",
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
          action: {
            kind: ActionKind.SetTermDepositConfiguration,
            patch: {
              owner: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
              admin: "tiov1qnpaklxv4n6cam7v99hl0tg0dkmu97sh56x6uz",
              standardRates: [
                { lockinPeriod: 69, rate: { numerator: 2, denominator: 3 } },
                { lockinPeriod: 70, rate: { numerator: 5, denominator: 7 } },
              ],
              customRates: [
                {
                  address: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
                  rate: { numerator: 11, denominator: 13 },
                },
                {
                  address: "tiov1qnpaklxv4n6cam7v99hl0tg0dkmu97sh56x6uz",
                  rate: { numerator: 17, denominator: 19 },
                },
              ],
            },
          },
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
    });

    it("works with SetTxFeeConfiguration action", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            txfeeUpdateConfigurationMsg: {
              metadata: { schema: 1 },
              patch: {
                owner: fromHex("0011223344556677889900112233445566778899"),
                freeBytes: 4096,
                baseFee: {
                  whole: 10,
                  fractional: 1,
                  ticker: "CASH",
                },
              },
            },
          }).finish(),
          description: "foo bar",
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
          action: {
            kind: ActionKind.SetTxFeeConfiguration,
            patch: {
              owner: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
              freeBytes: 4096,
              baseFee: {
                fractionalDigits: 9,
                quantity: "10000000001",
                tokenTicker: "CASH" as TokenTicker,
              },
            },
          },
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
    });

    it("works with SetCashConfiguration action", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            cashUpdateConfigurationMsg: {
              metadata: { schema: 1 },
              patch: {
                owner: fromHex("0011223344556677889900112233445566778899"),
                collectorAddress: fromHex("04C3DB7CCCACF58EEFCC296FF7AD0F6DB7C2FA17"),
                minimalFee: {
                  whole: 10,
                  fractional: 1,
                  ticker: "CASH",
                },
              },
            },
          }).finish(),
          description: "foo bar",
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
          action: {
            kind: ActionKind.SetCashConfiguration,
            patch: {
              owner: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
              collectorAddress: "tiov1qnpaklxv4n6cam7v99hl0tg0dkmu97sh56x6uz",
              minimalFee: {
                fractionalDigits: 9,
                quantity: "10000000001",
                tokenTicker: "CASH" as TokenTicker,
              },
            },
          },
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
    });

    it("works with SetAccountConfiguration action", () => {
      const transactionMessage: codecImpl.bnsd.ITx = {
        govCreateProposalMsg: {
          title: "This will happen next",
          rawOption: codecImpl.bnsd.ProposalOptions.encode({
            accountUpdateConfigurationMsg: {
              metadata: { schema: 1 },
              patch: {
                owner: fromHex("0011223344556677889900112233445566778899"),
                validDomain: "regex",
                validName: "regex",
                validBlockchainId: "regex",
                validBlockchainAddress: "regex",
                domainRenew: 654321,
                domainGracePeriod: 8675309,
              },
            },
          }).finish(),
          description: "foo bar",
          electionRuleId: fromHex("000000bbccddbbff"),
          startTime: 42424242,
          author: fromHex("0011223344556677889900112233445566778899"),
        },
      };
      const decoded = decodeMsg(defaultBaseTx, transactionMessage);
      if (!isCreateProposalTx(decoded)) {
        throw new Error("unexpected transaction kind");
      }
      expect(decoded).toEqual(
        jasmine.objectContaining({
          title: "This will happen next",
          description: "foo bar",
          action: {
            kind: ActionKind.SetAccountConfiguration,
            patch: {
              owner: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
              validDomain: "regex",
              validName: "regex",
              validBlockchainId: "regex",
              validBlockchainAddress: "regex",
              domainRenew: 654321,
              domainGracePeriod: 8675309,
            },
          },
          electionRuleId: 806595967999,
          startTime: 42424242,
          author: "tiov1qqgjyv6y24n80zyeqqgjyv6y24n80zyed9d6mt",
        }),
      );
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
