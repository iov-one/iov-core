import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  PublicIdentity,
  PublicKeyBytes,
  SendTransaction,
  TokenTicker,
} from "@iov/bcp-types";
import { bnsCodec, bnsConnector } from "@iov/bns";
import { Ed25519, Random } from "@iov/crypto";
import { Ed25519HdWallet, HdPaths, UserProfile } from "@iov/keycontrol";

import { MultiChainSigner } from "./multichainsigner";
import { ServerCore } from "./servercore";

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

describe("ServerCore", () => {
  const bnsdUrl = "ws://localhost:22345";

  const defaultAmount: Amount = {
    quantity: "1",
    fractionalDigits: 9,
    tokenTicker: "CASH" as TokenTicker,
  };

  it("can be constructed", () => {
    const profile = new UserProfile();
    const signer = new MultiChainSigner(profile);
    const core = new ServerCore(profile, signer);
    expect(core).toBeTruthy();
  });

  it("can get identities", async () => {
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
    const core = new ServerCore(profile, signer);

    const ynetIdentities = await core.getIdentities("Login to XY service", ynet);
    expect(ynetIdentities).toEqual([idA0, idB1]);

    const xnetIdentities = await core.getIdentities("Login to XY service", xnet);
    expect(xnetIdentities).toEqual([idA1, idB0, idB2]);
  });

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

    const core = new ServerCore(profile, signer);

    const identities = await core.getIdentities("Please select signer", bnsChain);
    const signingIdentity = identities[0];
    const send: SendTransaction = {
      kind: "bcp/send",
      chainId: signingIdentity.chainId,
      signer: signingIdentity.pubkey,
      amount: defaultAmount,
      recipient: await randomBnsAddress(),
    };
    const transactionId = await core.signAndPost("Please sign now", send);
    expect(transactionId).toBeTruthy();
  });
});
