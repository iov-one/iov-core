import {
  Address,
  Algorithm,
  BcpTransactionState,
  ChainId,
  isSendTransaction,
  PublicKeyBytes,
  SendTransaction,
  TokenTicker,
} from "@iov/bcp-types";
import { bnsCodec, bnsConnector, bnsFromOrToTag } from "@iov/bns";
import { Random } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { ethereumConnector } from "@iov/ethereum";
import {
  Ed25519HdWallet,
  HdPaths,
  LocalIdentity,
  PublicIdentity,
  UserProfile,
  WalletId,
} from "@iov/keycontrol";

import { MultiChainSigner } from "./multichainsigner";

// We assume the same bnsd context from iov-bns to run some simple tests
// against that backend.
// We can also add other backends as they are writen.
function pendingWithoutBnsd(): void {
  if (!process.env.BNSD_ENABLED) {
    pending("Set BNSD_ENABLED to enable bnsd-based tests");
  }
}

const pendingWithoutEthereum = () => {
  if (!process.env.ETHEREUM_ENABLED) {
    pending("Set ETHEREUM_ENABLED to enable ethereum-based tests");
  }
};

async function randomBnsAddress(): Promise<Address> {
  return bnsCodec.keyToAddress({
    algo: Algorithm.Ed25519,
    data: (await Random.getBytes(32)) as PublicKeyBytes,
  });
}

describe("MultiChainSigner", () => {
  const bnsdTendermintUrl = "ws://localhost:22345";
  const httpEthereumUrl = "http://localhost:8545";

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
    const bnsChain = "chain123" as ChainId;

    async function userProfileWithFaucet(): Promise<{
      readonly profile: UserProfile;
      readonly mainWalletId: WalletId;
      readonly faucet: LocalIdentity;
    }> {
      const wallet = Ed25519HdWallet.fromMnemonic(mnemonic);
      const profile = new UserProfile();
      profile.addWallet(wallet);
      const faucet = await profile.createIdentity(wallet.id, bnsChain, HdPaths.simpleAddress(0));
      return { profile, mainWalletId: wallet.id, faucet };
    }

    it("can send transaction", async () => {
      pendingWithoutBnsd();

      const { profile, mainWalletId, faucet } = await userProfileWithFaucet();

      const signer = new MultiChainSigner(profile);
      const { connection } = await signer.addChain(bnsConnector(bnsdTendermintUrl));
      expect(signer.chainIds().length).toEqual(1);
      const chainId = connection.chainId();

      const recipient = await randomBnsAddress();

      // construct a sendtx, this mirrors the MultiChainSigner api
      const memo = `MultiChainSigner style (${Math.random()})`;
      const sendTx: SendTransaction = {
        kind: "bcp/send",
        chainId,
        signer: faucet.pubkey,
        recipient: recipient,
        memo: memo,
        amount: {
          quantity: "11000000000777",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
      };
      const postResponse = await signer.signAndPost(sendTx, mainWalletId);
      await postResponse.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);

      // we should be a little bit richer
      const gotMoney = await connection.getAccount({ address: recipient });
      expect(gotMoney).toBeTruthy();
      expect(gotMoney.data.length).toEqual(1);
      const paid = gotMoney.data[0];
      expect(paid.balance.length).toEqual(1);
      expect(paid.balance[0].quantity).toEqual("11000000000777");

      // find the transaction we sent by comparing the memo
      const results = await connection.searchTx({ tags: [bnsFromOrToTag(recipient)] });
      expect(results.length).toBeGreaterThanOrEqual(1);
      const last = results[results.length - 1].transaction;
      if (!isSendTransaction(last)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(last.memo).toEqual(memo);
    });

    it("can add two chains", async () => {
      // this requires both chains to check
      pendingWithoutBnsd();
      pendingWithoutEthereum();

      const { profile, faucet } = await userProfileWithFaucet();
      const signer = new MultiChainSigner(profile);
      expect(signer.chainIds().length).toEqual(0);

      // add the bov chain
      await signer.addChain(bnsConnector(bnsdTendermintUrl));
      expect(signer.chainIds().length).toEqual(1);
      const bovId = signer.chainIds()[0];

      // add a ethereum chain
      await signer.addChain(ethereumConnector(httpEthereumUrl, undefined));
      const ethId = signer.chainIds()[1];
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

      const ganacheMainIdentity: PublicIdentity = {
        pubkey: {
          algo: Algorithm.Secp256k1,
          data: Encoding.fromHex(
            "04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381",
          ) as PublicKeyBytes,
        },
      };
      const ganacheAddr = signer.keyToAddress(ethId, ganacheMainIdentity.pubkey);
      const connection2 = signer.connection(ethId);
      const acct2 = await connection2.getAccount({ address: ganacheAddr });
      expect(acct2).toBeTruthy();
      expect(acct2.data.length).toBe(1);
      expect(acct2.data[0].balance.length).toBe(1);
    });
  });

  it("optionally enforces chainId", async () => {
    pendingWithoutBnsd();
    const signer = new MultiChainSigner(new UserProfile());
    const connector = bnsConnector(bnsdTendermintUrl);

    // can add with unspecified expectedChainId
    const { connection } = await signer.addChain(connector);
    const chainId = connection.chainId();
    // this should error on second add to same signer
    await signer
      .addChain(connector)
      .then(() => fail("must not resolve"))
      .catch(error => expect(error).toMatch(/is already registered/i));

    // success if adding with proper expectedChainId
    const signer2 = new MultiChainSigner(new UserProfile());
    const secureConnector = bnsConnector(bnsdTendermintUrl, chainId);
    await signer2.addChain(secureConnector);

    // error if adding with false expectedChainId
    const signer3 = new MultiChainSigner(new UserProfile());
    const invalidConnector = bnsConnector(bnsdTendermintUrl, "chain-is-not-right" as ChainId);
    await signer3
      .addChain(invalidConnector)
      .then(() => fail("must not resolve"))
      .catch(error => expect(error).toMatch(/connected chain ID does not match/i));
  });
});
