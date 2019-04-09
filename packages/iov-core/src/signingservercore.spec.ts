import {
  Address,
  Algorithm,
  Amount,
  BlockchainConnection,
  ChainId,
  isBlockInfoPending,
  isPublicIdentity,
  PublicIdentity,
  PublicKeyBytes,
  SendTransaction,
  TokenTicker,
  UnsignedTransaction,
} from "@iov/bcp";
import { bnsCodec, bnsConnector } from "@iov/bns";
import { Ed25519, Random } from "@iov/crypto";
import { Ed25519HdWallet, HdPaths, UserProfile } from "@iov/keycontrol";

import { MultiChainSigner } from "./multichainsigner";
import { GetIdentitiesAuthorization, SignAndPostAuthorization, SigningServerCore } from "./signingservercore";

function pendingWithoutBnsd(): void {
  if (!process.env.BNSD_ENABLED) {
    pending("Set BNSD_ENABLED to enable bnsd-based tests");
  }
}

async function randomBnsAddress(): Promise<Address> {
  const rawKeypair = await Ed25519.makeKeypair(await Random.getBytes(32));
  const randomIdentity: PublicIdentity = {
    chainId: "some-testnet" as ChainId,
    pubkey: {
      algo: Algorithm.Ed25519,
      data: rawKeypair.pubkey as PublicKeyBytes,
    },
  };
  return bnsCodec.identityToAddress(randomIdentity);
}

