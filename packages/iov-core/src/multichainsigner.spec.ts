import { SendTx, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { bnsConnector, bnsFromOrToTag } from "@iov/bns";
import { Ed25519HdWallet, HdPaths, KeyringEntryId, LocalIdentity, UserProfile } from "@iov/keycontrol";

import { MultiChainSigner } from "./multichainsigner";

// We assume the same BOV context from iov-bns to run some simple tests
// against that backend.
// We can also add other backends as they are writen.
const pendingWithoutBov = () => {
  if (!process.env.BOV_ENABLED) {
    pending("Set BOV_ENABLED to enable bov-based tests");
  }
};

const pendingWithoutTendermint = () => {
  if (!process.env.TENDERMINT_ENABLED) {
    pending("Set TENDERMINT_ENABLED to enable tendermint-based tests");
  }
};

describe("MultiChainSigner", () => {
  it("works with no chains", () => {
    const profile = new UserProfile();
    const signer = new MultiChainSigner(profile);
    expect(signer).toBeTruthy();
    expect(signer.chainIds().length).toEqual(0);
  });

  // This uses setup from iov-bns...
  // Same secrets and assume the same blockchain scripts are running
  describe("BNS compatibility", () => {
    // the first key generated from this mneumonic produces the given address
    // this account has money in the genesis file (setup in docker)
    const mnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
    const cash = "CASH" as TokenTicker;

    // TODO: had issues with websockets? check again later, maybe they need to close at end?
    // max open connections??? (but 900 by default)
    const bovUrl = "http://localhost:22345";
    const kvstoreUrl = "http://localhost:12345";

    async function userProfileWithFaucet(): Promise<{
      readonly profile: UserProfile;
      readonly mainWalletId: KeyringEntryId;
      readonly faucet: LocalIdentity;
    }> {
      const wallet = Ed25519HdWallet.fromMnemonic(mnemonic);
      const profile = new UserProfile();
      profile.addEntry(wallet);
      const faucet = await profile.createIdentity(wallet.id, HdPaths.simpleAddress(0));
      return { profile, mainWalletId: wallet.id, faucet };
    }

    it("can send transaction", async () => {
      pendingWithoutBov();

      const { profile, mainWalletId, faucet } = await userProfileWithFaucet();

      const signer = new MultiChainSigner(profile);
      await signer.addChain(bnsConnector(bovUrl));
      expect(signer.chainIds().length).toEqual(1);
      const chainId = signer.chainIds()[0];

      const recipient = await profile.createIdentity(mainWalletId, HdPaths.simpleAddress(4));
      const recipientAddress = signer.keyToAddress(chainId, recipient.pubkey);

      // construct a sendtx, this mirrors the MultiChainSigner api
      const memo = `MultiChainSigner style (${Math.random()})`;
      const sendTx: SendTx = {
        kind: TransactionKind.Send,
        chainId,
        signer: faucet.pubkey,
        recipient: recipientAddress,
        memo: memo,
        amount: {
          whole: 11000,
          fractional: 777,
          tokenTicker: cash,
        },
      };
      const res = await signer.signAndCommit(sendTx, mainWalletId);
      expect(res.metadata.status).toEqual(true);

      // we should be a little bit richer
      const connection = signer.connection(chainId);

      const gotMoney = await connection.getAccount({ address: recipientAddress });
      expect(gotMoney).toBeTruthy();
      expect(gotMoney.data.length).toEqual(1);
      const paid = gotMoney.data[0];
      expect(paid.balance.length).toEqual(1);
      // we may post multiple times if we have multiple tests,
      // so just ensure at least one got in
      expect(paid.balance[0].whole).toBeGreaterThanOrEqual(11000);
      expect(paid.balance[0].fractional).toBeGreaterThanOrEqual(777);

      // find the transaction we sent by comparing the memo
      const results = await connection.searchTx({ tags: [bnsFromOrToTag(recipientAddress)] });
      expect(results.length).toBeGreaterThanOrEqual(1);
      const last = results[results.length - 1];
      expect(last.transaction.kind).toEqual(TransactionKind.Send);
      expect((last.transaction as SendTx).memo).toEqual(memo);
    });

    it("can add two chains", async () => {
      // this requires both chains to check
      pendingWithoutBov();
      pendingWithoutTendermint();

      const { profile, faucet } = await userProfileWithFaucet();
      const signer = new MultiChainSigner(profile);
      expect(signer.chainIds().length).toEqual(0);

      // add the bov chain
      await signer.addChain(bnsConnector(bovUrl));
      expect(signer.chainIds().length).toEqual(1);
      const bovId = signer.chainIds()[0];

      // add a raw tendermint chain (don't query, it will fail)
      await signer.addChain(bnsConnector(kvstoreUrl));
      const twoChains = signer.chainIds();
      // it should store both chains
      expect(twoChains.length).toEqual(2);
      expect(twoChains[0]).toBeDefined();
      expect(twoChains[1]).toBeDefined();
      expect(twoChains[0]).not.toEqual(twoChains[1]);

      // make sure we can query with multiple registered chains
      const faucetAddr = signer.keyToAddress(bovId, faucet.pubkey);
      const connection = signer.connection(bovId);
      const acct = await connection.getAccount({ address: faucetAddr });
      expect(acct).toBeTruthy();
      expect(acct.data.length).toBe(1);
      expect(acct.data[0].balance.length).toBe(1);
    });
  });
});
