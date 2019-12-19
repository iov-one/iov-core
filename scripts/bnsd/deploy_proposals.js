/* eslint-disable @typescript-eslint/no-var-requires */
const { isBlockInfoPending, isBlockInfoSucceeded } = require("@iov/bcp");
const { bnsCodec, BnsConnection, VoteOption } = require("@iov/bns");
const { Governor, ProposalType } = require("@iov/bns-governance");
const { Encoding } = require("@iov/encoding");
const { Ed25519HdWallet, HdPaths, UserProfile } = require("@iov/keycontrol");
const { sleep } = require("@iov/utils");

// Dev admin
// path: m/44'/234'/0'
// pubkey: 418f88ff4876d33a3d6e2a17d0fe0e78dc3cb5e4b42c6c156ed1b8bfce5d46d1
// IOV address: tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea
// This account has money in the genesis file (see scripts/bnsd/README.md).
const adminMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
const adminPath = HdPaths.iov(0);
const committeeId = 2;
const electionRuleId = process.env.ELECTION_RULE_ID ? parseInt(process.env.ELECTION_RULE_ID, 10) : 3;
const bnsdUrl = "ws://localhost:23456";
const connectionPromise = BnsConnection.establish(bnsdUrl);

function createSignAndPoster(connection, profile) {
  return async function signAndPost(identity, tx) {
    const nonce = await connection.getNonce({ pubkey: identity.pubkey });
    const signed = await profile.signTransaction(identity, tx, bnsCodec, nonce);
    const txBytes = bnsCodec.bytesToPost(signed);
    const post = await connection.postTx(txBytes);
    const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo)) {
      throw new Error("Transaction failed", tx);
    }
  };
}

