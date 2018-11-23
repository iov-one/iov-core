import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes } from "@iov/base-types";
import {
  AddAddressToUsernameTx,
  Address,
  BcpAccount,
  BcpNonce,
  BcpSwapQuery,
  BcpTransactionResponse,
  BcpTxQuery,
  Nonce,
  RegisterBlockchainTx,
  RegisterUsernameTx,
  RemoveAddressFromUsernameTx,
  SendTx,
  SwapClaimTx,
  SwapIdBytes,
  SwapOfferTx,
  SwapState,
  TokenTicker,
  TransactionKind,
} from "@iov/bcp-types";
import { Random, Sha256 } from "@iov/crypto";
import { Encoding, Int53 } from "@iov/encoding";
import {
  Ed25519HdWallet,
  HdPaths,
  LocalIdentity,
  PublicIdentity,
  UserProfile,
  WalletId,
} from "@iov/keycontrol";
import { asArray, lastValue } from "@iov/stream";

import { bnsCodec } from "./bnscodec";
import { BnsConnection } from "./bnsconnection";
import { bnsFromOrToTag, bnsNonceTag, bnsSwapQueryTags } from "./tags";
import { BnsAddressBytes } from "./types";
import { decodeBnsAddress, keyToAddress } from "./util";

function skipTests(): boolean {
  return !process.env.BNSD_ENABLED;
}

function pendingWithoutBnsd(): void {
  if (skipTests()) {
    pending("Set BNSD_ENABLED to enable bnsd-based tests");
  }
}

const sleep = (t: number) => new Promise(resolve => setTimeout(resolve, t));

async function randomBnsAddress(): Promise<Address> {
  return keyToAddress({
    algo: Algorithm.Ed25519,
    data: (await Random.getBytes(32)) as PublicKeyBytes,
  });
}

const cash = "CASH" as TokenTicker;

async function getNonce(connection: BnsConnection, addr: Address): Promise<Nonce> {
  const data = (await connection.getNonce({ address: addr })).data;
  return data.length === 0 ? (new Int53(0) as Nonce) : data[0].nonce;
}

async function ensureNonceNonZero(
  connection: BnsConnection,
  profile: UserProfile,
  identity: PublicIdentity,
): Promise<void> {
  const nonce = await getNonce(connection, keyToAddress(identity.pubkey));
  const sendTx: SendTx = {
    kind: TransactionKind.Send,
    chainId: await connection.chainId(),
    signer: identity.pubkey,
    recipient: await randomBnsAddress(),
    amount: {
      whole: 0,
      fractional: 1,
      tokenTicker: cash,
    },
  };
  const firstWalletId = profile.wallets.value[0].id;
  const signed = await profile.signTransaction(firstWalletId, identity, sendTx, bnsCodec, nonce);
  const txBytes = bnsCodec.bytesToPost(signed);
  await connection.postTx(txBytes);
}

