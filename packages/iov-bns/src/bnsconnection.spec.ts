import Long from "long";

import {
  Address,
  Algorithm,
  Amount,
  BcpAccount,
  BcpBlockInfo,
  BcpBlockInfoInBlock,
  BcpSwapQuery,
  BcpTransactionState,
  BcpTxQuery,
  ChainId,
  isSendTransaction,
  isSwapCounterTransaction,
  PostTxResponse,
  PublicIdentity,
  PublicKeyBundle,
  PublicKeyBytes,
  SendTransaction,
  SwapClaimTransaction,
  SwapIdBytes,
  SwapOfferTransaction,
  SwapState,
  TokenTicker,
} from "@iov/bcp-types";
import { Random, Sha256 } from "@iov/crypto";
import { Encoding, Uint64 } from "@iov/encoding";
import { Ed25519HdWallet, HdPaths, LocalIdentity, UserProfile, WalletId } from "@iov/keycontrol";
import { asArray, lastValue } from "@iov/stream";

import { bnsCodec } from "./bnscodec";
import { BnsConnection } from "./bnsconnection";
import { bnsFromOrToTag, bnsNonceTag, bnsSwapQueryTags } from "./tags";
import {
  AddAddressToUsernameTx,
  BnsAddressBytes,
  isRegisterBlockchainTx,
  isRegisterUsernameTx,
  RegisterBlockchainTx,
  RegisterUsernameTx,
  RemoveAddressFromUsernameTx,
} from "./types";
import { decodeBnsAddress, encodeBnsAddress, identityToAddress } from "./util";

function skipTests(): boolean {
  return !process.env.BNSD_ENABLED;
}

