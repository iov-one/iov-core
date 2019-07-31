import {
  Address,
  Algorithm,
  Amount,
  BlockchainConnection,
  ChainId,
  Identity,
  isBlockInfoPending,
  isIdentity,
  PubkeyBytes,
  SendTransaction,
  TokenTicker,
  TransactionState,
  UnsignedTransaction,
  WithCreator,
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
  const randomIdentity: Identity = {
    chainId: "some-testnet" as ChainId,
    pubkey: {
      algo: Algorithm.Ed25519,
      data: rawKeypair.pubkey as PubkeyBytes,
    },
  };
  return bnsCodec.identityToAddress(randomIdentity);
}

describe("SigningServerCore", () => {
  const bnsdUrl = "ws://localhost:23456";

  // untouched in the sense that there are no balances on the derived accounts
  const untouchedMnemonicA = "culture speed parent picture lock inquiry around pizza bleak leaf fish hand";
  const untouchedMnemonicB = "muffin width month typical depth boost beauty surface orphan cage youth rack";

  // Dev faucet
  // path: m/1229936198'/1'/0'/0'
  // pubkey: e05f47e7639b47625c23738e2e46d092819abd6039c5fc550d9aa37f1a2556a1
  // IOV address: tiov1q5lyl7asgr2dcweqrhlfyexqpkgcuzrm4e0cku
  // This account has money in the genesis file (see scripts/bnsd/README.md).
  const faucetMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
  const faucetPath = HdPaths.iovFaucet();

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
  const defaultGetIdentitiesCallback: GetIdentitiesAuthorization = async (
    _,
    matching,
  ): Promise<readonly Identity[]> => matching;
  const defaultSignAndPostCallback: SignAndPostAuthorization = async (_1, _2): Promise<boolean> => true;

  async function sendTokensFromFaucet(
    connection: BlockchainConnection,
    recipient: Address | Identity,
    amount: Amount = defaultAmount,
  ): Promise<void> {
    const profile = new UserProfile();
    const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(faucetMnemonic));
    const faucet = await profile.createIdentity(wallet.id, connection.chainId(), faucetPath);

    const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
      kind: "bcp/send",
      creator: faucet,
      sender: bnsCodec.identityToAddress(faucet),
      recipient: isIdentity(recipient) ? bnsCodec.identityToAddress(recipient) : recipient,
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
      const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(untouchedMnemonicA));
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
      const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(untouchedMnemonicA));

      const identities: readonly Identity[] = [
        await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(0)),
        await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(1)),
        await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(2)),
        await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(3)),
      ];

      async function selectEvenIdentitiesCallback(
        _: string,
        matchingIdentities: readonly Identity[],
      ): Promise<readonly Identity[]> {
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
      const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(untouchedMnemonicA));

      await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(0));
      await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(1));
      await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(2));
      await profile.createIdentity(wallet.id, defaultChainId, HdPaths.iov(3));

      async function selectNoIdentityCallback(
        _1: string,
        _2: readonly Identity[],
      ): Promise<readonly Identity[]> {
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
      const walletA = profile.addWallet(Ed25519HdWallet.fromMnemonic(untouchedMnemonicA));
      const idA0 = await profile.createIdentity(walletA.id, ynet, HdPaths.iov(0));
      const idA1 = await profile.createIdentity(walletA.id, xnet, HdPaths.iov(1));

      const walletB = profile.addWallet(Ed25519HdWallet.fromMnemonic(untouchedMnemonicB));
      const idB0 = await profile.createIdentity(walletB.id, xnet, HdPaths.iov(0));
      const idB1 = await profile.createIdentity(walletB.id, ynet, HdPaths.iov(1));
      const idB2 = await profile.createIdentity(walletB.id, xnet, HdPaths.iov(2));

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

      async function throwingCallback(_1: string, _2: readonly Identity[]): Promise<readonly Identity[]> {
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

    it("logs exceptions in callback", async () => {
      const logger = { log: (_error: any) => 0 };
      spyOn(logger, "log");

      const profile = new UserProfile();

      async function throwingCallback(_1: string, _2: readonly Identity[]): Promise<readonly Identity[]> {
        throw new Error("Something broken in here!");
      }

      const signer = new MultiChainSigner(profile);
      const core = new SigningServerCore(
        profile,
        signer,
        throwingCallback,
        defaultSignAndPostCallback,
        logger.log,
      );

      await core
        .getIdentities("Login to XY service", [defaultChainId])
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/internal server error/i));

      expect(logger.log).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith(
        jasmine.objectContaining({ message: "Something broken in here!" }),
      );

      core.shutdown();
    });

    it("passes request meta from request handler to callback", async () => {
      const profile = new UserProfile();
      profile.addWallet(Ed25519HdWallet.fromMnemonic(untouchedMnemonicA));
      const signer = new MultiChainSigner(profile);

      const originalRequestMeta = { foo: "bar" };

      const core = new SigningServerCore(
        profile,
        signer,
        async (_1, _2, meta) => {
          // we want object identity here
          expect(meta).toBe(originalRequestMeta);
          return [];
        },
        defaultSignAndPostCallback,
      );

      await core.getIdentities("Login to XY service", [defaultChainId], originalRequestMeta);

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
        const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(16)));
        const identity = await profile.createIdentity(wallet.id, bnsChain, HdPaths.iov(0));
        await sendTokensFromFaucet(connection, identity, minimalFee);
      }

      const core = new SigningServerCore(
        profile,
        signer,
        defaultGetIdentitiesCallback,
        defaultSignAndPostCallback,
      );

      const [signingIdentity] = await core.getIdentities("Please select signer", [bnsChain]);

      const send = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: signingIdentity,
        sender: bnsCodec.identityToAddress(signingIdentity),
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
        const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(16)));
        const identity = await profile.createIdentity(wallet.id, bnsChain, HdPaths.iov(0));
        await sendTokensFromFaucet(connection, identity, minimalFee);
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

      const [signingIdentity] = await core.getIdentities("Please select signer", [bnsChain]);
      const send = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: signingIdentity,
        sender: bnsCodec.identityToAddress(signingIdentity),
        amount: defaultAmount,
        recipient: await randomBnsAddress(),
      });
      const transactionId = await core.signAndPost("Please sign now", send);
      expect(transactionId).toBeNull();

      core.shutdown();
    });

    it("handles exceptions in callback", async () => {
      pendingWithoutBnsd();

      const profile = new UserProfile();
      const signer = new MultiChainSigner(profile);
      const { connection } = await signer.addChain(bnsConnector(bnsdUrl));
      const bnsChain = connection.chainId();

      {
        const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(16)));
        const identity = await profile.createIdentity(wallet.id, bnsChain, HdPaths.iov(0));
        await sendTokensFromFaucet(connection, identity, minimalFee);
      }

      async function throwingCallback(_1: string, _2: UnsignedTransaction): Promise<boolean> {
        throw new Error("Something broken in here!");
      }
      const core = new SigningServerCore(profile, signer, defaultGetIdentitiesCallback, throwingCallback);
      const [signingIdentity] = await core.getIdentities("Please select signer", [bnsChain]);
      const send = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: signingIdentity,
        sender: bnsCodec.identityToAddress(signingIdentity),
        amount: defaultAmount,
        recipient: await randomBnsAddress(),
      });
      await core
        .signAndPost("Please sign now", send)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/internal server error/i));

      core.shutdown();
    });

    it("logs exceptions in callback", async () => {
      pendingWithoutBnsd();

      const logger = { log: (_error: any) => 0 };
      spyOn(logger, "log");

      const profile = new UserProfile();
      const signer = new MultiChainSigner(profile);
      const { connection } = await signer.addChain(bnsConnector(bnsdUrl));
      const bnsChain = connection.chainId();

      {
        const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(16)));
        const identity = await profile.createIdentity(wallet.id, bnsChain, HdPaths.iov(0));
        await sendTokensFromFaucet(connection, identity, minimalFee);
      }

      async function throwingCallback(_1: string, _2: UnsignedTransaction): Promise<boolean> {
        throw new Error("Something broken in here!");
      }
      const core = new SigningServerCore(
        profile,
        signer,
        defaultGetIdentitiesCallback,
        throwingCallback,
        logger.log,
      );
      const [signingIdentity] = await core.getIdentities("Please select signer", [bnsChain]);
      const send = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: signingIdentity,
        sender: bnsCodec.identityToAddress(signingIdentity),
        amount: defaultAmount,
        recipient: await randomBnsAddress(),
      });
      await core
        .signAndPost("Please sign now", send)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/internal server error/i));

      expect(logger.log).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledWith(
        jasmine.objectContaining({ message: "Something broken in here!" }),
      );

      core.shutdown();
    });

    it("passes request meta from request handler to callback", async () => {
      pendingWithoutBnsd();

      const profile = new UserProfile();
      const signer = new MultiChainSigner(profile);
      const { connection } = await signer.addChain(bnsConnector(bnsdUrl));
      const bnsChain = connection.chainId();

      {
        const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(16)));
        const identity = await profile.createIdentity(wallet.id, bnsChain, HdPaths.iov(0));
        await sendTokensFromFaucet(connection, identity, minimalFee);
      }

      const originalRequestMeta = { foo: "bar" };

      const core = new SigningServerCore(
        profile,
        signer,
        defaultGetIdentitiesCallback,
        async (_1, _2, meta) => {
          // we want object identity here
          expect(meta).toBe(originalRequestMeta);
          return false;
        },
      );

      const [signingIdentity] = await core.getIdentities("Please select signer", [bnsChain]);
      const send = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: signingIdentity,
        sender: bnsCodec.identityToAddress(signingIdentity),
        amount: defaultAmount,
        recipient: await randomBnsAddress(),
      });
      await core.signAndPost("Please sign now", send, originalRequestMeta);

      core.shutdown();
    });
  });

  describe("signedAndPosted", () => {
    it("can get signed and posted transactions", async () => {
      pendingWithoutBnsd();

      const profile = new UserProfile();
      const signer = new MultiChainSigner(profile);
      const { connection } = await signer.addChain(bnsConnector(bnsdUrl));
      const bnsChain = connection.chainId();

      {
        const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(16)));
        const identity = await profile.createIdentity(wallet.id, bnsChain, HdPaths.iov(0));
        await sendTokensFromFaucet(connection, identity, minimalFee);
      }

      const core = new SigningServerCore(
        profile,
        signer,
        defaultGetIdentitiesCallback,
        defaultSignAndPostCallback,
      );

      expect(core.signedAndPosted.value).toEqual([]);

      const [signingIdentity] = await core.getIdentities("Please select signer", [bnsChain]);
      const send = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: signingIdentity,
        sender: bnsCodec.identityToAddress(signingIdentity),
        amount: defaultAmount,
        recipient: await randomBnsAddress(),
      });
      const transactionId = await core.signAndPost("Please sign now", send);
      if (!transactionId) {
        throw new Error("Expected transaction ID to be set");
      }

      expect(core.signedAndPosted.value.length).toEqual(1);
      expect(core.signedAndPosted.value[0].transaction).toEqual(send);
      expect(core.signedAndPosted.value[0].postResponse.blockInfo.value.state).toEqual(
        TransactionState.Pending,
      );
      expect(core.signedAndPosted.value[0].postResponse.transactionId).toEqual(transactionId);

      core.shutdown();
    });
  });
});