describe("BnsConnection", () => {
  // the first key generated from this mneumonic produces the given address
  // this account has money in the genesis file (setup in docker)
  // expectedFaucetAddress generated using https://github.com/nym-zone/bech32
  // bech32 -e -h tiov b1ca7e78f74423ae01da3b51e676934d9105f282
  const mnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
  const expectedFaucetAddress = "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address;

  const bnsdTendermintUrl = "ws://localhost:22345";

  async function userProfileWithFaucet(): Promise<{
    readonly profile: UserProfile;
    readonly mainWalletId: WalletId;
    readonly faucet: LocalIdentity;
  }> {
    const wallet = Ed25519HdWallet.fromMnemonic(mnemonic);
    const profile = new UserProfile();
    profile.addWallet(wallet);
    const faucet = await profile.createIdentity(wallet.id, HdPaths.simpleAddress(0));
    return { profile, mainWalletId: wallet.id, faucet };
  }

  it("Generate proper faucet address", async () => {
    const { faucet } = await userProfileWithFaucet();
    const addr = keyToAddress(faucet.pubkey);
    expect(addr).toEqual(expectedFaucetAddress);
  });

  it("Can connect to tendermint", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);

    // we should get a reasonable string here
    const chainId = await connection.chainId();
    expect(chainId).toBeTruthy();
    expect(chainId.length).toBeGreaterThan(6);
    expect(chainId.length).toBeLessThan(26);

    // we expect some block to have been created
    const height = await connection.height();
    expect(height).toBeGreaterThan(1);

    connection.disconnect();
  });

  it("can disconnect from tendermint", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    const chainId = await connection.chainId();
    expect(chainId).toBeTruthy();
    connection.disconnect();
  });

  it("can query all tickers", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);

    const response = await connection.getAllTickers();
    expect(response.data.length).toEqual(3);

    expect(response.data[0].tokenTicker).toEqual("ASH" as TokenTicker);
    expect(response.data[0].tokenName).toEqual("Let the Phoenix arise");
    expect(response.data[0].sigFigs).toEqual(6);

    expect(response.data[1].tokenTicker).toEqual("BASH" as TokenTicker);
    expect(response.data[1].tokenName).toEqual("Another token of this chain");
    expect(response.data[1].sigFigs).toEqual(6);

    expect(response.data[2].tokenTicker).toEqual("CASH" as TokenTicker);
    expect(response.data[2].tokenName).toEqual("Main token of this chain");
    expect(response.data[2].sigFigs).toEqual(6);

    connection.disconnect();
  });

  it("can get account by address, publicKey and name", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);

    const { faucet } = await userProfileWithFaucet();
    const faucetAddr = keyToAddress(faucet.pubkey);

    // can get the faucet by address (there is money)
    const responseFromAddress = await connection.getAccount({ address: faucetAddr });
    expect(responseFromAddress.data.length).toEqual(1);
    const addrAcct = responseFromAddress.data[0];
    expect(addrAcct.address).toEqual(faucetAddr);
    expect(addrAcct.name).toEqual("admin");
    expect(addrAcct.balance.length).toEqual(1);
    expect(addrAcct.balance[0].tokenTicker).toEqual(cash);
    expect(addrAcct.balance[0].whole).toBeGreaterThan(1000000);

    // can get the faucet by publicKey, same result
    const responseFromPubkey = await connection.getAccount({ pubkey: faucet.pubkey });
    expect(responseFromPubkey.data.length).toEqual(1);
    const pubkeyAcct = responseFromPubkey.data[0];
    expect(pubkeyAcct).toEqual(addrAcct);

    // can get the faucet by name, same result
    const responseFromName = await connection.getAccount({ name: "admin" });
    expect(responseFromName.data.length).toEqual(1);
    const nameAcct = responseFromName.data[0];
    expect(nameAcct).toEqual(addrAcct);

    connection.disconnect();
  });

  it("returns empty list when getting an unused account", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    // unusedAddress generated using https://github.com/nym-zone/bech32
    // bech32 -e -h tiov 010101020202030303040404050505050A0A0A0A
    const unusedAddress = "tiov1qyqszqszqgpsxqcyqszq2pg9q59q5zs2fx9n6s" as Address;
    const response = await connection.getAccount({ address: unusedAddress });
    expect(response).toBeTruthy();
    expect(response.data).toBeTruthy();
    expect(response.data.length).toEqual(0);

    connection.disconnect();
  });

  describe("getNonce", () => {
    it("can query empty nonce from unused account by address, pubkey and name", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);

      // by address
      const unusedAddress = "tiov1qyqszqszqgpsxqcyqszq2pg9q59q5zs2fx9n6s" as Address;
      const response1 = await connection.getNonce({ address: unusedAddress });
      expect(response1.data.length).toEqual(0);

      // by pubkey
      const unusedPubkey: PublicKeyBundle = {
        algo: Algorithm.Ed25519,
        data: Encoding.fromHex(
          "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        ) as PublicKeyBytes,
      };
      const response2 = await connection.getNonce({ pubkey: unusedPubkey });
      expect(response2.data.length).toEqual(0);

      // by name
      const unusedValueName = "i_do_not_exist";
      const response = await connection.getNonce({ name: unusedValueName });
      expect(response.data.length).toEqual(0);

      connection.disconnect();
    });

    it("can query nonce from faucet by address, pubkey and name", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const { profile, faucet } = await userProfileWithFaucet();
      await ensureNonceNonZero(connection, profile, faucet);

      // by address
      const faucetAddress = keyToAddress(faucet.pubkey);
      const response1 = await connection.getNonce({ address: faucetAddress });
      expect(response1.data.length).toEqual(1);
      expect(response1.data[0].nonce.toNumber()).toBeGreaterThan(0);

      // by pubkey
      const response2 = await connection.getNonce({ pubkey: faucet.pubkey });
      expect(response2.data.length).toEqual(1);
      expect(response2.data[0].nonce.toNumber()).toBeGreaterThan(0);

      // by name
      const response3 = await connection.getNonce({ name: "admin" });
      expect(response3.data.length).toEqual(1);
      expect(response3.data[0].nonce.toNumber()).toBeGreaterThan(0);

      connection.disconnect();
    });
  });

  describe("postTx", () => {
    it("can send transaction", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = await connection.chainId();

      const { profile, mainWalletId, faucet } = await userProfileWithFaucet();
      const faucetAddr = keyToAddress(faucet.pubkey);
      const rcpt = await profile.createIdentity(mainWalletId, HdPaths.simpleAddress(2));
      const rcptAddr = keyToAddress(rcpt.pubkey);

      // construct a sendtx, this is normally used in the MultiChainSigner api
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
      const nonce = await getNonce(connection, faucetAddr);
      const signed = await profile.signTransaction(mainWalletId, faucet, sendTx, bnsCodec, nonce);
      const txBytes = bnsCodec.bytesToPost(signed);
      await connection.postTx(txBytes);

      // we should be a little bit richer
      const gotMoney = await connection.getAccount({ address: rcptAddr });
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
      const fNonce = await getNonce(connection, faucetAddr);
      expect(fNonce.toNumber()).toBeGreaterThanOrEqual(1);

      // now verify we can query the same tx back
      const txQuery = { tags: [bnsFromOrToTag(faucetAddr)] };
      const search = await connection.searchTx(txQuery);
      expect(search.length).toBeGreaterThanOrEqual(1);
      // make sure we get a valid signature
      const mine = search[search.length - 1];
      expect(mine.primarySignature.nonce).toEqual(nonce);
      expect(mine.primarySignature.signature.length).toBeTruthy();
      expect(mine.otherSignatures.length).toEqual(0);
      const tx = mine.transaction;
      expect(tx.kind).toEqual(sendTx.kind);
      expect(tx).toEqual(sendTx);
      // make sure we have a txid
      expect(mine.txid).toBeDefined();
      expect(mine.txid.length).toBeGreaterThan(0);

      connection.disconnect();
    });

    it("can register a blockchain", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = await connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, HdPaths.simpleAddress(0));
      const identityAddress = keyToAddress(identity.pubkey);

      // Create and send registration
      const chainId = `wonderland_${Math.random()}` as ChainId;
      const registration: RegisterBlockchainTx = {
        kind: TransactionKind.RegisterBlockchain,
        chainId: registryChainId,
        signer: identity.pubkey,
        chain: {
          chainId: chainId,
          production: false,
          enabled: true,
          name: "Wonderland",
          networkId: "7rg047g4h",
        },
        codecName: "wonderland_rules",
        codecConfig: `{ "any" : [ "json", "content" ] }`,
      };
      const nonce = await getNonce(connection, identityAddress);
      const signed = await profile.signTransaction(wallet.id, identity, registration, bnsCodec, nonce);
      const txBytes = bnsCodec.bytesToPost(signed);
      await connection.postTx(txBytes);

      // Find registration transaction
      const searchResult = await connection.searchTx({ tags: [bnsNonceTag(identityAddress)] });
      expect(searchResult.length).toEqual(1);
      if (searchResult[0].transaction.kind !== TransactionKind.RegisterBlockchain) {
        throw new Error("Unexpected transaction kind");
      }
      expect(searchResult[0].transaction.chain).toEqual({
        chainId: chainId,
        production: false,
        enabled: true,
        name: "Wonderland",
        networkId: "7rg047g4h",
        mainTickerId: undefined,
      });
      expect(searchResult[0].transaction.codecName).toEqual("wonderland_rules");
      expect(searchResult[0].transaction.codecConfig).toEqual(`{ "any" : [ "json", "content" ] }`);

      connection.disconnect();
    });

    it("can register a username", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = await connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, HdPaths.simpleAddress(0));

      // Create and send registration
      const address = keyToAddress(identity.pubkey);
      const username = `testuser_${Math.random()}`;
      const registration: RegisterUsernameTx = {
        kind: TransactionKind.RegisterUsername,
        chainId: registryChainId,
        signer: identity.pubkey,
        addresses: [
          // TODO: Re-enable when there are pre-registered blockchains for testing
          // (https://github.com/iov-one/weave/issues/184)
          //
          // { chainId: ..., address: ... },
        ],
        username: username,
      };
      const nonce = await getNonce(connection, address);
      const signed = await profile.signTransaction(wallet.id, identity, registration, bnsCodec, nonce);
      const txBytes = bnsCodec.bytesToPost(signed);
      await connection.postTx(txBytes);

      // Find registration transaction
      const searchResult = await connection.searchTx({ tags: [bnsNonceTag(address)] });
      expect(searchResult.length).toEqual(1);
      if (searchResult[0].transaction.kind !== TransactionKind.RegisterUsername) {
        throw new Error("Unexpected transaction kind");
      }
      expect(searchResult[0].transaction.username).toEqual(username);
      expect(searchResult[0].transaction.addresses.length).toEqual(0);

      connection.disconnect();
    });

    it("can add address to username and remove again", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = await connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, HdPaths.simpleAddress(0));
      const identityAddress = keyToAddress(identity.pubkey);

      // Create and send registration
      const username = `testuser_${Math.random()}`;
      const usernameRegistration: RegisterUsernameTx = {
        kind: TransactionKind.RegisterUsername,
        chainId: registryChainId,
        signer: identity.pubkey,
        username: username,
        addresses: [],
      };
      await connection.postTx(
        bnsCodec.bytesToPost(
          await profile.signTransaction(
            wallet.id,
            identity,
            usernameRegistration,
            bnsCodec,
            await getNonce(connection, identityAddress),
          ),
        ),
      );

      // Register a blockchain
      const chainId = `wonderland_${Math.random()}` as ChainId;
      const blockchainRegistration: RegisterBlockchainTx = {
        kind: TransactionKind.RegisterBlockchain,
        chainId: registryChainId,
        signer: identity.pubkey,
        chain: {
          chainId: chainId,
          networkId: "7rg047g4h",
          production: false,
          enabled: true,
          name: "Wonderland",
        },
        codecName: "wonderland_rules",
        codecConfig: `{ "any" : [ "json", "content" ] }`,
      };
      await connection.postTx(
        bnsCodec.bytesToPost(
          await profile.signTransaction(
            wallet.id,
            identity,
            blockchainRegistration,
            bnsCodec,
            await getNonce(connection, identityAddress),
          ),
        ),
      );

      // Add address
      const address = `testaddress_${Math.random()}` as Address;
      const addAddress: AddAddressToUsernameTx = {
        kind: TransactionKind.AddAddressToUsername,
        chainId: registryChainId,
        signer: identity.pubkey,
        username: username,
        payload: {
          chainId: chainId,
          address: address,
        },
      };
      await connection.postTx(
        bnsCodec.bytesToPost(
          await profile.signTransaction(
            wallet.id,
            identity,
            addAddress,
            bnsCodec,
            await getNonce(connection, identityAddress),
          ),
        ),
      );

      // Adding second address for the same chain fails
      const address2 = `testaddress2_${Math.random()}` as Address;
      const addAddress2: AddAddressToUsernameTx = {
        kind: TransactionKind.AddAddressToUsername,
        chainId: registryChainId,
        signer: identity.pubkey,
        username: username,
        payload: {
          chainId: chainId,
          address: address2,
        },
      };
      await connection
        .postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              wallet.id,
              identity,
              addAddress2,
              bnsCodec,
              await getNonce(connection, identityAddress),
            ),
          ),
        )
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/duplicate entry/i));

      // Remove address
      const removeAddress: RemoveAddressFromUsernameTx = {
        kind: TransactionKind.RemoveAddressFromUsername,
        chainId: registryChainId,
        signer: identity.pubkey,
        username: username,
        payload: {
          chainId: chainId,
          address: address,
        },
      };
      await connection.postTx(
        bnsCodec.bytesToPost(
          await profile.signTransaction(
            wallet.id,
            identity,
            removeAddress,
            bnsCodec,
            await getNonce(connection, identityAddress),
          ),
        ),
      );

      // Do the same removal again
      await connection
        .postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              wallet.id,
              identity,
              removeAddress,
              bnsCodec,
              await getNonce(connection, identityAddress),
            ),
          ),
        )
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/invalid entry/i));

      connection.disconnect();
    });
  });

  describe("searchTx", () => {
    it("can search for transactions", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = await connection.chainId();

      const { profile, mainWalletId, faucet } = await userProfileWithFaucet();
      const faucetAddress = keyToAddress(faucet.pubkey);
      const rcpt = await profile.createIdentity(mainWalletId, HdPaths.simpleAddress(68));
      const rcptAddress = keyToAddress(rcpt.pubkey);

      // construct a sendtx, this is normally used in the MultiChainSigner api
      const memo = `Payment ${Math.random()}`;
      const sendTx: SendTx = {
        kind: TransactionKind.Send,
        chainId: chainId,
        signer: faucet.pubkey,
        recipient: rcptAddress,
        memo: memo,
        amount: {
          whole: 1,
          fractional: 1,
          tokenTicker: cash,
        },
      };

      const nonce = await getNonce(connection, faucetAddress);
      const signed = await profile.signTransaction(mainWalletId, faucet, sendTx, bnsCodec, nonce);
      const txBytes = bnsCodec.bytesToPost(signed);
      const response = await connection.postTx(txBytes);
      const txHeight = response.metadata.height!;

      {
        // finds transaction using tag
        const results = await connection.searchTx({ tags: [bnsFromOrToTag(rcptAddress)] });
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResult = results[results.length - 1];
        expect(mostRecentResult.transaction.kind).toEqual(TransactionKind.Send);
        expect((mostRecentResult.transaction as SendTx).memo).toEqual(memo);
      }

      {
        // finds transaction using tag and height
        const results = await connection.searchTx({ tags: [bnsFromOrToTag(rcptAddress)], height: txHeight });
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResult = results[results.length - 1];
        expect(mostRecentResult.transaction.kind).toEqual(TransactionKind.Send);
        expect((mostRecentResult.transaction as SendTx).memo).toEqual(memo);
      }

      connection.disconnect();
    });

    // Activate when https://github.com/tendermint/tendermint/issues/2759 is fixed
    xit("can search for transactions (min/max height)", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = await connection.chainId();
      const initialHeight = await connection.height();

      const { profile, mainWalletId, faucet } = await userProfileWithFaucet();
      const faucetAddress = keyToAddress(faucet.pubkey);
      const rcpt = await profile.createIdentity(mainWalletId, HdPaths.simpleAddress(68));
      const rcptAddress = keyToAddress(rcpt.pubkey);

      // construct a sendtx, this is normally used in the MultiChainSigner api
      const memo = `Payment ${Math.random()}`;
      const sendTx: SendTx = {
        kind: TransactionKind.Send,
        chainId: chainId,
        signer: faucet.pubkey,
        recipient: rcptAddress,
        memo: memo,
        amount: {
          whole: 1,
          fractional: 1,
          tokenTicker: cash,
        },
      };

      const nonce = await getNonce(connection, faucetAddress);
      const signed = await profile.signTransaction(mainWalletId, faucet, sendTx, bnsCodec, nonce);
      const txBytes = bnsCodec.bytesToPost(signed);
      await connection.postTx(txBytes);

      {
        // finds transaction using tag and minHeight = 1
        const results = await connection.searchTx({ tags: [bnsFromOrToTag(rcptAddress)], minHeight: 1 });
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResult = results[results.length - 1];
        expect(mostRecentResult.transaction.kind).toEqual(TransactionKind.Send);
        expect((mostRecentResult.transaction as SendTx).memo).toEqual(memo);
      }

      {
        // finds transaction using tag and minHeight = initialHeight
        const results = await connection.searchTx({
          tags: [bnsFromOrToTag(rcptAddress)],
          minHeight: initialHeight,
        });
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResult = results[results.length - 1];
        expect(mostRecentResult.transaction.kind).toEqual(TransactionKind.Send);
        expect((mostRecentResult.transaction as SendTx).memo).toEqual(memo);
      }

      {
        // finds transaction using tag and maxHeight = 500 million
        const results = await connection.searchTx({
          tags: [bnsFromOrToTag(rcptAddress)],
          maxHeight: 500_000_000,
        });
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResult = results[results.length - 1];
        expect(mostRecentResult.transaction.kind).toEqual(TransactionKind.Send);
        expect((mostRecentResult.transaction as SendTx).memo).toEqual(memo);
      }

      {
        // finds transaction using tag and maxHeight = initialHeight + 10
        const results = await connection.searchTx({
          tags: [bnsFromOrToTag(rcptAddress)],
          maxHeight: initialHeight + 10,
        });
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResult = results[results.length - 1];
        expect(mostRecentResult.transaction.kind).toEqual(TransactionKind.Send);
        expect((mostRecentResult.transaction as SendTx).memo).toEqual(memo);
      }

      connection.disconnect();
    });
  });

  describe("getBlockchains", () => {
    it("can query blockchains by chain ID", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = await connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, HdPaths.simpleAddress(0));
      const identityAddress = keyToAddress(identity.pubkey);

      // Register blockchain
      const chainId = `wonderland_${Math.random()}` as ChainId;
      const blockchainRegistration: RegisterBlockchainTx = {
        kind: TransactionKind.RegisterBlockchain,
        chainId: registryChainId,
        signer: identity.pubkey,
        chain: {
          chainId: chainId,
          production: false,
          enabled: true,
          name: "Wonderland",
          networkId: "7rg047g4h",
        },
        codecName: "wonderland_rules",
        codecConfig: `{ "any" : [ "json", "content" ] }`,
      };
      await connection.postTx(
        bnsCodec.bytesToPost(
          await profile.signTransaction(
            wallet.id,
            identity,
            blockchainRegistration,
            bnsCodec,
            await getNonce(connection, identityAddress),
          ),
        ),
      );

      // Query by existing chain ID
      {
        const results = await connection.getBlockchains({ chainId: chainId });
        expect(results.length).toEqual(1);
        expect(results[0].id).toEqual(chainId);
        expect(results[0].owner).toEqual(decodeBnsAddress(identityAddress).data as BnsAddressBytes);
        expect(results[0].chain).toEqual({
          chainId: chainId,
          production: false,
          enabled: true,
          name: "Wonderland",
          networkId: "7rg047g4h",
          mainTickerId: undefined,
        });
        expect(results[0].codecName).toEqual("wonderland_rules");
        expect(results[0].codecConfig).toEqual(`{ "any" : [ "json", "content" ] }`);
      }

      // Query by non-existing chain ID
      {
        const results = await connection.getBlockchains({ chainId: "chain_we_dont_have" as ChainId });
        expect(results.length).toEqual(0);
      }

      connection.disconnect();
    });
  });

  describe("getUsernames", () => {
    it("can query usernames by name or owner", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = await connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, HdPaths.simpleAddress(0));
      const identityAddress = keyToAddress(identity.pubkey);

      // Register username
      const username = `testuser_${Math.random()}`;
      const registration: RegisterUsernameTx = {
        kind: TransactionKind.RegisterUsername,
        chainId: registryChainId,
        signer: identity.pubkey,
        addresses: [],
        username: username,
      };
      const nonce = await getNonce(connection, identityAddress);
      const signed = await profile.signTransaction(wallet.id, identity, registration, bnsCodec, nonce);
      const txBytes = bnsCodec.bytesToPost(signed);
      await connection.postTx(txBytes);

      // Query by existing name
      {
        const results = await connection.getUsernames({ username: username });
        expect(results.length).toEqual(1);
        expect(results[0]).toEqual({
          id: username,
          owner: decodeBnsAddress(identityAddress).data as BnsAddressBytes,
          addresses: [],
        });
      }

      // Query by non-existing name
      {
        const results = await connection.getUsernames({ username: "user_we_dont_have" });
        expect(results.length).toEqual(0);
      }

      // Query by existing owner
      {
        const results = await connection.getUsernames({ owner: identityAddress });
        expect(results.length).toBeGreaterThanOrEqual(1);
      }

      // Query by non-existing owner
      {
        const results = await connection.getUsernames({ owner: await randomBnsAddress() });
        expect(results.length).toEqual(0);
      }

      connection.disconnect();
    });

    it("can query usernames by (chain, address)", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = await connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, HdPaths.simpleAddress(0));
      const identityAddress = keyToAddress(identity.pubkey);

      // Register blockchain
      const chainId = `wonderland_${Math.random()}` as ChainId;
      const blockchainRegistration: RegisterBlockchainTx = {
        kind: TransactionKind.RegisterBlockchain,
        chainId: registryChainId,
        signer: identity.pubkey,
        chain: {
          chainId: chainId,
          production: false,
          enabled: true,
          name: "Wonderland",
          networkId: "7rg047g4h",
        },
        codecName: "wonderland_rules",
        codecConfig: `{ "any" : [ "json", "content" ] }`,
      };
      await connection.postTx(
        bnsCodec.bytesToPost(
          await profile.signTransaction(
            wallet.id,
            identity,
            blockchainRegistration,
            bnsCodec,
            await getNonce(connection, identityAddress),
          ),
        ),
      );

      // Register username
      const username = `testuser_${Math.random()}`;
      const usernameRegistration: RegisterUsernameTx = {
        kind: TransactionKind.RegisterUsername,
        chainId: registryChainId,
        signer: identity.pubkey,
        addresses: [
          {
            address: "12345678912345W" as Address,
            chainId: chainId,
          },
        ],
        username: username,
      };
      await connection.postTx(
        bnsCodec.bytesToPost(
          await profile.signTransaction(
            wallet.id,
            identity,
            usernameRegistration,
            bnsCodec,
            await getNonce(connection, identityAddress),
          ),
        ),
      );

      // Query by existing (chain, address)
      {
        const results = await connection.getUsernames({
          chain: chainId,
          address: "12345678912345W" as Address,
        });
        expect(results.length).toEqual(1);
        expect(results[0]).toEqual({
          id: username,
          owner: decodeBnsAddress(identityAddress).data as BnsAddressBytes,
          addresses: [
            {
              chainId: chainId,
              address: "12345678912345W" as Address,
            },
          ],
        });
      }

      // Query by non-existing (chain, address)
      {
        const results = await connection.getUsernames({
          chain: chainId,
          address: "OTHER_ADDRESS" as Address,
        });
        expect(results.length).toEqual(0);
      }
      {
        const results = await connection.getUsernames({
          chain: "OTHER_CHAIN" as ChainId,
          address: "12345678912345W" as Address,
        });
        expect(results.length).toEqual(0);
      }

      connection.disconnect();
    });
  });

  it("can get live block feed", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);

    // get the next three block heights
    const heights = asArray(connection.changeBlock().take(3));
    await heights.finished();

    const nums = heights.value();
    // we should get three consequtive numbers
    expect(nums.length).toEqual(3);
    expect(nums[1]).toEqual(nums[0] + 1);
    expect(nums[2]).toEqual(nums[1] + 1);
  });

  const sendCash = async (
    connection: BnsConnection,
    profile: UserProfile,
    faucet: PublicIdentity,
    rcptAddr: Address,
  ): Promise<BcpTransactionResponse> => {
    // construct a sendtx, this is normally used in the MultiChainSigner api
    const chainId = await connection.chainId();
    const faucetAddr = keyToAddress(faucet.pubkey);
    const nonce = await getNonce(connection, faucetAddr);
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
    const firstWalletId = profile.wallets.value[0].id;
    const signed = await profile.signTransaction(firstWalletId, faucet, sendTx, bnsCodec, nonce);
    const txBytes = bnsCodec.bytesToPost(signed);
    return connection.postTx(txBytes);
  };

  it("can get live tx feed", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    const { profile, mainWalletId, faucet } = await userProfileWithFaucet();

    const rcpt = await profile.createIdentity(mainWalletId, HdPaths.simpleAddress(62));
    const rcptAddr = keyToAddress(rcpt.pubkey);

    // make sure that we have no tx here
    const query: BcpTxQuery = { tags: [bnsFromOrToTag(rcptAddr)] };
    const origSearch = await connection.searchTx(query);
    expect(origSearch.length).toEqual(0);

    const post = await sendCash(connection, profile, faucet, rcptAddr);
    const firstId = post.data.txid;
    expect(firstId).toBeDefined();

    // hmmm... there seems to be a lag here when Travis CI is heavily loaded...
    await sleep(50);
    const middleSearch = await connection.searchTx(query);
    expect(middleSearch.length).toEqual(1);

    // live.value() maintains all transactions
    const live = asArray(connection.liveTx(query));

    const secondPost = await sendCash(connection, profile, faucet, rcptAddr);
    const secondId = secondPost.data.txid;
    expect(secondId).toBeDefined();

    // now, let's make sure it is picked up in the search
    // hmmm... there seems to be a lag here when Travis CI is heavily loaded...
    await sleep(50);
    const afterSearch = await connection.searchTx(query);
    expect(afterSearch.length).toEqual(2);
    // make sure we have unique, defined txids
    const txIds = afterSearch.map(tx => tx.txid);
    expect(txIds.length).toEqual(2);
    expect(txIds[0]).toEqual(firstId);
    expect(txIds[1]).toEqual(secondId);
    expect(txIds[0]).not.toEqual(txIds[1]);

    // give time for all events to be processed
    await sleep(100);
    // this should grab the tx before it started, as well as the one after
    expect(live.value().length).toEqual(2);
    // make sure the txids also match
    expect(live.value()[0].txid).toEqual(afterSearch[0].txid);
    expect(live.value()[1].txid).toEqual(afterSearch[1].txid);

    connection.disconnect();
  });

  it("can provide change feeds", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    const { profile, mainWalletId, faucet } = await userProfileWithFaucet();

    const faucetAddr = keyToAddress(faucet.pubkey);
    const rcpt = await profile.createIdentity(mainWalletId, HdPaths.simpleAddress(87));
    const rcptAddr = keyToAddress(rcpt.pubkey);

    // let's watch for all changes, capture them in arrays
    const balanceFaucet = asArray(connection.changeBalance(faucetAddr));
    const balanceRcpt = asArray(connection.changeBalance(rcptAddr));
    const nonceFaucet = asArray(connection.changeNonce(faucetAddr));
    const nonceRcpt = asArray(connection.changeNonce(rcptAddr));

    const post = await sendCash(connection, profile, faucet, rcptAddr);
    const first = post.metadata.height;
    expect(first).toBeDefined();

    const secondPost = await sendCash(connection, profile, faucet, rcptAddr);
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

    connection.disconnect();
  });

  // make sure we can get a reactive account balance (as well as nonce)
  it("can watch accounts", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    const { profile, mainWalletId, faucet } = await userProfileWithFaucet();

    const faucetAddr = keyToAddress(faucet.pubkey);
    const rcpt = await profile.createIdentity(mainWalletId, HdPaths.simpleAddress(57));
    const rcptAddr = keyToAddress(rcpt.pubkey);

    // let's watch for all changes, capture them in a value sink
    const faucetAcct = lastValue<BcpAccount | undefined>(connection.watchAccount({ address: faucetAddr }));
    const rcptAcct = lastValue<BcpAccount | undefined>(connection.watchAccount({ address: rcptAddr }));

    const faucetNonce = lastValue<BcpNonce | undefined>(connection.watchNonce({ address: faucetAddr }));
    const rcptNonce = lastValue<BcpNonce | undefined>(connection.watchNonce({ address: rcptAddr }));

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

    // send some cash
    await sendCash(connection, profile, faucet, rcptAddr);

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
    const finalNonce = faucetNonce.value()!.nonce;
    expect(finalNonce.toNumber()).toEqual(origNonce.toNumber() + 1);

    // clean up with disconnect at the end...
    connection.disconnect();
  });

  it("Can start atomic swap", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    const chainId = await connection.chainId();

    const { profile, mainWalletId, faucet } = await userProfileWithFaucet();

    const faucetAddr = keyToAddress(faucet.pubkey);
    const rcpt = await profile.createIdentity(mainWalletId, HdPaths.simpleAddress(7));
    const rcptAddr = keyToAddress(rcpt.pubkey);

    // check current nonce (should be 0, but don't fail if used by other)
    const nonce = await getNonce(connection, faucetAddr);

    const preimage = Encoding.toAscii("my top secret phrase... keep it on the down low ;)");
    const hash = new Sha256(preimage).digest();

    const initSwaps = await connection.getSwap({ recipient: rcptAddr });
    expect(initSwaps.data.length).toEqual(0);

    // construct a sendtx, this is normally used in the MultiChainSigner api
    const swapOfferTx: SwapOfferTx = {
      kind: TransactionKind.SwapOffer,
      chainId,
      signer: faucet.pubkey,
      recipient: rcptAddr,
      amount: [
        {
          whole: 123,
          fractional: 456000,
          tokenTicker: cash,
        },
      ],
      timeout: 1000,
      preimage,
    };

    const signed = await profile.signTransaction(mainWalletId, faucet, swapOfferTx, bnsCodec, nonce);
    const txBytes = bnsCodec.bytesToPost(signed);
    const post = await connection.postTx(txBytes);
    const txHeight = post.metadata.height;
    expect(txHeight).toBeTruthy();
    expect(txHeight).toBeGreaterThan(1);
    const txResult = post.data.result;
    expect(txResult.length).toBe(8);
    expect(txResult).toEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1]));
    const txid = post.data.txid;
    expect(txid.length).toBe(20);

    // now query by the txid
    const search = await connection.searchTx({ hash: txid, tags: [] });
    expect(search.length).toEqual(1);
    // make sure we get he same tx loaded
    const loaded = search[0];
    expect(loaded.txid).toEqual(txid);
    // we never write the offer (with preimage) to a chain, only convert it to a SwapCounterTx
    // which only has the hashed data, then commit it (thus the different kind is expected)
    expect(loaded.transaction.kind).toEqual(TransactionKind.SwapCounter);
    expect((loaded.transaction as SwapOfferTx).recipient).toEqual(swapOfferTx.recipient);
    // make sure it also stored a result
    expect(loaded.result).toEqual(txResult);
    expect(loaded.height).toEqual(txHeight!);

    // ----  prepare queries
    const querySwapId: BcpSwapQuery = { swapid: txResult as SwapIdBytes };
    const querySwapSender: BcpSwapQuery = { sender: faucetAddr };
    const querySwapRecipient: BcpSwapQuery = { recipient: rcptAddr };
    const querySwapHash: BcpSwapQuery = { hashlock: hash };

    // ----- connection.searchTx() -----
    // we should be able to find the transaction through quite a number of tag queries

    const txById = await connection.searchTx({ tags: [bnsSwapQueryTags(querySwapId)] });
    expect(txById.length).toEqual(1);
    expect(txById[0].txid).toEqual(txid);

    const txBySender = await connection.searchTx({ tags: [bnsSwapQueryTags(querySwapSender)] });
    expect(txBySender.length).toEqual(1);
    expect(txBySender[0].txid).toEqual(txid);

    const txByRecipient = await connection.searchTx({ tags: [bnsSwapQueryTags(querySwapRecipient)] });
    expect(txByRecipient.length).toEqual(1);
    expect(txByRecipient[0].txid).toEqual(txid);

    const txByHash = await connection.searchTx({ tags: [bnsSwapQueryTags(querySwapHash)] });
    expect(txByHash.length).toEqual(1);
    expect(txByHash[0].txid).toEqual(txid);

    // ----- connection.getSwap() -------

    // we can also swap by id (returned by the transaction result)
    const idSwap = await connection.getSwap(querySwapId);
    expect(idSwap.data.length).toEqual(1);

    const swap = idSwap.data[0];
    expect(swap.kind).toEqual(SwapState.Open);

    // and it matches expectations
    const swapData = swap.data;
    expect(swapData.id).toEqual(txResult);
    expect(swapData.sender).toEqual(faucetAddr);
    expect(swapData.recipient).toEqual(rcptAddr);
    expect(swapData.timeout).toEqual(1000); // FIXME: timeout from tx (the next line is expected, right?)
    // expect(swapData.timeout).toEqual(loaded.height + 1000); // when tx was commited plus timeout
    expect(swapData.amount.length).toEqual(1);
    expect(swapData.amount[0].whole).toEqual(123);
    expect(swapData.amount[0].tokenTicker).toEqual(cash);
    expect(swapData.hashlock).toEqual(hash);

    // we can get the swap by the recipient
    const rcptSwap = await connection.getSwap(querySwapRecipient);
    expect(rcptSwap.data.length).toEqual(1);
    expect(rcptSwap.data[0]).toEqual(swap);

    // we can also get it by the sender
    const sendSwap = await connection.getSwap(querySwapSender);
    expect(sendSwap.data.length).toEqual(1);
    expect(sendSwap.data[0]).toEqual(swap);

    // we can also get it by the hash
    const hashSwap = await connection.getSwap(querySwapHash);
    expect(hashSwap.data.length).toEqual(1);
    expect(hashSwap.data[0]).toEqual(swap);
  });

  const openSwap = async (
    connection: BnsConnection,
    profile: UserProfile,
    sender: PublicIdentity,
    rcptAddr: Address,
    preimage: Uint8Array,
  ): Promise<BcpTransactionResponse> => {
    // construct a swapOfferTx, sign and post to the chain
    const chainId = await connection.chainId();
    const nonce = await getNonce(connection, keyToAddress(sender.pubkey));
    const swapOfferTx: SwapOfferTx = {
      kind: TransactionKind.SwapOffer,
      chainId,
      signer: sender.pubkey,
      recipient: rcptAddr,
      amount: [
        {
          whole: 21,
          fractional: 0,
          tokenTicker: cash,
        },
      ],
      timeout: 5000,
      preimage,
    };
    const firstWalletId = profile.wallets.value[0].id;
    const signed = await profile.signTransaction(firstWalletId, sender, swapOfferTx, bnsCodec, nonce);
    const txBytes = bnsCodec.bytesToPost(signed);
    return connection.postTx(txBytes);
  };

  const claimSwap = async (
    connection: BnsConnection,
    profile: UserProfile,
    sender: PublicIdentity,
    swapId: SwapIdBytes,
    preimage: Uint8Array,
  ): Promise<BcpTransactionResponse> => {
    // construct a swapOfferTx, sign and post to the chain
    const chainId = await connection.chainId();
    const nonce = await getNonce(connection, keyToAddress(sender.pubkey));
    const swapClaimTx: SwapClaimTx = {
      kind: TransactionKind.SwapClaim,
      chainId,
      signer: sender.pubkey,
      swapId,
      preimage,
    };
    const firstWalletId = profile.wallets.value[0].id;
    const signed = await profile.signTransaction(firstWalletId, sender, swapClaimTx, bnsCodec, nonce);
    const txBytes = bnsCodec.bytesToPost(signed);
    return connection.postTx(txBytes);
  };

  it("Get and watch atomic swap lifecycle", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    const { profile, mainWalletId, faucet } = await userProfileWithFaucet();

    const rcpt = await profile.createIdentity(mainWalletId, HdPaths.simpleAddress(121));
    const rcptAddr = keyToAddress(rcpt.pubkey);

    // create the preimages for the three swaps
    const preimage1 = Encoding.toAscii("the first swap is easy");
    // const hash1 = new Sha256(preimage1).digest();
    const preimage2 = Encoding.toAscii("ze 2nd iS l337 !@!");
    // const hash2 = new Sha256(preimage2).digest();
    const preimage3 = Encoding.toAscii("and this one is a gift.");
    // const hash3 = new Sha256(preimage3).digest();

    // nothing to start with
    const rcptQuery = { recipient: rcptAddr };
    const initSwaps = await connection.getSwap(rcptQuery);
    expect(initSwaps.data.length).toEqual(0);

    // make two offers
    const res1 = await openSwap(connection, profile, faucet, rcptAddr, preimage1);
    const id1 = res1.data.result as SwapIdBytes;
    expect(id1.length).toEqual(8);

    const res2 = await openSwap(connection, profile, faucet, rcptAddr, preimage2);
    const id2 = res2.data.result as SwapIdBytes;
    expect(id2.length).toEqual(8);

    // find two open
    const midSwaps = await connection.getSwap(rcptQuery);
    expect(midSwaps.data.length).toEqual(2);
    const [open1, open2] = midSwaps.data;
    expect(open1.kind).toEqual(SwapState.Open);
    expect(open1.data.id).toEqual(id1);
    expect(open2.kind).toEqual(SwapState.Open);
    expect(open2.data.id).toEqual(id2);

    // then claim, offer, claim - 2 closed, 1 open
    await claimSwap(connection, profile, faucet, id2, preimage1);

    // start to watch
    const liveView = asArray(connection.watchSwap(rcptQuery));

    const res3 = await openSwap(connection, profile, faucet, rcptAddr, preimage3);
    const id3 = res3.data.result as SwapIdBytes;
    expect(id3.length).toEqual(8);

    await claimSwap(connection, profile, faucet, id1, preimage1);

    // make sure we find two claims, one open
    const finalSwaps = await connection.getSwap({ recipient: rcptAddr });
    expect(finalSwaps.data.length).toEqual(3);
    const [open3, claim2, claim1] = finalSwaps.data;
    expect(open3.kind).toEqual(SwapState.Open);
    expect(open3.data.id).toEqual(id3);
    expect(claim2.kind).toEqual(SwapState.Claimed);
    expect(claim2.data.id).toEqual(id2);
    expect(claim1.kind).toEqual(SwapState.Claimed);
    expect(claim1.data.id).toEqual(id1);

    // validate liveView is correct
    const vals = liveView.value();
    expect(vals.length).toEqual(5);
    expect(vals[0].kind).toEqual(SwapState.Open);
    expect(vals[0].data.id).toEqual(id1);
    expect(vals[1].kind).toEqual(SwapState.Open);
    expect(vals[1].data.id).toEqual(id2);
    expect(vals[2].kind).toEqual(SwapState.Claimed);
    expect(vals[2].data.id).toEqual(id2);
    expect(vals[3].kind).toEqual(SwapState.Open);
    expect(vals[3].data.id).toEqual(id3);
    expect(vals[4].kind).toEqual(SwapState.Claimed);
    expect(vals[4].data.id).toEqual(id1);
  });
});
