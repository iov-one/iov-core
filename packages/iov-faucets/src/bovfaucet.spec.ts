import { Address, TokenTicker } from "@iov/bcp-types";
import { bnsCodec } from "@iov/bns";
import { Ed25519, Random } from "@iov/crypto";
import { Algorithm, PublicKeyBundle, PublicKeyBytes } from "@iov/tendermint-types";

import { BovFaucet } from "./bovfaucet";

async function randomBovAddress(): Promise<Address> {
  const rawKeypair = await Ed25519.makeKeypair(await Random.getBytes(32));
  const pubkey: PublicKeyBundle = {
    algo: Algorithm.Ed25519,
    data: rawKeypair.pubkey as PublicKeyBytes,
  };
  return bnsCodec.keyToAddress(pubkey);
}

describe("BovFaucet", () => {
  const faucetUrl = "https://faucet.friendnet-slow.iov.one/faucet";

  it("can be constructed", () => {
    const faucet = new BovFaucet(faucetUrl);
    expect(faucet).toBeTruthy();
  });

  it("can be used to credit a wallet", async () => {
    const faucet = new BovFaucet(faucetUrl);
    const address = await randomBovAddress();
    await faucet.credit(address).catch(error => {
      if (error.response) {
        // append response body to error message
        throw new Error(`${error}; response body: ${JSON.stringify(error.response.data)}`);
      } else {
        throw error;
      }
    });
  });

  it("can be used to credit a wallet with a different token", async () => {
    const faucet = new BovFaucet(faucetUrl);
    const address = await randomBovAddress();
    const ticker = "PAJA" as TokenTicker;
    await faucet.credit(address, ticker).catch(error => {
      if (error.response) {
        // append response body to error message
        throw new Error(`${error}; response body: ${JSON.stringify(error.response.data)}`);
      } else {
        throw error;
      }
    });
  });
});
