import { Address, ChainId, Nonce, SendTransaction, TokenTicker } from "@iov/bcp";
import { HdPaths, Secp256k1HdWallet, UserProfile } from "@iov/keycontrol";

import { cosmosCodec } from "./cosmoscodec";
import { RestClient } from "./restclient";

function pendingWithoutCosmos(): void {
  if (!process.env.COSMOSHUB_ENABLED) {
    return pending("Set COSMOSHUB_ENABLED to enable Cosmos node-based tests");
  }
}

describe("RestClient", () => {
  const httpUrl = "http://localhost:1317";
  const faucet = {
    mnemonic:
      "economy stock theory fatal elder harbor betray wasp final emotion task crumble siren bottom lizard educate guess current outdoor pair theory focus wife stone",
    address: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6" as Address,
  };
  const faucetPath = HdPaths.cosmosHub(0);
  const atom = "ATOM" as TokenTicker;
  const defaultRecipient = "cosmos1t70qnpr0az8tf7py83m4ue5y89w58lkjmx0yq2" as Address;
  const defaultChainId = "cosmos:testing" as ChainId;

  const unsigned: SendTransaction = {
    kind: "bcp/send",
    chainId: defaultChainId,
    sender: faucet.address,
    recipient: defaultRecipient,
    memo: "My first payment",
    amount: {
      quantity: "75000",
      fractionalDigits: 6,
      tokenTicker: atom,
    },
    fee: {
      tokens: {
        quantity: "5000",
        fractionalDigits: 6,
        tokenTicker: atom,
      },
      gasLimit: "200000",
    },
  };

  describe("authAccounts", () => {
    it("can get old sequences", async () => {
      pending(
        "This test fails because the height argument of authAccounts does not work. TODO: Either remove or fix the argument.",
      );
      pendingWithoutCosmos();
      const client = new RestClient(httpUrl);

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(faucet.mnemonic));
      const senderIdentity = await profile.createIdentity(wallet.id, defaultChainId, faucetPath);
      const senderAddress = cosmosCodec.identityToAddress(senderIdentity);

      const latestTx = Array.from((await client.txs(`message.sender=${senderAddress}&limit=100`)).txs)
        .reverse()
        .find(() => true);
      const latestTxHeight = latestTx ? parseInt(latestTx.height, 10) : undefined;

      // it works without height argument
      const sequence = parseInt((await client.authAccounts(senderAddress)).result.value.sequence, 10);

      const signed = await profile.signTransaction(senderIdentity, unsigned, cosmosCodec, sequence as Nonce);
      const postableBytes = cosmosCodec.bytesToPost(signed);
      const { code, height: heightString } = await client.postTx(postableBytes);
      expect(code).toBeFalsy();
      const height = parseInt(heightString, 10);

      if (latestTxHeight) {
        // right before last transaction
        expect(
          (await client.authAccounts(senderAddress, `${latestTxHeight - 1}`)).result.value.sequence,
        ).toEqual(`${sequence - 1}`);

        // right after last transaction
        expect(
          (await client.authAccounts(senderAddress, `${latestTxHeight - 1}`)).result.value.sequence,
        ).toEqual(`${sequence}`);
      }
      // right before the transaction we just sent
      expect((await client.authAccounts(senderAddress, `${height - 1}`)).result.value.sequence).toEqual(
        `${sequence}`,
      );
      // right after the transaction we just sent
      expect((await client.authAccounts(senderAddress, `${height}`)).result.value.sequence).toEqual(
        `${sequence + 1}`,
      );
      // future height
      expect((await client.authAccounts(senderAddress, `${height}`)).result.value.sequence).toEqual(
        `${sequence + 1}`,
      );
    });
  });
});