function pendingWithoutBnsd(): void {
  if (skipTests()) {
    pending("Set BNSD_ENABLED to enable bnsd-based tests");
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function tendermintSearchIndexUpdated(): Promise<void> {
  // Tendermint needs some time before a committed transaction is found in search
  return sleep(50);
}

async function randomBnsAddress(): Promise<Address> {
  return encodeBnsAddress("tiov", await Random.getBytes(20));
}

const cash = "CASH" as TokenTicker;

describe("BnsConnection", () => {
  const defaultChain = "chain123" as ChainId;
  // the first key generated from this mneumonic produces the given address
  // this account has money in the genesis file (setup in docker)
  // expectedFaucetAddress generated using https://github.com/nym-zone/bech32
  // bech32 -e -h tiov b1ca7e78f74423ae01da3b51e676934d9105f282
  const defaultMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
  // address must match defaultChain
  const defaultFaucetAddress = "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address;
  const defaultAmount: Amount = {
    quantity: "1000000001",
    fractionalDigits: 9,
    tokenTicker: cash,
  };

  const bnsdTendermintUrl = "ws://localhost:22345";

  async function userProfileWithFaucet(
    chainId: ChainId,
  ): Promise<{
    readonly profile: UserProfile;
    readonly mainWalletId: WalletId;
    readonly faucet: LocalIdentity;
  }> {
    const wallet = Ed25519HdWallet.fromMnemonic(defaultMnemonic);
    const profile = new UserProfile();
    profile.addWallet(wallet);
    const faucet = await profile.createIdentity(wallet.id, chainId, HdPaths.simpleAddress(0));
    return { profile, mainWalletId: wallet.id, faucet };
  }

  async function ensureNonceNonZero(
    connection: BnsConnection,
    profile: UserProfile,
    identity: PublicIdentity,
  ): Promise<void> {
    const sendTx: SendTransaction = {
      kind: "bcp/send",
      chainId: await connection.chainId(),
      signer: identity.pubkey,
      recipient: await randomBnsAddress(),
      amount: defaultAmount,
    };
    const firstWalletId = profile.wallets.value[0].id;
    const nonce = await connection.getNonce({ pubkey: identity.pubkey });
    const signed = await profile.signTransaction(firstWalletId, identity, sendTx, bnsCodec, nonce);
    const response = await connection.postTx(bnsCodec.bytesToPost(signed));
    await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
  }

  async function ensureBalanceNonZero(connection: BnsConnection, address: Address): Promise<void> {
    const { profile, mainWalletId, faucet } = await userProfileWithFaucet(connection.chainId());

    const sendTx: SendTransaction = {
      kind: "bcp/send",
      chainId: await connection.chainId(),
      signer: faucet.pubkey,
      recipient: address,
      amount: defaultAmount,
    };
    const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
    const signed = await profile.signTransaction(mainWalletId, faucet, sendTx, bnsCodec, nonce);
    const response = await connection.postTx(bnsCodec.bytesToPost(signed));
    await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
  }

  it("Generate proper faucet address", async () => {
    const { faucet } = await userProfileWithFaucet(defaultChain);
    const addr = identityToAddress(faucet);
    expect(addr).toEqual(defaultFaucetAddress);
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

    expect(response.data[1].tokenTicker).toEqual("BASH" as TokenTicker);
    expect(response.data[1].tokenName).toEqual("Another token of this chain");

    expect(response.data[2].tokenTicker).toEqual("CASH" as TokenTicker);
    expect(response.data[2].tokenName).toEqual("Main token of this chain");

    connection.disconnect();
  });

  describe("getAccount", () => {
    it("can get account by address, publicKey and name", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const { profile, faucet } = await userProfileWithFaucet(connection.chainId());
      await ensureNonceNonZero(connection, profile, faucet);
      const faucetAddress = identityToAddress(faucet);

      // can get the faucet by address (there is money)
      const responseFromAddress = await connection.getAccount({ address: faucetAddress });
      expect(responseFromAddress).toBeDefined();
      {
        const account = responseFromAddress!;
        expect(account.address).toEqual(faucetAddress);
        expect(account.pubkey).toEqual(faucet.pubkey);
        expect(account.name).toEqual("admin");
        expect(account.balance.length).toEqual(1);
        expect(account.balance[0].tokenTicker).toEqual(cash);
        expect(Number.parseInt(account.balance[0].quantity, 10)).toBeGreaterThan(1000000_000000000);
      }

      // can get the faucet by publicKey, same result
      const responseFromPubkey = await connection.getAccount({ pubkey: faucet.pubkey });
      expect(responseFromPubkey).toBeDefined();
      {
        const account = responseFromPubkey!;
        expect(account.address).toEqual(faucetAddress);
        expect(account.pubkey).toEqual(faucet.pubkey);
        expect(account.name).toEqual("admin");
        expect(account.balance.length).toEqual(1);
        expect(account.balance[0].tokenTicker).toEqual(cash);
        expect(Number.parseInt(account.balance[0].quantity, 10)).toBeGreaterThan(1000000_000000000);
      }

      connection.disconnect();
    });

    it("returns empty pubkey and name when getting an account with no outgoing transactions", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const newAddress = await randomBnsAddress();
      await ensureBalanceNonZero(connection, newAddress);

      const response = await connection.getAccount({ address: newAddress });
      expect(response).toBeDefined();
      {
        const account = response!;
        expect(account.address).toEqual(newAddress);
        expect(account.pubkey).toBeUndefined();
        expect(account.name).toBeUndefined();
      }

      connection.disconnect();
    });

    it("returns empty list when getting an unused account", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      // unusedAddress generated using https://github.com/nym-zone/bech32
      // bech32 -e -h tiov 010101020202030303040404050505050A0A0A0A
      const unusedAddress = "tiov1qyqszqszqgpsxqcyqszq2pg9q59q5zs2fx9n6s" as Address;
      const response = await connection.getAccount({ address: unusedAddress });
      expect(response).toBeUndefined();
      connection.disconnect();
    });
  });

  describe("getNonce", () => {
    it("can query empty nonce from unused account by address, pubkey and name", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);

      // by address
      const unusedAddress = "tiov1qyqszqszqgpsxqcyqszq2pg9q59q5zs2fx9n6s" as Address;
      const nonce1 = await connection.getNonce({ address: unusedAddress });
      expect(nonce1.toNumber()).toEqual(0);

      // by pubkey
      const unusedPubkey: PublicKeyBundle = {
        algo: Algorithm.Ed25519,
        data: Encoding.fromHex(
          "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        ) as PublicKeyBytes,
      };
      const nonce2 = await connection.getNonce({ pubkey: unusedPubkey });
      expect(nonce2.toNumber()).toEqual(0);

      connection.disconnect();
    });

    it("can query nonce from faucet by address, pubkey and name", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const { profile, faucet } = await userProfileWithFaucet(connection.chainId());
      await ensureNonceNonZero(connection, profile, faucet);

      // by address
      const faucetAddress = identityToAddress(faucet);
      const nonce1 = await connection.getNonce({ address: faucetAddress });
      expect(nonce1.toNumber()).toBeGreaterThan(0);

      // by pubkey
      const nonce2 = await connection.getNonce({ pubkey: faucet.pubkey });
      expect(nonce2.toNumber()).toBeGreaterThan(0);

      connection.disconnect();
    });
  });

  describe("postTx", () => {
    it("can send transaction", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, mainWalletId, faucet } = await userProfileWithFaucet(chainId);
      const faucetAddr = identityToAddress(faucet);
      const recipient = await randomBnsAddress();

      // construct a sendtx, this is normally used in the MultiChainSigner api
      const sendTx: SendTransaction = {
        kind: "bcp/send",
        chainId,
        signer: faucet.pubkey,
        recipient: recipient,
        memo: "My first payment",
        amount: {
          quantity: "5000075000",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
      };
      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(mainWalletId, faucet, sendTx, bnsCodec, nonce);
      const txBytes = bnsCodec.bytesToPost(signed);
      const response = await connection.postTx(txBytes);
      await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);

      // we should be a little bit richer
      const updatedAccount = await connection.getAccount({ address: recipient });
      expect(updatedAccount).toBeDefined();
      const paid = updatedAccount!;
      expect(paid.balance.length).toEqual(1);
      expect(paid.balance[0].quantity).toEqual("5000075000");

      // and the nonce should go up, to be at least one
      // (worrying about replay issues)
      const fNonce = await connection.getNonce({ pubkey: faucet.pubkey });
      expect(fNonce.toNumber()).toBeGreaterThanOrEqual(1);

      await tendermintSearchIndexUpdated();

      // now verify we can query the same tx back
      const txQuery = { tags: [bnsFromOrToTag(faucetAddr)] };
      const search = await connection.searchTx(txQuery);
      expect(search.length).toBeGreaterThanOrEqual(1);
      // make sure we get a valid signature
      const mine = search[search.length - 1];
      // make sure we have a txid
      expect(mine.transactionId).toMatch(/^[0-9A-F]{40}$/);
      expect(mine.primarySignature.nonce).toEqual(nonce);
      expect(mine.primarySignature.signature.length).toBeTruthy();
      expect(mine.otherSignatures.length).toEqual(0);
      const tx = mine.transaction;
      if (!isSendTransaction(tx)) {
        throw new Error("Expected send transaction");
      }
      expect(tx).toEqual(sendTx);

      connection.disconnect();
    });

    it("can post transaction and watch confirmations", done => {
      pendingWithoutBnsd();

      (async () => {
        const connection = await BnsConnection.establish(bnsdTendermintUrl);
        const chainId = connection.chainId();

        const { profile, mainWalletId, faucet } = await userProfileWithFaucet(chainId);
        const recipient = await randomBnsAddress();

        // construct a sendtx, this is normally used in the MultiChainSigner api
        const sendTx: SendTransaction = {
          kind: "bcp/send",
          chainId,
          signer: faucet.pubkey,
          recipient: recipient,
          memo: "My first payment",
          amount: {
            quantity: "5000075000",
            fractionalDigits: 9,
            tokenTicker: cash,
          },
        };
        const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
        const signed = await profile.signTransaction(mainWalletId, faucet, sendTx, bnsCodec, nonce);
        const heightBeforeTransaction = await connection.height();
        const result = await connection.postTx(bnsCodec.bytesToPost(signed));
        expect(result.blockInfo.value).toEqual({ state: BcpTransactionState.Pending });

        const events = new Array<BcpBlockInfo>();
        const subscription = result.blockInfo.updates.subscribe({
          next: info => {
            events.push(info);

            if (events.length === 3) {
              expect(events[0]).toEqual({
                state: BcpTransactionState.Pending,
              });
              expect(events[1]).toEqual({
                state: BcpTransactionState.InBlock,
                height: heightBeforeTransaction + 1,
                confirmations: 1,
                result: undefined,
              });
              expect(events[2]).toEqual({
                state: BcpTransactionState.InBlock,
                height: heightBeforeTransaction + 1,
                confirmations: 2,
                result: undefined,
              });

              subscription.unsubscribe();
              connection.disconnect();
              done();
            }
          },
          complete: done.fail,
          error: done.fail,
        });
      })().catch(done.fail);
    });

    describe("getBlockHeader", () => {
      it("can get a valid header", async () => {
        pendingWithoutBnsd();
        const connection = await BnsConnection.establish(bnsdTendermintUrl);
        const header = await connection.getBlockHeader(3);
        expect(header.height).toEqual(3);
        expect(header.id).toMatch(/^[0-9A-F]{40}$/);
        connection.disconnect();
      });

      it("throws if it cannot get header", async () => {
        pendingWithoutBnsd();
        const connection = await BnsConnection.establish(bnsdTendermintUrl);

        await connection
          .getBlockHeader(-3)
          .then(() => fail("must not resolve"))
          .catch(error => expect(error).toMatch(/height must be a non-negative safe integer/i));
        await connection
          .getBlockHeader(123_000000)
          .then(() => fail("must not resolve"))
          .catch(error => expect(error).toMatch(/header 123000000 doesn't exist yet/i));

        connection.disconnect();
      });
    });

    describe("watchBlockHeaders", () => {
      it("watches headers with same data as getBlockHeader", async () => {
        pendingWithoutBnsd();
        const connection = await BnsConnection.establish(bnsdTendermintUrl);

        const headers = lastValue(connection.watchBlockHeaders().take(2));
        await headers.finished();

        const subHeader = headers.value()!;
        const { height } = subHeader;

        const header = await connection.getBlockHeader(height);
        expect(header).toEqual(subHeader);

        connection.disconnect();
      });
    });

    it("can register a blockchain", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.simpleAddress(0));
      const identityAddress = identityToAddress(identity);

      // Create and send registration
      const chainId = `wonderland_${Math.random()}` as ChainId;
      const registration: RegisterBlockchainTx = {
        kind: "bns/register_blockchain",
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
      const nonce = await connection.getNonce({ pubkey: identity.pubkey });
      const signed = await profile.signTransaction(wallet.id, identity, registration, bnsCodec, nonce);
      const txBytes = bnsCodec.bytesToPost(signed);
      const response = await connection.postTx(txBytes);
      await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);

      await tendermintSearchIndexUpdated();

      // Find registration transaction
      const searchResult = await connection.searchTx({ tags: [bnsNonceTag(identityAddress)] });
      expect(searchResult.length).toEqual(1);
      const firstSearchResult = searchResult[0].transaction;
      if (!isRegisterBlockchainTx(firstSearchResult)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(firstSearchResult.chain).toEqual({
        chainId: chainId,
        production: false,
        enabled: true,
        name: "Wonderland",
        networkId: "7rg047g4h",
        mainTickerId: undefined,
      });
      expect(firstSearchResult.codecName).toEqual("wonderland_rules");
      expect(firstSearchResult.codecConfig).toEqual(`{ "any" : [ "json", "content" ] }`);

      connection.disconnect();
    });

    it("can register a username", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.simpleAddress(0));

      // Create and send registration
      const address = identityToAddress(identity);
      const username = `testuser_${Math.random()}`;
      const registration: RegisterUsernameTx = {
        kind: "bns/register_username",
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
      const nonce = await connection.getNonce({ pubkey: identity.pubkey });
      const signed = await profile.signTransaction(wallet.id, identity, registration, bnsCodec, nonce);
      const txBytes = bnsCodec.bytesToPost(signed);
      const response = await connection.postTx(txBytes);
      await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);

      await tendermintSearchIndexUpdated();

      // Find registration transaction
      const searchResult = await connection.searchTx({ tags: [bnsNonceTag(address)] });
      expect(searchResult.length).toEqual(1);
      const firstSearchResultTransaction = searchResult[0].transaction;
      if (!isRegisterUsernameTx(firstSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(firstSearchResultTransaction.username).toEqual(username);
      expect(firstSearchResultTransaction.addresses.length).toEqual(0);

      connection.disconnect();
    });

    it("can add address to username and remove again", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.simpleAddress(0));

      // Create and send registration
      const username = `testuser_${Math.random()}`;
      const usernameRegistration: RegisterUsernameTx = {
        kind: "bns/register_username",
        chainId: registryChainId,
        signer: identity.pubkey,
        username: username,
        addresses: [],
      };
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              wallet.id,
              identity,
              usernameRegistration,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
      }

      // Register a blockchain
      const chainId = `wonderland_${Math.random()}` as ChainId;
      const blockchainRegistration: RegisterBlockchainTx = {
        kind: "bns/register_blockchain",
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
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              wallet.id,
              identity,
              blockchainRegistration,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
      }

      // Add address
      const address = `testaddress_${Math.random()}` as Address;
      const addAddress: AddAddressToUsernameTx = {
        kind: "bns/add_address_to_username",
        chainId: registryChainId,
        signer: identity.pubkey,
        username: username,
        payload: {
          chainId: chainId,
          address: address,
        },
      };
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              wallet.id,
              identity,
              addAddress,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
      }

      // Adding second address for the same chain fails
      const address2 = `testaddress2_${Math.random()}` as Address;
      const addAddress2: AddAddressToUsernameTx = {
        kind: "bns/add_address_to_username",
        chainId: registryChainId,
        signer: identity.pubkey,
        username: username,
        payload: {
          chainId: chainId,
          address: address2,
        },
      };
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              wallet.id,
              identity,
              addAddress2,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );

        // a promise that should never resolve
        const inBlock = response.blockInfo
          .waitFor(info => info.state === BcpTransactionState.InBlock)
          .then(() => fail("must not resolve"));
        await sleep(2_000); // wait to test the chance to fail
        expect(inBlock).toBeTruthy(); // there is no API to get the status; must be pending.
      }

      // Remove address
      const removeAddress: RemoveAddressFromUsernameTx = {
        kind: "bns/remove_address_from_username",
        chainId: registryChainId,
        signer: identity.pubkey,
        username: username,
        payload: {
          chainId: chainId,
          address: address,
        },
      };
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              wallet.id,
              identity,
              removeAddress,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
      }

      // Do the same removal again
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              wallet.id,
              identity,
              removeAddress,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );

        // a promise that should never resolve
        const inBlock = response.blockInfo
          .waitFor(info => info.state === BcpTransactionState.InBlock)
          .then(() => fail("must not resolve"));
        await sleep(2_000); // wait to test the chance to fail
        expect(inBlock).toBeTruthy(); // there is no API to get the status; must be pending.
      }

      connection.disconnect();
    });
  });

  describe("searchTx", () => {
    it("can search for transactions by tags", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, mainWalletId, faucet } = await userProfileWithFaucet(chainId);
      const rcptAddress = await randomBnsAddress();

      // construct a sendtx, this is normally used in the MultiChainSigner api
      const memo = `Payment ${Math.random()}`;
      const sendTx: SendTransaction = {
        kind: "bcp/send",
        chainId: chainId,
        signer: faucet.pubkey,
        recipient: rcptAddress,
        memo: memo,
        amount: defaultAmount,
      };

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(mainWalletId, faucet, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);

      await tendermintSearchIndexUpdated();

      // finds transaction using tag
      const results = await connection.searchTx({ tags: [bnsFromOrToTag(rcptAddress)] });
      expect(results.length).toBeGreaterThanOrEqual(1);
      const mostRecentResultTransaction = results[results.length - 1].transaction;
      if (!isSendTransaction(mostRecentResultTransaction)) {
        throw new Error("Expected send transaction");
      }
      expect(mostRecentResultTransaction.memo).toEqual(memo);

      connection.disconnect();
    });

    it("can search for transactions by height", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, mainWalletId, faucet } = await userProfileWithFaucet(chainId);
      const rcptAddress = await randomBnsAddress();

      // construct a sendtx, this is normally used in the MultiChainSigner api
      const memo = `Payment ${Math.random()}`;
      const sendTx: SendTransaction = {
        kind: "bcp/send",
        chainId: chainId,
        signer: faucet.pubkey,
        recipient: rcptAddress,
        memo: memo,
        amount: defaultAmount,
      };

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(mainWalletId, faucet, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const blockInfo = await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
      const txHeight = (blockInfo as BcpBlockInfoInBlock).height;

      await tendermintSearchIndexUpdated();

      // finds transaction using height
      const results = await connection.searchTx({ height: txHeight });
      expect(results.length).toBeGreaterThanOrEqual(1);
      const mostRecentResultTransaction = results[results.length - 1].transaction;
      if (!isSendTransaction(mostRecentResultTransaction)) {
        throw new Error("Expected send transaction");
      }
      expect(mostRecentResultTransaction.memo).toEqual(memo);

      connection.disconnect();
    });

    it("can search for transactions by ID", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, mainWalletId, faucet } = await userProfileWithFaucet(chainId);

      const memo = `Payment ${Math.random()}`;
      const sendTx: SendTransaction = {
        kind: "bcp/send",
        chainId: chainId,
        signer: faucet.pubkey,
        recipient: await randomBnsAddress(),
        memo: memo,
        amount: {
          quantity: "1000000001",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
      };

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(mainWalletId, faucet, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
      const transactionIdToSearch = response.transactionId;

      await tendermintSearchIndexUpdated();

      // finds transaction using id
      const searchResults = await connection.searchTx({ id: transactionIdToSearch });
      expect(searchResults.length).toEqual(1);
      expect(searchResults[0].transactionId).toEqual(transactionIdToSearch);
      const searchResultTransaction = searchResults[0].transaction;
      if (!isSendTransaction(searchResultTransaction)) {
        throw new Error("Expected send transaction");
      }
      expect(searchResultTransaction.memo).toEqual(memo);

      connection.disconnect();
    });

    // Activate when https://github.com/tendermint/tendermint/issues/2759 is fixed
    xit("can search for transactions by minHeight/maxHeight", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();
      const initialHeight = await connection.height();

      const { profile, mainWalletId, faucet } = await userProfileWithFaucet(chainId);
      const rcpt = await profile.createIdentity(mainWalletId, defaultChain, HdPaths.simpleAddress(68));
      const rcptAddress = identityToAddress(rcpt);

      // construct a sendtx, this is normally used in the MultiChainSigner api
      const memo = `Payment ${Math.random()}`;
      const sendTx: SendTransaction = {
        kind: "bcp/send",
        chainId: chainId,
        signer: faucet.pubkey,
        recipient: rcptAddress,
        memo: memo,
        amount: {
          quantity: "1000000001",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
      };

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(mainWalletId, faucet, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);

      await tendermintSearchIndexUpdated();

      {
        // finds transaction using tag and minHeight = 1
        const results = await connection.searchTx({ tags: [bnsFromOrToTag(rcptAddress)], minHeight: 1 });
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResultTransaction = results[results.length - 1].transaction;
        if (!isSendTransaction(mostRecentResultTransaction)) {
          throw new Error("Expected send transaction");
        }
        expect(mostRecentResultTransaction.memo).toEqual(memo);
      }

      {
        // finds transaction using tag and minHeight = initialHeight
        const results = await connection.searchTx({
          tags: [bnsFromOrToTag(rcptAddress)],
          minHeight: initialHeight,
        });
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResultTransaction = results[results.length - 1].transaction;
        if (!isSendTransaction(mostRecentResultTransaction)) {
          throw new Error("Expected send transaction");
        }
        expect(mostRecentResultTransaction.memo).toEqual(memo);
      }

      {
        // finds transaction using tag and maxHeight = 500 million
        const results = await connection.searchTx({
          tags: [bnsFromOrToTag(rcptAddress)],
          maxHeight: 500_000_000,
        });
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResultTransaction = results[results.length - 1].transaction;
        if (!isSendTransaction(mostRecentResultTransaction)) {
          throw new Error("Expected send transaction");
        }
        expect(mostRecentResultTransaction.memo).toEqual(memo);
      }

      {
        // finds transaction using tag and maxHeight = initialHeight + 10
        const results = await connection.searchTx({
          tags: [bnsFromOrToTag(rcptAddress)],
          maxHeight: initialHeight + 10,
        });
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResultTransaction = results[results.length - 1].transaction;
        if (!isSendTransaction(mostRecentResultTransaction)) {
          throw new Error("Expected send transaction");
        }
        expect(mostRecentResultTransaction.memo).toEqual(memo);
      }

      connection.disconnect();
    });
  });

  describe("listenTx", () => {
    it("can listen to transactions by hash", done => {
      pendingWithoutBnsd();

      (async () => {
        const connection = await BnsConnection.establish(bnsdTendermintUrl);
        const chainId = connection.chainId();

        const { profile, mainWalletId, faucet } = await userProfileWithFaucet(chainId);

        const memo = `Payment ${Math.random()}`;
        const sendTx: SendTransaction = {
          kind: "bcp/send",
          chainId: chainId,
          signer: faucet.pubkey,
          recipient: await randomBnsAddress(),
          memo: memo,
          amount: {
            quantity: "1000000001",
            fractionalDigits: 9,
            tokenTicker: cash,
          },
        };

        const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
        const signed = await profile.signTransaction(mainWalletId, faucet, sendTx, bnsCodec, nonce);
        const transactionId = bnsCodec.identifier(signed);
        const heightBeforeTransaction = await connection.height();

        // start listening
        const subscription = connection.listenTx({ id: transactionId }).subscribe({
          next: event => {
            expect(event.transactionId).toEqual(transactionId);
            expect(event.height).toEqual(heightBeforeTransaction + 1);

            subscription.unsubscribe();
            connection.disconnect();
            done();
          },
          complete: () => done.fail("Stream completed before we are done"),
          error: done.fail,
        });

        // post transaction
        await connection.postTx(bnsCodec.bytesToPost(signed));
      })().catch(done.fail);
    });
  });

  describe("getBlockchains", () => {
    it("can query blockchains by chain ID", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.simpleAddress(0));
      const identityAddress = identityToAddress(identity);

      // Register blockchain
      const chainId = `wonderland_${Math.random()}` as ChainId;
      const blockchainRegistration: RegisterBlockchainTx = {
        kind: "bns/register_blockchain",
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
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              wallet.id,
              identity,
              blockchainRegistration,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
      }

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
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.simpleAddress(0));
      const identityAddress = identityToAddress(identity);

      // Register username
      const username = `testuser_${Math.random()}`;
      const registration: RegisterUsernameTx = {
        kind: "bns/register_username",
        chainId: registryChainId,
        signer: identity.pubkey,
        addresses: [],
        username: username,
      };
      const nonce = await connection.getNonce({ pubkey: identity.pubkey });
      const signed = await profile.signTransaction(wallet.id, identity, registration, bnsCodec, nonce);
      {
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
      }

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
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(await Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.simpleAddress(0));
      const identityAddress = identityToAddress(identity);

      // Register blockchain
      const chainId = `wonderland_${Math.random()}` as ChainId;
      const blockchainRegistration: RegisterBlockchainTx = {
        kind: "bns/register_blockchain",
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
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              wallet.id,
              identity,
              blockchainRegistration,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
      }

      // Register username
      const username = `testuser_${Math.random()}`;
      const usernameRegistration: RegisterUsernameTx = {
        kind: "bns/register_username",
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
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              wallet.id,
              identity,
              usernameRegistration,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        await response.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
      }

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

    connection.disconnect();
  });

  const sendCash = async (
    connection: BnsConnection,
    profile: UserProfile,
    faucet: PublicIdentity,
    rcptAddr: Address,
  ): Promise<PostTxResponse> => {
    // construct a sendtx, this is normally used in the MultiChainSigner api
    const chainId = await connection.chainId();
    const sendTx: SendTransaction = {
      kind: "bcp/send",
      chainId,
      signer: faucet.pubkey,
      recipient: rcptAddr,
      amount: {
        quantity: "68000000000",
        fractionalDigits: 9,
        tokenTicker: cash,
      },
    };
    const firstWalletId = profile.wallets.value[0].id;
    const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
    const signed = await profile.signTransaction(firstWalletId, faucet, sendTx, bnsCodec, nonce);
    const txBytes = bnsCodec.bytesToPost(signed);
    return connection.postTx(txBytes);
  };

  it("can get live tx feed", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    const { profile, faucet } = await userProfileWithFaucet(connection.chainId());
    const recipientAddress = await randomBnsAddress();

    // make sure that we have no tx here
    const query: BcpTxQuery = { tags: [bnsFromOrToTag(recipientAddress)] };
    const origSearch = await connection.searchTx(query);
    expect(origSearch.length).toEqual(0);

    const post = await sendCash(connection, profile, faucet, recipientAddress);
    await post.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
    const firstId = post.transactionId;
    expect(firstId).toMatch(/^[0-9A-F]{40}$/);

    await tendermintSearchIndexUpdated();

    const middleSearch = await connection.searchTx(query);
    expect(middleSearch.length).toEqual(1);

    // live.value() maintains all transactions
    const live = asArray(connection.liveTx(query));

    const secondPost = await sendCash(connection, profile, faucet, recipientAddress);
    await secondPost.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
    const secondId = secondPost.transactionId;
    expect(secondId).toMatch(/^[0-9A-F]{40}$/);

    await tendermintSearchIndexUpdated();

    const afterSearch = await connection.searchTx(query);
    expect(afterSearch.length).toEqual(2);
    // make sure we have unique, defined txids
    const transactionIds = afterSearch.map(tx => tx.transactionId);
    expect(transactionIds.length).toEqual(2);
    expect(transactionIds[0]).toEqual(firstId);
    expect(transactionIds[1]).toEqual(secondId);
    expect(transactionIds[0]).not.toEqual(transactionIds[1]);

    // give time for all events to be processed
    await sleep(100);
    // this should grab the tx before it started, as well as the one after
    expect(live.value().length).toEqual(2);
    // make sure the txids also match
    expect(live.value()[0].transactionId).toEqual(afterSearch[0].transactionId);
    expect(live.value()[1].transactionId).toEqual(afterSearch[1].transactionId);

    connection.disconnect();
  });

  it("can provide change feeds", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    const { profile, mainWalletId, faucet } = await userProfileWithFaucet(connection.chainId());

    const faucetAddr = identityToAddress(faucet);
    const rcpt = await profile.createIdentity(mainWalletId, defaultChain, HdPaths.simpleAddress(87));
    const rcptAddr = identityToAddress(rcpt);

    // let's watch for all changes, capture them in arrays
    const balanceFaucet = asArray(connection.changeBalance(faucetAddr));
    const balanceRcpt = asArray(connection.changeBalance(rcptAddr));
    const nonceFaucet = asArray(connection.changeNonce(faucetAddr));
    const nonceRcpt = asArray(connection.changeNonce(rcptAddr));

    const post1 = await sendCash(connection, profile, faucet, rcptAddr);
    const blockInfo1 = await post1.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
    const transactionHeight1 = (blockInfo1 as BcpBlockInfoInBlock).height;
    expect(transactionHeight1).toBeGreaterThanOrEqual(1);

    const post2 = await sendCash(connection, profile, faucet, rcptAddr);
    const blockInfo2 = await post2.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
    const transactionHeight2 = (blockInfo2 as BcpBlockInfoInBlock).height;
    expect(transactionHeight2).toBeGreaterThanOrEqual(transactionHeight1 + 1);

    // give time for all events to be processed
    await sleep(50);

    // both should show up on the balance changes
    expect(balanceFaucet.value().length).toEqual(2);
    expect(balanceRcpt.value().length).toEqual(2);

    // only faucet should show up on the nonce changes
    expect(nonceFaucet.value().length).toEqual(2);
    expect(nonceRcpt.value().length).toEqual(0);

    // make sure proper values
    expect(balanceFaucet.value()).toEqual([transactionHeight1!, transactionHeight2!]);

    connection.disconnect();
  });

  // make sure we can get a reactive account balance (as well as nonce)
  it("can watch accounts", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    const { profile, faucet } = await userProfileWithFaucet(connection.chainId());
    const recipientAddr = await randomBnsAddress();

    // watch account by pubkey and by address
    const faucetAccountStream = connection.watchAccount({ pubkey: faucet.pubkey });
    const recipientAccountStream = connection.watchAccount({ address: recipientAddr });

    // let's watch for all changes, capture them in a value sink
    const faucetAcct = lastValue<BcpAccount | undefined>(faucetAccountStream);
    const rcptAcct = lastValue<BcpAccount | undefined>(recipientAccountStream);

    // give it a chance to get initial feed before checking and proceeding
    await sleep(200);

    // make sure there are original values sent on the wire
    expect(rcptAcct.value()).toBeUndefined();
    expect(faucetAcct.value()).toBeDefined();
    expect(faucetAcct.value()!.name).toEqual("admin");
    expect(faucetAcct.value()!.balance.length).toEqual(1);
    const faucetStartBalance = faucetAcct.value()!.balance[0];

    // send some cash
    const post = await sendCash(connection, profile, faucet, recipientAddr);
    await post.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);

    // give it a chance to get updates before checking and proceeding
    await sleep(100);

    // rcptAcct should now have a value
    expect(rcptAcct.value()).toBeDefined();
    expect(rcptAcct.value()!.name).toBeUndefined();
    expect(rcptAcct.value()!.balance.length).toEqual(1);
    expect(rcptAcct.value()!.balance[0].quantity).toEqual("68000000000");

    // facuetAcct should have gone down a bit
    expect(faucetAcct.value()).toBeDefined();
    expect(faucetAcct.value()!.name).toEqual("admin");
    expect(faucetAcct.value()!.balance.length).toEqual(1);
    const faucetEndBalance = faucetAcct.value()!.balance[0];
    expect(faucetEndBalance).not.toEqual(faucetStartBalance);
    expect(faucetEndBalance.quantity).toEqual(
      Long.fromString(faucetStartBalance.quantity)
        .subtract(68_000000000)
        .toString(),
    );

    connection.disconnect();
  });

  it("can start atomic swap", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    const chainId = connection.chainId();

    const { profile, mainWalletId, faucet } = await userProfileWithFaucet(chainId);
    const faucetAddr = identityToAddress(faucet);
    const recipientAddr = await randomBnsAddress();

    const initSwaps = await connection.getSwap({ recipient: recipientAddr });
    expect(initSwaps.data.length).toEqual(0);

    const swapOfferPreimage = Encoding.toAscii(`my top secret phrase... ${Math.random()}`);
    const swapOfferHash = new Sha256(swapOfferPreimage).digest();
    const swapOfferTimeout = (await connection.height()) + 1000;
    const swapOfferTx: SwapOfferTransaction = {
      kind: "bcp/swap_offer",
      chainId,
      signer: faucet.pubkey,
      recipient: recipientAddr,
      amount: [
        {
          quantity: "123000456000",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
      ],
      timeout: swapOfferTimeout,
      preimage: swapOfferPreimage,
    };

    const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
    const signed = await profile.signTransaction(mainWalletId, faucet, swapOfferTx, bnsCodec, nonce);
    const post = await connection.postTx(bnsCodec.bytesToPost(signed));
    const transactionId = post.transactionId;
    expect(transactionId).toMatch(/^[0-9A-F]{40}$/);

    const blockInfo = await post.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
    const txHeight = (blockInfo as BcpBlockInfoInBlock).height;
    const txResult = (blockInfo as BcpBlockInfoInBlock).result!;
    // the transaction result is 8 byte number assigned by the application
    expect(Uint64.fromBytesBigEndian(txResult).toNumber()).toBeGreaterThanOrEqual(1);
    expect(Uint64.fromBytesBigEndian(txResult).toNumber()).toBeLessThanOrEqual(1000);

    await tendermintSearchIndexUpdated();

    // now query by the txid
    const search = await connection.searchTx({ id: transactionId });
    expect(search.length).toEqual(1);
    // make sure we get he same tx loaded
    const loaded = search[0];
    expect(loaded.transactionId).toEqual(transactionId);
    // make sure it also stored a result
    expect(loaded.result).toEqual(txResult);
    expect(loaded.height).toEqual(txHeight);
    // we never write the offer (with preimage) to a chain, only convert it to a SwapCounterTx
    // which only has the hashed data, then commit it (thus the different kind is expected)
    const loadedTransaction = loaded.transaction;
    if (!isSwapCounterTransaction(loadedTransaction)) {
      throw new Error("Wrong transaction type");
    }
    expect(loadedTransaction.recipient).toEqual(swapOfferTx.recipient);

    // ----  prepare queries
    const querySwapId: BcpSwapQuery = { swapid: txResult as SwapIdBytes };
    const querySwapSender: BcpSwapQuery = { sender: faucetAddr };
    const querySwapRecipient: BcpSwapQuery = { recipient: recipientAddr };
    const querySwapHash: BcpSwapQuery = { hashlock: swapOfferHash };

    // ----- connection.searchTx() -----
    // we should be able to find the transaction through quite a number of tag queries

    const txById = await connection.searchTx({ tags: [bnsSwapQueryTags(querySwapId)] });
    expect(txById.length).toEqual(1);
    expect(txById[0].transactionId).toEqual(transactionId);

    const txBySender = await connection.searchTx({ tags: [bnsSwapQueryTags(querySwapSender)] });
    expect(txBySender.length).toBeGreaterThanOrEqual(1);
    expect(txBySender[txBySender.length - 1].transactionId).toEqual(transactionId);

    const txByRecipient = await connection.searchTx({ tags: [bnsSwapQueryTags(querySwapRecipient)] });
    expect(txByRecipient.length).toEqual(1);
    expect(txByRecipient[0].transactionId).toEqual(transactionId);

    const txByHash = await connection.searchTx({ tags: [bnsSwapQueryTags(querySwapHash)] });
    expect(txByHash.length).toEqual(1);
    expect(txByHash[0].transactionId).toEqual(transactionId);

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
    expect(swapData.recipient).toEqual(recipientAddr);
    expect(swapData.timeout).toEqual(swapOfferTimeout);
    expect(swapData.amount.length).toEqual(1);
    expect(swapData.amount[0].quantity).toEqual("123000456000");
    expect(swapData.amount[0].tokenTicker).toEqual(cash);
    expect(swapData.hashlock).toEqual(swapOfferHash);

    // we can get the swap by the recipient
    const rcptSwap = await connection.getSwap(querySwapRecipient);
    expect(rcptSwap.data.length).toEqual(1);
    expect(rcptSwap.data[0]).toEqual(swap);

    // we can also get it by the sender
    const sendOpenSwapData = (await connection.getSwap(querySwapSender)).data.filter(
      s => s.kind === SwapState.Open,
    );
    expect(sendOpenSwapData.length).toBeGreaterThanOrEqual(1);
    expect(sendOpenSwapData[sendOpenSwapData.length - 1]).toEqual(swap);

    // we can also get it by the hash
    const hashSwap = await connection.getSwap(querySwapHash);
    expect(hashSwap.data.length).toEqual(1);
    expect(hashSwap.data[0]).toEqual(swap);

    connection.disconnect();
  });

  const openSwap = async (
    connection: BnsConnection,
    profile: UserProfile,
    sender: PublicIdentity,
    rcptAddr: Address,
    preimage: Uint8Array,
  ): Promise<PostTxResponse> => {
    // construct a swapOfferTx, sign and post to the chain
    const chainId = await connection.chainId();
    const swapOfferTimeout = (await connection.height()) + 1000;
    const swapOfferTx: SwapOfferTransaction = {
      kind: "bcp/swap_offer",
      chainId,
      signer: sender.pubkey,
      recipient: rcptAddr,
      amount: [
        {
          quantity: "21000000000",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
      ],
      timeout: swapOfferTimeout,
      preimage,
    };
    const firstWalletId = profile.wallets.value[0].id;
    const nonce = await connection.getNonce({ pubkey: sender.pubkey });
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
  ): Promise<PostTxResponse> => {
    // construct a swapOfferTx, sign and post to the chain
    const chainId = await connection.chainId();
    const swapClaimTx: SwapClaimTransaction = {
      kind: "bcp/swap_claim",
      chainId,
      signer: sender.pubkey,
      swapId,
      preimage,
    };
    const firstWalletId = profile.wallets.value[0].id;
    const nonce = await connection.getNonce({ pubkey: sender.pubkey });
    const signed = await profile.signTransaction(firstWalletId, sender, swapClaimTx, bnsCodec, nonce);
    const txBytes = bnsCodec.bytesToPost(signed);
    return connection.postTx(txBytes);
  };

  it("can start and watch an atomic swap lifecycle", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    const { profile, faucet } = await userProfileWithFaucet(connection.chainId());
    const recipientAddr = await randomBnsAddress();

    // create the preimages for the three swaps
    const preimage1 = Encoding.toAscii("the first swap is easy");
    // const hash1 = new Sha256(preimage1).digest();
    const preimage2 = Encoding.toAscii("ze 2nd iS l337 !@!");
    // const hash2 = new Sha256(preimage2).digest();
    const preimage3 = Encoding.toAscii("and this one is a gift.");
    // const hash3 = new Sha256(preimage3).digest();

    // nothing to start with
    const rcptQuery = { recipient: recipientAddr };
    const initSwaps = await connection.getSwap(rcptQuery);
    expect(initSwaps.data.length).toEqual(0);

    // make two offers
    const post1 = await openSwap(connection, profile, faucet, recipientAddr, preimage1);
    const blockInfo1 = await post1.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
    const id1 = (blockInfo1 as BcpBlockInfoInBlock).result! as SwapIdBytes;
    expect(id1.length).toEqual(8);

    const post2 = await openSwap(connection, profile, faucet, recipientAddr, preimage2);
    const blockInfo2 = await post2.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
    const id2 = (blockInfo2 as BcpBlockInfoInBlock).result! as SwapIdBytes;
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
    {
      const post = await claimSwap(connection, profile, faucet, id2, preimage1);
      await post.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
    }

    // start to watch
    const liveView = asArray(connection.watchSwap(rcptQuery));

    const post3 = await openSwap(connection, profile, faucet, recipientAddr, preimage3);
    const blockInfo3 = await post3.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
    const id3 = (blockInfo3 as BcpBlockInfoInBlock).result! as SwapIdBytes;
    expect(id3.length).toEqual(8);

    {
      const post = await claimSwap(connection, profile, faucet, id1, preimage1);
      await post.blockInfo.waitFor(info => info.state === BcpTransactionState.InBlock);
    }

    // make sure we find two claims, one open
    const finalSwaps = await connection.getSwap({ recipient: recipientAddr });
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

    connection.disconnect();
  });
});