async function main() {
  const connection = await connectionPromise;
  const chainId = await connection.chainId();
  const profile = new UserProfile();
  const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(adminMnemonic));
  const identity = await profile.createIdentity(wallet.id, chainId, adminPath);
  const senderAddress = bnsCodec.identityToAddress(identity);
  const guaranteeFundEscrowId = Encoding.fromHex("0000000000000001");
  const rewardFundAddress = "tiov1k0dp2fmdunscuwjjusqtk6mttx5ufk3z0mmp0z";
  const signAndPost = createSignAndPoster(connection, profile);

  const initialTxForReward = await connection.withDefaultFee(
    {
      kind: "bcp/send",
      recipient: rewardFundAddress,
      chainId: chainId,
      sender: senderAddress,
      amount: {
        quantity: "10000000000",
        fractionalDigits: 9,
        tokenTicker: "CASH",
      },
    },
    senderAddress,
  );

  await signAndPost(identity, initialTxForReward);

  const governorOptions = {
    connection,
    identity,
    guaranteeFundEscrowId,
    rewardFundAddress,
  };
  const governor = new Governor(governorOptions);

  const proposalOptions = [
    {
      type: ProposalType.AddCommitteeMember,
      title: "Add committee member",
      description: "Add a committee member in more detail",
      electionRuleId: electionRuleId,
      committee: committeeId,
      address: "tiov12shyht3pvvacvyee36w5844jkfh5s0mf4gszp9",
      weight: 3,
    },
    {
      type: ProposalType.RemoveCommitteeMember,
      title: "Remove committee member",
      description: "Remove a committee member in more detail",
      electionRuleId: electionRuleId,
      committee: committeeId,
      address: "tiov18mgvcwg4339w40ktv0hmmln80ttvza2n6hjaxh",
    },
    {
      type: ProposalType.AmendElectionRuleThreshold,
      title: "Amend election rule threshold",
      description: "Amend the election rule threshold in more detail",
      electionRuleId: electionRuleId,
      targetElectionRuleId: electionRuleId,
      threshold: {
        numerator: 3,
        denominator: 4,
      },
    },
    {
      type: ProposalType.AmendElectionRuleQuorum,
      title: "Amend election rule quorum",
      description: "Amend the election rule quorum in more detail",
      electionRuleId: electionRuleId,
      targetElectionRuleId: electionRuleId,
      quorum: {
        numerator: 4,
        denominator: 7,
      },
    },
    {
      type: ProposalType.AddValidator,
      title: "Add validator",
      description: "Add a validator in more detail",
      electionRuleId: electionRuleId,
      pubkey: identity.pubkey,
      power: 2,
    },
    {
      type: ProposalType.RemoveValidator,
      title: "Remove validator",
      description: "Remove a validator in more detail",
      electionRuleId: electionRuleId,
      pubkey: identity.pubkey,
    },
    {
      type: ProposalType.ReleaseGuaranteeFunds,
      title: "Release guarantee funds",
      description: "Release guarantee funds in more detail",
      electionRuleId: electionRuleId,
      amount: {
        quantity: "10000000000",
        fractionalDigits: 9,
        tokenTicker: "CASH",
      },
    },
    {
      type: ProposalType.DistributeFunds,
      title: "Distribute funds",
      description: "Distribute funds in more detail",
      electionRuleId: electionRuleId,
      recipients: [
        {
          address: "tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea",
          weight: 2,
        },
        {
          address: "tiov12shyht3pvvacvyee36w5844jkfh5s0mf4gszp9",
          weight: 1,
        },
      ],
    },
    {
      type: ProposalType.AmendProtocol,
      title: "Amend protocol",
      description:
        "Amend the protocol in more detail. With a long text: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse id sagittis sapien. Fusce erat augue, sollicitudin sed odio ac, volutpat viverra sapien. Mauris tempus dolor leo, egestas laoreet urna blandit non. Cras dignissim libero turpis, id tincidunt tortor maximus eu. Donec risus lorem, vehicula in nulla sit amet, semper feugiat felis. Phasellus efficitur lectus non lorem ultrices sollicitudin. Quisque a lectus nec turpis fermentum ultrices a in lectus. Aliquam sit amet sem vel velit molestie porta vitae et nisl. Duis ac magna varius, vehicula lectus ut, tristique quam. Aenean elementum in mauris et eleifend. Vivamus quis tortor et felis scelerisque pellentesque. Donec pellentesque mi et turpis maximus rutrum.",
      electionRuleId: electionRuleId,
      text:
        "Give IOV devs master keys to all accounts. With a long text: Phasellus pharetra tellus facilisis mi rutrum, vitae semper ligula elementum. Phasellus ut ex sit amet dui consequat commodo vel sed tellus. Vivamus non urna quam. Aliquam consectetur arcu at mauris rutrum, eu mattis lorem euismod. Curabitur nisi arcu, gravida eu tempus congue, auctor ut dui. Proin semper tellus sem, et elementum nunc eleifend eget. Quisque molestie sodales orci. Aliquam elementum pellentesque nisi quis tempus. Sed sollicitudin, velit non viverra condimentum, libero neque facilisis urna, ac rutrum ante mi ac tortor. Maecenas ac lorem mattis, volutpat lacus ut, mattis tellus. Vivamus at mauris quam. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
    },
  ];

  for (let i = 0; i < proposalOptions.length; ++i) {
    const createProposalTx = await governor.buildCreateProposalTx({
      ...proposalOptions[i],
      startTime: new Date(Date.now() + 1000),
    });
    await signAndPost(identity, createProposalTx);

    await sleep(7000);

    // Vote on 2/3 of the proposals
    if (i % 3) {
      const proposals = await governor.getProposals();
      const voteTx = await governor.buildVoteTx(
        proposals[proposals.length - 1].id,
        // Vote Yes 1/2 of the time, No for the other 1/2
        i % 2 ? VoteOption.Yes : VoteOption.No,
      );
      await signAndPost(identity, voteTx);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    (await connectionPromise).disconnect();
    process.exit(0);
  });
