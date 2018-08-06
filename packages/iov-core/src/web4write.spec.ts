import { SendTx, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Ed25519SimpleAddressKeyringEntry, LocalIdentity, UserProfile } from "@iov/keycontrol";

import { bnsConnector, bnsFromOrToTag, Web4Write, withConnectors } from "./web4write";

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

describe("Web4Write", () => {
  it("can be constructed with no chains", () => {
    const profile = new UserProfile();
    const writer = new Web4Write(profile, []);
    expect(writer).toBeTruthy();
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

    const userProfile = async (): Promise<UserProfile> => {
      const profile = new UserProfile();
      profile.addEntry(Ed25519SimpleAddressKeyringEntry.fromMnemonic(mnemonic));
      return profile;
    };

    // will make identities if needed.
    // index `i` is the same as in https://github.com/iov-one/web4/blob/392234e/docs/KeyBase.md#simple-addresses
    const getOrCreateIdentity = async (profile: UserProfile, i: number): Promise<LocalIdentity> => {
      while (profile.getIdentities(0).length < i + 1) {
        await profile.createIdentity(0);
      }
      return profile.getIdentities(0)[i];
    };

    it("can send transaction", async () => {
      pendingWithoutBov();

      const knownChains = await withConnectors(await bnsConnector(bovUrl));
      const profile = await userProfile();
      const writer = new Web4Write(profile, knownChains);
      expect(writer.chainIds().length).toEqual(1);
      const chainId = writer.chainIds()[0];

      const faucet = await getOrCreateIdentity(profile, 0);
      const recipient = await getOrCreateIdentity(profile, 4);
      const recipientAddress = writer.keyToAddress(chainId, recipient.pubkey);

      // construct a sendtx, this should be in the web4wrtie api
      const memo = `Web4 write style (${Math.random()})`;
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
      const res = await writer.signAndCommit(sendTx, 0);
      expect(res.metadata.status).toEqual(true);

      // we should be a little bit richer
      const reader = writer.reader(chainId);

      const gotMoney = await reader.getAccount({ address: recipientAddress });
      expect(gotMoney).toBeTruthy();
      expect(gotMoney.data.length).toEqual(1);
      const paid = gotMoney.data[0];
      expect(paid.balance.length).toEqual(1);
      // we may post multiple times if we have multiple tests,
      // so just ensure at least one got in
      expect(paid.balance[0].whole).toBeGreaterThanOrEqual(11000);
      expect(paid.balance[0].fractional).toBeGreaterThanOrEqual(777);

      // find the transaction we sent by comparing the memo
      const results = await reader.searchTx({ tags: [bnsFromOrToTag(recipientAddress)] });
      expect(results.length).toBeGreaterThanOrEqual(1);
      const last = results[results.length - 1];
      expect(last.transaction.kind).toEqual(TransactionKind.Send);
      expect((last.transaction as SendTx).memo).toEqual(memo);
    });

    it("can add chains", async () => {
      // this requires both chains to check
      pendingWithoutBov();
      pendingWithoutTendermint();

      const profile = await userProfile();
      const writer = new Web4Write(profile, []);
      expect(writer.chainIds().length).toEqual(0);

      // add the bov chain
      const bov = await bnsConnector(bovUrl);
      await writer.addChain(bov);
      expect(writer.chainIds().length).toEqual(1);
      const bovId = writer.chainIds()[0];

      // add a raw tendermint chain (don't query, it will fail)
      const tendermint = await bnsConnector(kvstoreUrl);
      await writer.addChain(tendermint);
      expect(writer.chainIds().length).toEqual(2);

      // make sure we can query with multiple registered chains
      const faucet = await getOrCreateIdentity(profile, 0);
      const faucetAddr = writer.keyToAddress(bovId, faucet.pubkey);
      const reader = writer.reader(bovId);
      const acct = await reader.getAccount({ address: faucetAddr });
      expect(acct).toBeTruthy();
      expect(acct.data.length).toBe(1);
      expect(acct.data[0].balance.length).toBe(1);
    });
  });
});
