import Long from "long";

import { Encoding } from "@iov/encoding";
import { Ed25519SimpleAddressKeyringEntry, LocalIdentity, UserProfile } from "@iov/keycontrol";
import { AddressBytes, BcpNonce, Nonce } from "@iov/types";

import { Client } from "./client";
import { keyToAddress } from "./util";

const skipTests = (): boolean => !process.env.BOV_ENABLED;

const pendingWithoutBov = () => {
  if (skipTests()) {
    pending("Set BOV_ENABLED to enable bov-based tests");
  }
};

// tslint:disable:no-console

describe("Integration tests with bov+tendermint", () => {
  // the first key generated from this mneumonic produces the given address
  // this account has money in the genesis file (setup in docker)
  const mnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
  const address = Encoding.fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282") as AddressBytes;

  // TODO: had issues with websockets? check again later, maybe they need to close at end?
  // max open connections??? (but 900 by default)
  const tendermintUrl = "http://localhost:22345";

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

  const getNonce = (data: ReadonlyArray<BcpNonce>): Nonce =>
    data.length === 0 ? (Long.fromInt(0) as Nonce) : data[0].nonce;

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

  it("Generate proper faucet address", async () => {
    const profile = await userProfile();
    const id = faucetId(profile);
    const addr = keyToAddress(id.pubkey);
    expect(addr).toEqual(address);
  });

  it("Can connect to tendermint", async () => {
    pendingWithoutBov();
    const client = await Client.connect(tendermintUrl);

    // we should get a reasonable string here
    const chainId = await client.chainId();
    expect(chainId).toBeTruthy();
    expect(chainId.length).toBeGreaterThan(6);
    expect(chainId.length).toBeLessThan(26);

    // we expect some block to have been created
    const height = await client.height();
    expect(height).toBeGreaterThan(1);
  });

  it("Can query all tickers", async () => {
    pendingWithoutBov();
    const client = await Client.connect(tendermintUrl);

    const tickers = await client.getAllTickers();
    expect(tickers.data.length).toEqual(1);
    const ticker = tickers.data[0];
    expect(ticker.tokenTicker).toEqual("CASH");
    expect(ticker.tokenName).toEqual("Main token of this chain");
    expect(ticker.sigFigs).toEqual(6);
  });

  it("Can query accounts", async () => {
    pendingWithoutBov();
    const client = await Client.connect(tendermintUrl);
    const chainId = await client.chainId();

    const profile = await userProfile();
    const faucet = faucetId(profile);
    const faucetAddr = keyToAddress(faucet.pubkey);

    const rcpt = await recipient(profile, 1);
    const rcptAddr = keyToAddress(rcpt.pubkey);

    // can get the faucet by address (there is money)
    const source = await client.getAccount({ address: faucetAddr });
    expect(source.data.length).toEqual(1);
    const addrAcct = source.data[0];
    expect(addrAcct.address).toEqual(faucetAddr);
    expect(addrAcct.name).toEqual(`admin*${chainId}`);
    expect(addrAcct.balance.length).toEqual(1);
    expect(addrAcct.balance[0].tokenTicker).toEqual("CASH");
    expect(addrAcct.balance[0].whole).toBeGreaterThan(1000000);

    // can get the faucet by name, same result
    const namedSource = await client.getAccount({ name: "admin" });
    expect(namedSource.data.length).toEqual(1);
    const nameAcct = namedSource.data[0];
    expect(nameAcct).toEqual(addrAcct);

    // empty account has no results
    const empty = await client.getAccount({ address: rcptAddr });
    expect(empty).toBeTruthy();
    expect(empty.data.length).toEqual(0);
  });

  it("Can query empty nonce", async () => {
    pendingWithoutBov();
    const client = await Client.connect(tendermintUrl);

    const profile = await userProfile();
    const rcpt = await recipient(profile, 1);
    const rcptAddr = keyToAddress(rcpt.pubkey);

    // can get the faucet by address (there is money)
    const source = await client.getNonce({ address: rcptAddr });
    expect(source.data.length).toEqual(0);
    const nonce = getNonce(source.data);
    expect(nonce.toInt()).toEqual(0);
  });

  // it("Can send transaction", async () => {

  // });
});
