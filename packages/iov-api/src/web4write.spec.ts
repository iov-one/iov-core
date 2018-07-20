import { Ed25519SimpleAddressKeyringEntry, LocalIdentity, UserProfile } from "@iov/keycontrol";
import { SendTx, TokenTicker, TransactionKind } from "@iov/types";

import { bnsConnector, Web4Write, withConnectors } from "./web4write";

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
      await profile.createIdentity(0);
      return profile;
    };

    const faucetId = (profile: UserProfile): LocalIdentity => {
      const ids = profile.getIdentities(0);
      expect(ids.length).toBeGreaterThanOrEqual(1);
      return ids[0];
    };

    // recipient will make accounts if needed, returns path n
    // n must be >= 1
    const recipient = async (profile: UserProfile, n: number): Promise<LocalIdentity> => {
      if (n < 1) {
        throw new Error("Recipient count starts at 1");
      }
      while (profile.getIdentities(0).length < n + 1) {
        await profile.createIdentity(0);
      }
      return profile.getIdentities(0)[n];
    };

    // // accountTag should be exposed, ugly way to generate tx search strings....
    // const accountTag = (addr: AddressBytes, bucket: string = "wllt", value: string = "s"): Tag => {
    //   const id = Uint8Array.from([...Encoding.toAscii(bucket + ":"), ...addr]);
    //   const key = Encoding.toHex(id).toUpperCase();
    //   return { key, value };
    // };

    it("can send transaction", async () => {
      pendingWithoutBov();

      const knownChains = await withConnectors(await bnsConnector(bovUrl));
      const profile = await userProfile();
      const writer = new Web4Write(profile, knownChains);
      expect(writer.chainIds().length).toEqual(1);
      const chainId = writer.chainIds()[0];

      const faucet = faucetId(profile);
      const rcpt = await recipient(profile, 4);
      const rcptAddr = writer.keyToAddress(chainId, rcpt.pubkey);

      // construct a sendtx, this should be in the web4wrtie api
      const sendTx: SendTx = {
        kind: TransactionKind.SEND,
        chainId,
        signer: faucet.pubkey,
        recipient: rcptAddr,
        memo: "Web4 write style",
        amount: {
          whole: 11000,
          fractional: 777,
          tokenTicker: cash,
        },
      };
      const res = await writer.signAndCommit(sendTx, 0);
      expect(res.metadata.status).toBe(true);

      // we should be a little bit richer
      const reader = writer.reader(chainId);

      const gotMoney = await reader.getAccount({ address: rcptAddr });
      expect(gotMoney).toBeTruthy();
      expect(gotMoney.data.length).toEqual(1);
      const paid = gotMoney.data[0];
      expect(paid.balance.length).toEqual(1);
      // we may post multiple times if we have multiple tests,
      // so just ensure at least one got in
      expect(paid.balance[0].whole).toBeGreaterThanOrEqual(11000);
      expect(paid.balance[0].fractional).toBeGreaterThanOrEqual(777);

      // // now verify we can query the same tx back
      // // FIXME: make this cleaner somehow....
      // const txQuery = { tags: [accountTag(rcptAddr)] };
      // const search = await client.searchTx(txQuery);
      // expect(search.length).toBeGreaterThanOrEqual(1);
      // // make sure we get a valid signature
      // const mine = search[search.length - 1];
      // expect(mine.primarySignature.nonce).toEqual(nonce);
      // expect(mine.primarySignature.signature.length).toBeTruthy();
      // expect(mine.otherSignatures.length).toEqual(0);
      // const tx = mine.transaction;
      // expect(tx.kind).toEqual(sendTx.kind);
      // expect(tx).toEqual(sendTx);
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
      const tm = await bnsConnector(kvstoreUrl);
      await writer.addChain(tm);
      expect(writer.chainIds().length).toEqual(2);

      // make sure we can query with multiple registered chains
      const faucetAddr = writer.keyToAddress(bovId, faucetId(profile).pubkey);
      const reader = writer.reader(bovId);
      const acct = await reader.getAccount({ address: faucetAddr });
      expect(acct).toBeTruthy();
      expect(acct.data.length).toBe(1);
      expect(acct.data[0].balance.length).toBe(1);
    });
  });
});
