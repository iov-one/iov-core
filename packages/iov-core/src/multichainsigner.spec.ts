import {
  Address,
  Algorithm,
  ChainId,
  Identity,
  isBlockInfoPending,
  isConfirmedTransaction,
  isSendTransaction,
  PublicKeyBytes,
  SendTransaction,
  TokenTicker,
  TransactionState,
  WithCreator,
} from "@iov/bcp";
import { bnsCodec, bnsConnector } from "@iov/bns";
import { Ed25519, Random } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { ethereumConnector } from "@iov/ethereum";
import { Ed25519HdWallet, HdPaths, Secp256k1HdWallet, UserProfile, WalletId } from "@iov/keycontrol";

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
  const rawKeypair = await Ed25519.makeKeypair(await Random.getBytes(32));
  const randomIdentity: Identity = {
    chainId: "some-testnet" as ChainId,
    pubkey: {
      algo: Algorithm.Ed25519,
      data: rawKeypair.pubkey as PublicKeyBytes,
    },
  };
  return bnsCodec.identityToAddress(randomIdentity);
}

describe("MultiChainSigner", () => {
  const bnsdTendermintUrl = "ws://localhost:23456";
  const httpEthereumUrl = "http://localhost:8545";

  it("works with no chains", () => {
    const profile = new UserProfile();
    const signer = new MultiChainSigner(profile);
    expect(signer).toBeTruthy();
    expect(signer.chainIds().length).toEqual(0);
    signer.shutdown();
  });

  // This uses setup from iov-bns...
  // Same secrets and assume the same blockchain scripts are running
  describe("BNS compatibility", () => {
    // The first IOV key (m/44'/234'/0') generated from this mnemonic produces the address
    // tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea (bech32) / a4f97447e7df55b6ef0d6209ebef2a7b22625376 (hex).
    // This account has money in the genesis file (see scripts/bnsd/README.md).
    const faucetMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
    const faucetPath = HdPaths.iov(0);

    const cash = "CASH" as TokenTicker;

    async function addWalletWithFaucet(
      profile: UserProfile,
      chainId: ChainId,
    ): Promise<{
      readonly mainWalletId: WalletId;
      readonly faucet: Identity;
    }> {
      const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(faucetMnemonic));
      const faucet = await profile.createIdentity(wallet.id, chainId, faucetPath);
      return { mainWalletId: wallet.id, faucet: faucet };
    }

    it("can send transaction", async () => {
      pendingWithoutBnsd();

      const profile = new UserProfile();
      const signer = new MultiChainSigner(profile);
      const { connection } = await signer.addChain(bnsConnector(bnsdTendermintUrl));
      expect(signer.chainIds().length).toEqual(1);
      const chainId = connection.chainId();

      const { faucet } = await addWalletWithFaucet(profile, chainId);

      const recipient = await randomBnsAddress();

      // construct a sendtx, this mirrors the MultiChainSigner api
      const memo = `MultiChainSigner style (${Math.random()})`;
      const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: faucet,
        recipient: recipient,
        memo: memo,
        amount: {
          quantity: "11000000000777",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
      });
      const postResponse = await signer.signAndPost(sendTx);
      await postResponse.blockInfo.waitFor(info => !isBlockInfoPending(info));

      // we should be a little bit richer
      const updatedAccount = await connection.getAccount({ address: recipient });
      expect(updatedAccount).toBeDefined();
      expect(updatedAccount!.balance.length).toEqual(1);
      expect(updatedAccount!.balance[0].quantity).toEqual("11000000000777");

      // find the transaction we sent by comparing the memo
      const results = (await connection.searchTx({ sentFromOrTo: recipient })).filter(isConfirmedTransaction);
      expect(results.length).toBeGreaterThanOrEqual(1);
      const last = results[results.length - 1].transaction;
      if (!isSendTransaction(last)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(last.memo).toEqual(memo);

      signer.shutdown();
    });

    it("can add two chains", async () => {
      // this requires both chains to check
      pendingWithoutBnsd();
      pendingWithoutEthereum();

      const profile = new UserProfile();
      const signer = new MultiChainSigner(profile);
      expect(signer.chainIds().length).toEqual(0);

      // add the bov chain
      await signer.addChain(bnsConnector(bnsdTendermintUrl));
      expect(signer.chainIds().length).toEqual(1);
      const bovId = signer.chainIds()[0];
      const { faucet } = await addWalletWithFaucet(profile, bovId);

      // add a ethereum chain
      await signer.addChain(ethereumConnector(httpEthereumUrl, {}));
      const ethereumChainId = signer.chainIds()[1];
      const twoChains = signer.chainIds();
      // it should store both chains
      expect(twoChains.length).toEqual(2);
      expect(twoChains[0]).toBeDefined();
      expect(twoChains[1]).toBeDefined();
      expect(twoChains[0]).not.toEqual(twoChains[1]);

      // make sure we can query with multiple registered chains
      const faucetAddr = signer.identityToAddress(faucet);
      const connection = signer.connection(bovId);
      const account = await connection.getAccount({ address: faucetAddr });
      expect(account).toBeDefined();
      expect(account!.balance.length).toEqual(1);

      const ganacheMainIdentity: Identity = {
        chainId: ethereumChainId,
        pubkey: {
          algo: Algorithm.Secp256k1,
          data: Encoding.fromHex(
            "04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381",
          ) as PublicKeyBytes,
        },
      };
      const ganacheAddr = signer.identityToAddress(ganacheMainIdentity);
      const connection2 = signer.connection(ethereumChainId);
      const account2 = await connection2.getAccount({ address: ganacheAddr });
      expect(account2).toBeDefined();
      expect(account2!.balance.length).toEqual(1);

      signer.shutdown();
    });

    it("can add two chains and send on both of them", async () => {
      pendingWithoutBnsd();
      pendingWithoutEthereum();

      const profile = new UserProfile();
      const signer = new MultiChainSigner(profile);
      expect(signer.chainIds().length).toEqual(0);

      const { connection: bnsConnection } = await signer.addChain(bnsConnector(bnsdTendermintUrl));
      await signer.addChain(ethereumConnector(httpEthereumUrl, {}));
      const [bnsId, ethereumChainId] = signer.chainIds();

      // Create sender identities
      const { faucet: bnsFaucet } = await addWalletWithFaucet(profile, bnsId);
      const secpWallet = profile.addWallet(
        Secp256k1HdWallet.fromMnemonic(
          "oxygen fall sure lava energy veteran enroll frown question detail include maximum",
        ),
      );
      const ganacheMainIdentity = await profile.createIdentity(
        secpWallet.id,
        ethereumChainId,
        HdPaths.ethereum(0),
      );

      {
        // Send on BNS
        const sendOnBns = await bnsConnection.withDefaultFee<SendTransaction & WithCreator>({
          kind: "bcp/send",
          creator: bnsFaucet,
          recipient: await randomBnsAddress(),
          memo: `MultiChainSigner style (${Math.random()})`,
          amount: {
            quantity: "11000000000777",
            fractionalDigits: 9,
            tokenTicker: cash,
          },
        });
        const postResponse = await signer.signAndPost(sendOnBns);
        const blockInfo = await postResponse.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      {
        // Send on Ethereum
        const sendOnEthereum: SendTransaction & WithCreator = {
          kind: "bcp/send",
          creator: ganacheMainIdentity,
          amount: {
            quantity: "1",
            tokenTicker: "ETH" as TokenTicker,
            fractionalDigits: 18,
          },
          recipient: "0x0000000000000000000000000000000000000000" as Address,
          memo: `MultiChainSigner style (${Math.random()})`,
          // TODO: shall we use getFeeQuote here?
          fee: {
            gasPrice: {
              quantity: "20000000000",
              fractionalDigits: 18,
              tokenTicker: "ETH" as TokenTicker,
            },
            gasLimit: "2100000",
          },
        };
        const postResponse = await signer.signAndPost(sendOnEthereum);
        const blockInfo = await postResponse.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      signer.shutdown();
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

    signer.shutdown();
    signer2.shutdown();
    signer3.shutdown();
  });

  describe("isValidAddress", () => {
    it("can use isValidAddress for BNS and Ethereum", async () => {
      pendingWithoutBnsd();
      pendingWithoutEthereum();

      const signer = new MultiChainSigner(new UserProfile());

      const bnsConnection = (await signer.addChain(bnsConnector(bnsdTendermintUrl))).connection;
      const ethereumConnection = (await signer.addChain(ethereumConnector(httpEthereumUrl, {}))).connection;

      const bnsChainId = bnsConnection.chainId();
      const ethereumChainId = ethereumConnection.chainId();

      // valid
      expect(signer.isValidAddress(bnsChainId, "tiov142424242424242424242424242424242vmucnv")).toEqual(true);
      expect(signer.isValidAddress(ethereumChainId, "0x890b61ca61fa5b5336bb3ec142fa0da250592337")).toEqual(
        true,
      );

      // invalid
      expect(signer.isValidAddress(bnsChainId, "")).toEqual(false);
      expect(signer.isValidAddress(ethereumChainId, "")).toEqual(false);
      expect(signer.isValidAddress(bnsChainId, "123")).toEqual(false);
      expect(signer.isValidAddress(ethereumChainId, "123")).toEqual(false);

      // wrong chains
      expect(signer.isValidAddress(ethereumChainId, "tiov142424242424242424242424242424242vmucnv")).toEqual(
        false,
      );
      expect(signer.isValidAddress(bnsChainId, "0x890b61ca61fa5b5336bb3ec142fa0da250592337")).toEqual(false);

      signer.shutdown();
    });
  });
});
