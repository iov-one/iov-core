import Long from "long";

import { Address, BcpAccount, BcpNonce, Nonce, SendTx, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import {
  Ed25519SimpleAddressKeyringEntry,
  LocalIdentity,
  PublicIdentity,
  UserProfile,
} from "@iov/keycontrol";
import { asArray, countStream, lastValue } from "@iov/stream";
import { TxQuery } from "@iov/tendermint-types";

import { bnsCodec } from "./bnscodec";
import { Client } from "./client";
import { keyToAddress } from "./util";

const skipTests = (): boolean => !process.env.BOV_ENABLED;

const pendingWithoutBov = () => {
  if (skipTests()) {
    pending("Set BOV_ENABLED to enable bov-based tests");
  }
};

const sleep = (t: number) => new Promise(resolve => setTimeout(resolve, t));

describe("Integration tests with bov+tendermint", () => {
  // the first key generated from this mneumonic produces the given address
  // this account has money in the genesis file (setup in docker)
  const mnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
  const expectedFaucetAddress = Encoding.fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282") as Address;
  const cash = "CASH" as TokenTicker;

  // TODO: had issues with websockets? check again later, maybe they need to close at end?
  // max open connections??? (but 900 by default)
  const tendermintUrl = "ws://localhost:22345";

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

    client.disconnect();
  });

  it("can disconnect from tendermint", async () => {
    pendingWithoutBov();
    const client = await Client.connect(tendermintUrl);
    const chainId = await client.chainId();
    expect(chainId).toBeTruthy();
    client.disconnect();
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

    client.disconnect();
  });

  it("Can query accounts", async () => {
    pendingWithoutBov();
    const client = await Client.connect(tendermintUrl);

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
    expect(addrAcct.name).toEqual("admin");
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

    client.disconnect();
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

    client.disconnect();
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

    // construct a sendtx, this is normally used in the IovWriter api
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

    client.disconnect();
  });

  it("can get live block feed", async () => {
    pendingWithoutBov();
    const client = await Client.connect(tendermintUrl);

    // get the next three block heights
    const heights = asArray(client.changeBlock().take(3));
    await heights.finished();

    const nums = heights.value();
    // we should get three consequtive numbers
    expect(nums.length).toEqual(3);
    expect(nums[1]).toEqual(nums[0] + 1);
    expect(nums[2]).toEqual(nums[1] + 1);
  });

  const sendCash = async (
    client: Client,
    profile: UserProfile,
    faucet: PublicIdentity,
    rcptAddr: Address,
  ) => {
    // construct a sendtx, this is normally used in the IovWriter api
    const chainId = await client.chainId();
    const faucetAddr = keyToAddress(faucet.pubkey);
    const nonce = await getNonce(client, faucetAddr);
    const sendTx: SendTx = {
      kind: TransactionKind.Send,
      chainId,
      signer: faucet.pubkey,
      recipient: rcptAddr,
      amount: {
        whole: 680,
        fractional: 0,
        tokenTicker: cash,
      },
    };
    const signed = await profile.signTransaction(0, faucet, sendTx, bnsCodec, nonce);
    const txBytes = bnsCodec.bytesToPost(signed);
    return client.postTx(txBytes);
  };

  it("can get live tx feed", async () => {
    pendingWithoutBov();
    const client = await Client.connect(tendermintUrl);
    const profile = await userProfile();

    const faucet = faucetId(profile);
    const rcpt = await recipient(profile, 62);
    const rcptAddr = keyToAddress(rcpt.pubkey);

    // make sure that we have no tx here
    const query: TxQuery = { tags: [Client.fromOrToTag(rcptAddr)] };
    const origSearch = await client.searchTx(query);
    expect(origSearch.length).toEqual(0);

    const post = await sendCash(client, profile, faucet, rcptAddr);
    expect(post.metadata.status).toBe(true);

    const middleSearch = await client.searchTx(query);
    expect(middleSearch.length).toEqual(1);

    // countLive.value() maintains the count of events
    const countLive = countStream(client.liveTx(query));

    const secondPost = await sendCash(client, profile, faucet, rcptAddr);
    expect(secondPost.metadata.status).toBe(true);

    // now, let's make sure it is picked up in the search
    const afterSearch = await client.searchTx(query);
    expect(afterSearch.length).toEqual(2);

    // give time for all events to be processed
    await sleep(100);
    // this should grab the tx before it started, as well as the one after
    expect(await countLive.value()).toEqual(2);

    client.disconnect();
  });

  it("test change feeds", async () => {
    pendingWithoutBov();
    const client = await Client.connect(tendermintUrl);
    const profile = await userProfile();

    const faucet = faucetId(profile);
    const faucetAddr = keyToAddress(faucet.pubkey);
    const rcpt = await recipient(profile, 87);
    const rcptAddr = keyToAddress(rcpt.pubkey);

    // let's watch for all changes, capture them in arrays
    const balanceFaucet = asArray(client.changeBalance(faucetAddr));
    const balanceRcpt = asArray(client.changeBalance(rcptAddr));
    const nonceFaucet = asArray(client.changeNonce(faucetAddr));
    const nonceRcpt = asArray(client.changeNonce(rcptAddr));

    const post = await sendCash(client, profile, faucet, rcptAddr);
    expect(post.metadata.status).toBe(true);
    const first = post.metadata.height;
    expect(first).toBeDefined();

    const secondPost = await sendCash(client, profile, faucet, rcptAddr);
    expect(secondPost.metadata.status).toBe(true);
    const second = secondPost.metadata.height;
    expect(second).toBeDefined();

    // give time for all events to be processed
    await sleep(50);

    // both should show up on the balance changes
    expect(balanceFaucet.value().length).toEqual(2);
    expect(balanceRcpt.value().length).toEqual(2);

    // only faucet should show up on the nonce changes
    expect(nonceFaucet.value().length).toEqual(2);
    expect(nonceRcpt.value().length).toEqual(0);

    // make sure proper values
    expect(balanceFaucet.value()).toEqual([first!, second!]);

    client.disconnect();
  });

  // make sure we can get a reactive account balance (as well as nonce)
  it("test watch account", async () => {
    pendingWithoutBov();
    const client = await Client.connect(tendermintUrl);
    const profile = await userProfile();

    const faucet = faucetId(profile);
    const faucetAddr = keyToAddress(faucet.pubkey);
    const rcpt = await recipient(profile, 57);
    const rcptAddr = keyToAddress(rcpt.pubkey);

    // let's watch for all changes, capture them in a value sink
    const faucetAcct = lastValue<BcpAccount | undefined>(client.watchAccount({ address: faucetAddr }));
    const rcptAcct = lastValue<BcpAccount | undefined>(client.watchAccount({ address: rcptAddr }));

    const faucetNonce = lastValue<BcpNonce | undefined>(client.watchNonce({ address: faucetAddr }));
    const rcptNonce = lastValue<BcpNonce | undefined>(client.watchNonce({ address: rcptAddr }));

    // give it a chance to get initial feed before checking and proceeding
    await sleep(100);

    // make sure there are original values sent on the wire
    expect(rcptAcct.value()).toBeUndefined();
    expect(faucetAcct.value()).toBeDefined();
    expect(faucetAcct.value()!.name).toEqual("admin");
    expect(faucetAcct.value()!.balance.length).toEqual(1);
    const start = faucetAcct.value()!.balance[0];

    // make sure original nonces make sense
    expect(rcptNonce.value()).toBeUndefined();
    expect(faucetNonce.value()).toBeDefined();
    // store original nonce, this should increase after tx
    const origNonce = faucetNonce.value()!.nonce;
    expect(origNonce.toNumber()).toBeGreaterThan(0);

    // send some cash and see if they update...
    const post = await sendCash(client, profile, faucet, rcptAddr);
    expect(post.metadata.status).toBe(true);

    // give it a chance to get updates before checking and proceeding
    await sleep(100);

    // rcptAcct should now have a value
    expect(rcptAcct.value()).toBeDefined();
    expect(rcptAcct.value()!.name).toBeUndefined();
    expect(rcptAcct.value()!.balance.length).toEqual(1);
    expect(rcptAcct.value()!.balance[0].whole).toEqual(680);
    // but rcptNonce still undefined
    expect(rcptNonce.value()).toBeUndefined();

    // facuetAcct should have gone down a bit
    expect(faucetAcct.value()).toBeDefined();
    expect(faucetAcct.value()!.name).toEqual("admin");
    expect(faucetAcct.value()!.balance.length).toEqual(1);
    const end = faucetAcct.value()!.balance[0];
    expect(end).not.toEqual(start);
    expect(end.whole + 680).toEqual(start.whole);
    // and faucetNonce gone up by one
    expect(faucetNonce.value()).toBeDefined();
    const finalNonce: Long = faucetNonce.value()!.nonce;
    expect(finalNonce).toEqual(origNonce.add(1));

    // clean up with disconnect at the end...
    client.disconnect();
  });
});
