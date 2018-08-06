import Long from "long";

import { Address, Nonce, SendTx, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { Ed25519SimpleAddressKeyringEntry, LocalIdentity, UserProfile } from "@iov/keycontrol";

import { bnsCodec } from "./bnscodec";
import { Client } from "./client";
import { keyToAddress } from "./util";

const skipTests = (): boolean => !process.env.BOV_ENABLED;

const pendingWithoutBov = () => {
  if (skipTests()) {
    pending("Set BOV_ENABLED to enable bov-based tests");
  }
};

describe("Integration tests with bov+tendermint", () => {
  // the first key generated from this mneumonic produces the given address
  // this account has money in the genesis file (setup in docker)
  const mnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
  const expectedFaucetAddress = Encoding.fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282") as Address;
  const cash = "CASH" as TokenTicker;

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

  const getNonce = async (client: Client, addr: Address): Promise<Nonce> => {
    const data = (await client.getNonce({ address: addr })).data;
    return data.length === 0 ? (Long.fromInt(0) as Nonce) : data[0].nonce;
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

  it("Generate proper faucet address", async () => {
    const profile = await userProfile();
    const id = faucetId(profile);
    const addr = keyToAddress(id.pubkey);
    expect(addr).toEqual(expectedFaucetAddress);
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
    expect(ticker.tokenTicker).toEqual(cash);
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
    expect(addrAcct.balance[0].tokenTicker).toEqual(cash);
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
    const nonce = await getNonce(client, rcptAddr);
    expect(nonce.toInt()).toEqual(0);
  });

  it("Can send transaction", async () => {
    pendingWithoutBov();
    const client = await Client.connect(tendermintUrl);
    const chainId = await client.chainId();
    // store minHeight before sending the tx, so we can filter out
    // if we re-run the test, still only find one tx in search
    // const minHeight = (await client.height()) - 1;

    const profile = await userProfile();

    const faucet = faucetId(profile);
    const faucetAddr = keyToAddress(faucet.pubkey);
    const rcpt = await recipient(profile, 2);
    const rcptAddr = keyToAddress(rcpt.pubkey);

    // check current nonce (should be 0, but don't fail if used by other)
    const nonce = await getNonce(client, faucetAddr);

    // construct a sendtx, this is normally used in the CoreWriter api
    const sendTx: SendTx = {
      kind: TransactionKind.Send,
      chainId,
      signer: faucet.pubkey,
      recipient: rcptAddr,
      memo: "My first payment",
      amount: {
        whole: 500,
        fractional: 75000,
        tokenTicker: cash,
      },
    };
    const signed = await profile.signTransaction(0, faucet, sendTx, bnsCodec, nonce);
    const txBytes = bnsCodec.bytesToPost(signed);
    const post = await client.postTx(txBytes);
    // FIXME: we really should add more info here, but this is in the spec
    expect(post.metadata.status).toBe(true);

    // we should be a little bit richer
    const gotMoney = await client.getAccount({ address: rcptAddr });
    expect(gotMoney).toBeTruthy();
    expect(gotMoney.data.length).toEqual(1);
    const paid = gotMoney.data[0];
    expect(paid.balance.length).toEqual(1);
    // we may post multiple times if we have multiple tests,
    // so just ensure at least one got in
    expect(paid.balance[0].whole).toBeGreaterThanOrEqual(500);
    expect(paid.balance[0].fractional).toBeGreaterThanOrEqual(75000);

    // and the nonce should go up, to be at least one
    // (worrying about replay issues)
    const fNonce = await getNonce(client, faucetAddr);
    expect(fNonce.toInt()).toBeGreaterThanOrEqual(1);

    // now verify we can query the same tx back
    // FIXME: make this cleaner somehow....
    const txQuery = { tags: [Client.fromOrToTag(faucetAddr)] };
    const search = await client.searchTx(txQuery);
    expect(search.length).toBeGreaterThanOrEqual(1);
    // make sure we get a valid signature
    const mine = search[search.length - 1];
    expect(mine.primarySignature.nonce).toEqual(nonce);
    expect(mine.primarySignature.signature.length).toBeTruthy();
    expect(mine.otherSignatures.length).toEqual(0);
    const tx = mine.transaction;
    expect(tx.kind).toEqual(sendTx.kind);
    expect(tx).toEqual(sendTx);
  });
});