describe("SigningServerCore", () => {
  const bnsdUrl = "ws://localhost:23456";

  // The first simple address key (m/4804438'/0') generated from this mnemonic produces the address
  // tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f (bech32) / b1ca7e78f74423ae01da3b51e676934d9105f282 (hex).
  // This account has money in the genesis file (setup in docker).
  const faucetMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
  const faucetPath = HdPaths.simpleAddress(0);

  const minimalFee: Amount = {
    quantity: "10000000",
    fractionalDigits: 9,
    tokenTicker: "CASH" as TokenTicker,
  };
  const defaultAmount: Amount = {
    quantity: "1",
    fractionalDigits: 9,
    tokenTicker: "CASH" as TokenTicker,
  };
  const defaultChainId = "some-network" as ChainId;
  const defaultGetIdentitiesCallback: GetIdentitiesAuthorization = async (_, matching) => matching;
  const defaultSignAndPostCallback: SignAndPostAuthorization = async (_1, _2) => true;

  async function userProfileWithFaucet(
    chainId: ChainId,
  ): Promise<{ readonly profile: UserProfile; readonly faucet: PublicIdentity }> {
    const profile = new UserProfile();
    const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(faucetMnemonic));
    const faucet = await profile.createIdentity(wallet.id, chainId, faucetPath);
    return { profile: profile, faucet: faucet };
  }

  async function sendTokensFromFaucet(
    connection: BlockchainConnection,
    recipient: Address | PublicIdentity,
    amount: Amount = defaultAmount,
  ): Promise<void> {
    const { profile, faucet } = await userProfileWithFaucet(connection.chainId());

    const sendTx = await connection.withDefaultFee<SendTransaction>({
      kind: "bcp/send",
      creator: faucet,
      recipient: isPublicIdentity(recipient) ? bnsCodec.identityToAddress(recipient) : recipient,
      amount: amount,
    });
    const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
    const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
    const response = await connection.postTx(bnsCodec.bytesToPost(signed));
    await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
  }

  it("can be constructed", () => {
    const profile = new UserProfile();
    const signer = new MultiChainSigner(profile);
    const core = new SigningServerCore(
      profile,
      signer,
      defaultGetIdentitiesCallback,
      defaultSignAndPostCallback,
    );
    expect(core).toBeTruthy();
    core.shutdown();
  });

  describe("getIdentities", () => {
    it("can get identities", async () => {
      const profile = new UserProfile();
      const wallet = profile.addWallet(
        Ed25519HdWallet.fromMnemonic(
          "option diagram plastic million educate they arrow fat comic excite abandon green",
        ),
      );
      const identity0 = await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(0));
      const identity1 = await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(1));

      const signer = new MultiChainSigner(profile);
      const core = new SigningServerCore(
        profile,
        signer,
        defaultGetIdentitiesCallback,
        defaultSignAndPostCallback,
      );

      const revealedIdentities = await core.getIdentities("Login to XY service", [defaultChainId]);
      expect(revealedIdentities).toEqual([identity0, identity1]);

      core.shutdown();
    });

    it("can get some selected identities", async () => {
      const profile = new UserProfile();
      const wallet = profile.addWallet(
        Ed25519HdWallet.fromMnemonic(
          "option diagram plastic million educate they arrow fat comic excite abandon green",
        ),
      );

      const identities: ReadonlyArray<PublicIdentity> = [
        await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(0)),
        await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(1)),
        await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(2)),
        await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(3)),
      ];

      async function selectEvenIdentitiesCallback(
        _: string,
        matchingIdentities: ReadonlyArray<PublicIdentity>,
      ): Promise<ReadonlyArray<PublicIdentity>> {
        // select all even identities
        return matchingIdentities.filter((_1, index) => index % 2 === 0);
      }

      const signer = new MultiChainSigner(profile);
      const core = new SigningServerCore(
        profile,
        signer,
        selectEvenIdentitiesCallback,
        defaultSignAndPostCallback,
      );

      const revealedIdentities = await core.getIdentities("Login to XY service", [defaultChainId]);
      expect(revealedIdentities).toEqual([identities[0], identities[2]]);

      core.shutdown();
    });

    it("can get no identities", async () => {
      const profile = new UserProfile();
      const wallet = profile.addWallet(
        Ed25519HdWallet.fromMnemonic(
          "option diagram plastic million educate they arrow fat comic excite abandon green",
        ),
      );

      await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(0));
      await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(1));
      await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(2));
      await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(3));

      async function selectNoIdentityCallback(
        _1: string,
        _2: ReadonlyArray<PublicIdentity>,
      ): Promise<ReadonlyArray<PublicIdentity>> {
        return [];
      }

      const signer = new MultiChainSigner(profile);
      const core = new SigningServerCore(
        profile,
        signer,
        selectNoIdentityCallback,
        defaultSignAndPostCallback,
      );

      const revealedIdentities = await core.getIdentities("Login to XY service", [defaultChainId]);
      expect(revealedIdentities).toEqual([]);

      core.shutdown();
    });

    it("can get identities from multiple chains", async () => {
      const xnet = "xnet" as ChainId;
      const ynet = "ynet" as ChainId;

      const profile = new UserProfile();
      const walletA = profile.addWallet(
        Ed25519HdWallet.fromMnemonic(
          "option diagram plastic million educate they arrow fat comic excite abandon green",
        ),
      );
      const idA0 = await profile.createIdentity(walletA.id, ynet, HdPaths.simpleAddress(0));
      const idA1 = await profile.createIdentity(walletA.id, xnet, HdPaths.simpleAddress(1));

      const walletB = profile.addWallet(
        Ed25519HdWallet.fromMnemonic(
          "add critic turtle frown attract shop answer cook social wagon humble power",
        ),
      );
      const idB0 = await profile.createIdentity(walletB.id, xnet, HdPaths.simpleAddress(0));
      const idB1 = await profile.createIdentity(walletB.id, ynet, HdPaths.simpleAddress(1));
      const idB2 = await profile.createIdentity(walletB.id, xnet, HdPaths.simpleAddress(2));

      const signer = new MultiChainSigner(profile);
      const core = new SigningServerCore(
        profile,
        signer,
        defaultGetIdentitiesCallback,
        defaultSignAndPostCallback,
      );

      const ynetIdentities = await core.getIdentities("Login to XY service", [ynet]);
      expect(ynetIdentities).toEqual([idA0, idB1]);

      const xnetIdentities = await core.getIdentities("Login to XY service", [xnet]);
      expect(xnetIdentities).toEqual([idA1, idB0, idB2]);

      const xnetOrYnetIdentities = await core.getIdentities("Login to XY service", [xnet, ynet]);
      expect(xnetOrYnetIdentities).toEqual([idA0, idA1, idB0, idB1, idB2]);

      core.shutdown();
    });

    it("handles exceptions in callback", async () => {
      const profile = new UserProfile();
      const wallet = profile.addWallet(
        Ed25519HdWallet.fromMnemonic(
          "option diagram plastic million educate they arrow fat comic excite abandon green",
        ),
      );

      await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(0));
      await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(1));
      await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(2));
      await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(3));

      async function throwingCallback(
        _1: string,
        _2: ReadonlyArray<PublicIdentity>,
      ): Promise<ReadonlyArray<PublicIdentity>> {
        throw new Error("Something broken in here!");
      }

      const signer = new MultiChainSigner(profile);
      const core = new SigningServerCore(profile, signer, throwingCallback, defaultSignAndPostCallback);

      await core
        .getIdentities("Login to XY service", [defaultChainId])
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/internal server error/i));

      core.shutdown();
    });
  });

  describe("signAndPost", () => {
    it("can sign and post", async () => {
      pendingWithoutBnsd();

      const profile = new UserProfile();
      const signer = new MultiChainSigner(profile);
      const { connection } = await signer.addChain(bnsConnector(bnsdUrl));
      const bnsChain = connection.chainId();

      {
        const wallet = profile.addWallet(
          Ed25519HdWallet.fromMnemonic(
            "option diagram plastic million educate they arrow fat comic excite abandon green",
          ),
        );
        await profile.createIdentity(wallet.id, bnsChain, HdPaths.simpleAddress(0));
      }

      const core = new SigningServerCore(
        profile,
        signer,
        defaultGetIdentitiesCallback,
        defaultSignAndPostCallback,
      );

      const [signingIdentity] = await core.getIdentities("Please select signer", [bnsChain]);

      await sendTokensFromFaucet(connection, signingIdentity, minimalFee);

      const send = await connection.withDefaultFee<SendTransaction>({
        kind: "bcp/send",
        creator: signingIdentity,
        amount: defaultAmount,
        recipient: await randomBnsAddress(),
      });
      const transactionId = await core.signAndPost("Please sign now", send);
      expect(transactionId).toBeDefined();
      expect(transactionId).toMatch(/^[0-9A-F]{64}$/);

      core.shutdown();
    });

    it("can handle rejected sign and post request", async () => {
      pendingWithoutBnsd();

      const profile = new UserProfile();
      const signer = new MultiChainSigner(profile);
      const { connection } = await signer.addChain(bnsConnector(bnsdUrl));
      const bnsChain = connection.chainId();

      {
        const wallet = profile.addWallet(
          Ed25519HdWallet.fromMnemonic(
            "option diagram plastic million educate they arrow fat comic excite abandon green",
          ),
        );
        await profile.createIdentity(wallet.id, bnsChain, HdPaths.simpleAddress(1));
      }

      async function rejectAllTransactions(_1: string, _2: UnsignedTransaction): Promise<boolean> {
        return false;
      }

      const core = new SigningServerCore(
        profile,
        signer,
        defaultGetIdentitiesCallback,
        rejectAllTransactions,
      );

      const identities = await core.getIdentities("Please select signer", [bnsChain]);
      const signingIdentity = identities[0];
      const send: SendTransaction = {
        kind: "bcp/send",
        creator: signingIdentity,
        amount: defaultAmount,
        recipient: await randomBnsAddress(),
      };
      const transactionId = await core.signAndPost("Please sign now", send);
      expect(transactionId).toBeUndefined();

      core.shutdown();
    });

    it("handles exceptions in callback", async () => {
      pendingWithoutBnsd();

      const profile = new UserProfile();
      const signer = new MultiChainSigner(profile);
      const { connection } = await signer.addChain(bnsConnector(bnsdUrl));
      const bnsChain = connection.chainId();

      {
        const wallet = profile.addWallet(
          Ed25519HdWallet.fromMnemonic(
            "option diagram plastic million educate they arrow fat comic excite abandon green",
          ),
        );
        await profile.createIdentity(wallet.id, bnsChain, HdPaths.simpleAddress(0));
      }

      async function throwingCallback(_1: string, _2: UnsignedTransaction): Promise<boolean> {
        throw new Error("Something broken in here!");
      }
      const core = new SigningServerCore(profile, signer, defaultGetIdentitiesCallback, throwingCallback);
      const [signingIdentity] = await core.getIdentities("Please select signer", [bnsChain]);

      const send: SendTransaction = {
        kind: "bcp/send",
        creator: signingIdentity,
        amount: defaultAmount,
        recipient: await randomBnsAddress(),
      };
      await core
        .signAndPost("Please sign now", send)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/internal server error/i));

      core.shutdown();
    });
  });
});
