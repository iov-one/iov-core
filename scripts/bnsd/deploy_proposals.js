/* eslint-disable @typescript-eslint/no-var-requires */
const { isBlockInfoPending, isBlockInfoSucceeded } = require("@iov/bcp");
const { bnsCodec, BnsConnection, VoteOption } = require("@iov/bns");
const { /* committeeIds, guaranteeFundEscrowIds, */ Governor, ProposalType } = require("@iov/bns-governance");
const { Ed25519HdWallet, HdPaths, UserProfile } = require("@iov/keycontrol");

// Dev admin
// path: m/44'/234'/0'
// pubkey: 418f88ff4876d33a3d6e2a17d0fe0e78dc3cb5e4b42c6c156ed1b8bfce5d46d1
// IOV address: tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea
// This account has money in the genesis file (see scripts/bnsd/README.md).
const adminMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
const adminPath = HdPaths.iov(0);
const committeeId = 2;
const electionRuleId = 2;
const bnsdUrl = "ws://localhost:23456";
const connectionPromise = BnsConnection.establish(bnsdUrl);

function createSignAndPoster(connection, profile) {
  return async function signAndPost(tx) {
    const nonce = await connection.getNonce({ pubkey: tx.creator.pubkey });
    const signed = await profile.signTransaction(tx, bnsCodec, nonce);
    const txBytes = bnsCodec.bytesToPost(signed);
    const post = await connection.postTx(txBytes);
    const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo)) {
      throw new Error("Transaction failed", tx);
    }
  };
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const connection = await connectionPromise;
  const chainId = await connection.chainId();
  const profile = new UserProfile();
  const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(adminMnemonic));
  const identity = await profile.createIdentity(wallet.id, chainId, adminPath);
  const signAndPost = createSignAndPoster(connection, profile);

  const governorOptions = {
    connection: connection,
    identity: identity,
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
      type: ProposalType.AmendProtocol,
      title: "Amend protocol",
      description: "Amend the protocol in more detail",
      electionRuleId: electionRuleId,
      text: "Give IOV devs master keys to all accounts",
    },
  ];

  for (let i = 0; i < proposalOptions.length; ++i) {
    const createProposalTx = await governor.buildCreateProposalTx({
      ...proposalOptions[i],
      startTime: new Date(Date.now() + 1000),
    });
    await signAndPost(createProposalTx);

    await sleep(7000);

    // Vote on 2/3 of the proposals
    if (i % 3) {
      const proposals = await governor.getProposals();
      const voteTx = await governor.buildVoteTx(
        proposals[proposals.length - 1].id,
        // Vote Yes 1/2 of the time, No for the other 1/2
        i % 2 ? VoteOption.Yes : VoteOption.No,
      );
      await signAndPost(voteTx);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    (await connectionPromise).disconnect();
    process.exit(0);
  });
