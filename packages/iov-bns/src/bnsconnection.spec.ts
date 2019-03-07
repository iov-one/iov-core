import Long from "long";

import {
  Account,
  Address,
  Algorithm,
  Amount,
  AtomicSwap,
  AtomicSwapHelpers,
  AtomicSwapQuery,
  BlockInfo,
  BlockInfoFailed,
  BlockInfoSucceeded,
  ChainId,
  isBlockInfoPending,
  isBlockInfoSucceeded,
  isConfirmedTransaction,
  isFailedTransaction,
  isSendTransaction,
  isSwapOfferTransaction,
  PostTxResponse,
  Preimage,
  PublicIdentity,
  PublicKeyBundle,
  PublicKeyBytes,
  SendTransaction,
  SwapClaimTransaction,
  SwapIdBytes,
  SwapOfferTransaction,
  SwapState,
  TokenTicker,
  TransactionState,
} from "@iov/bcp";
import { Random, Sha256 } from "@iov/crypto";
import { Encoding, Uint64 } from "@iov/encoding";
import { Ed25519HdWallet, HdPaths, UserProfile, WalletId } from "@iov/keycontrol";
import { asArray, firstEvent, lastValue, toListPromise } from "@iov/stream";

import { bnsCodec } from "./bnscodec";
import { BnsConnection } from "./bnsconnection";
import { bnsSwapQueryTag } from "./tags";
import {
  AddAddressToUsernameTx,
  isRegisterBlockchainTx,
  isRegisterUsernameTx,
  RegisterBlockchainTx,
  RegisterUsernameTx,
  RemoveAddressFromUsernameTx,
} from "./types";
import { encodeBnsAddress, identityToAddress } from "./util";

const { toHex } = Encoding;

function skipTests(): boolean {
  return !process.env.BNSD_ENABLED;
}

function pendingWithoutBnsd(): void {
  if (skipTests()) {
    pending("Set BNSD_ENABLED to enable bnsd-based tests");
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tendermintSearchIndexUpdated(): Promise<void> {
  // Tendermint needs some time before a committed transaction is found in search
  return sleep(50);
}

async function randomBnsAddress(): Promise<Address> {
  return encodeBnsAddress("tiov", await Random.getBytes(20));
}

const cash = "CASH" as TokenTicker;
const blockTime = 1000;

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
    readonly faucet: PublicIdentity;
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
      creator: identity,
      recipient: await randomBnsAddress(),
      amount: defaultAmount,
    };
    const firstWalletId = profile.wallets.value[0].id;
    const nonce = await connection.getNonce({ pubkey: identity.pubkey });
    const signed = await profile.signTransaction(firstWalletId, sendTx, bnsCodec, nonce);
    const response = await connection.postTx(bnsCodec.bytesToPost(signed));
    await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
  }

  async function ensureBalanceNonZero(connection: BnsConnection, address: Address): Promise<void> {
    const { profile, mainWalletId, faucet } = await userProfileWithFaucet(connection.chainId());

    const sendTx: SendTransaction = {
      kind: "bcp/send",
      creator: faucet,
      recipient: address,
      amount: defaultAmount,
    };
    const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
    const signed = await profile.signTransaction(mainWalletId, sendTx, bnsCodec, nonce);
    const response = await connection.postTx(bnsCodec.bytesToPost(signed));
    await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
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

    const tickers = await connection.getAllTickers();
    expect(tickers.length).toEqual(3);

    expect(tickers[0].tokenTicker).toEqual("ASH" as TokenTicker);
    expect(tickers[0].tokenName).toEqual("Let the Phoenix arise");

    expect(tickers[1].tokenTicker).toEqual("BASH" as TokenTicker);
    expect(tickers[1].tokenName).toEqual("Another token of this chain");

    expect(tickers[2].tokenTicker).toEqual("CASH" as TokenTicker);
    expect(tickers[2].tokenName).toEqual("Main token of this chain");

    connection.disconnect();
  });

  describe("getAccount", () => {
    it("can get account by address and pubkey", async () => {
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
    it("can query empty nonce from unused account by address and pubkey", async () => {
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

    it("can query nonce from faucet by address and pubkey", async () => {
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

  describe("getNonces", () => {
    it("can get 0/1/2 nonces", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const { faucet } = await userProfileWithFaucet(connection.chainId());
      const faucetAddress = identityToAddress(faucet);

      // by address, 0 nonces
      {
        const nonces = await connection.getNonces({ address: faucetAddress }, 0);
        expect(nonces.length).toEqual(0);
      }

      // by address, 1 nonces
      {
        const nonces = await connection.getNonces({ address: faucetAddress }, 1);
        expect(nonces.length).toEqual(1);
      }

      // by address, 2 nonces
      {
        const nonces = await connection.getNonces({ address: faucetAddress }, 2);
        expect(nonces.length).toEqual(2);
        expect(nonces[1].toNumber()).toEqual(nonces[0].toNumber() + 1);
      }

      // by pubkey, 0 nonces
      {
        const nonces = await connection.getNonces({ pubkey: faucet.pubkey }, 0);
        expect(nonces.length).toEqual(0);
      }

      // by pubkey, 1 nonces
      {
        const nonces = await connection.getNonces({ pubkey: faucet.pubkey }, 1);
        expect(nonces.length).toEqual(1);
      }

      // by pubkey, 2 nonces
      {
        const nonces = await connection.getNonces({ pubkey: faucet.pubkey }, 2);
        expect(nonces.length).toEqual(2);
        expect(nonces[1].toNumber()).toEqual(nonces[0].toNumber() + 1);
      }

      connection.disconnect();
    });
  });

  describe("getBlockHeader", () => {
    it("can get a valid header", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const header = await connection.getBlockHeader(3);
      expect(header.height).toEqual(3);
      // as of tendermint v0.26.0, hashes are 32-bytes, previously 20 bytes
      expect(header.id).toMatch(/^[0-9A-F]{64}$/);
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

      const headers = await toListPromise(connection.watchBlockHeaders(), 2);

      const lastHeight = headers[headers.length - 1].height;
      const headerFromGet = await connection.getBlockHeader(lastHeight);

      // first header
      expect(headers[0].height).toEqual(headerFromGet.height - 1);
      // expect(headers[0].id).not.toEqual(headerFromGet.id);
      expect(headers[0].transactionCount).toBeGreaterThanOrEqual(0);
      expect(headers[0].time.getTime()).toBeGreaterThan(headerFromGet.time.getTime() - blockTime - 200);
      expect(headers[0].time.getTime()).toBeLessThan(headerFromGet.time.getTime() - blockTime + 200);

      // second header
      expect(headers[1].height).toEqual(headerFromGet.height);
      // expect(headers[1].id).toEqual(headerFromGet.id);
      expect(headers[1].transactionCount).toEqual(headerFromGet.transactionCount);
      expect(headers[1].time).toEqual(headerFromGet.time);

      connection.disconnect();
    });
  });

  describe("postTx", () => {
    it("can send transaction", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();
      const initialHeight = await connection.height();

      const { profile, mainWalletId, faucet } = await userProfileWithFaucet(chainId);
      const faucetAddr = identityToAddress(faucet);
      const recipient = await randomBnsAddress();

      // construct a sendtx, this is normally used in the MultiChainSigner api
      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: faucet,
        recipient: recipient,
        memo: "My first payment",
        amount: {
          quantity: "5000075000",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
      };
      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(mainWalletId, sendTx, bnsCodec, nonce);
      const txBytes = bnsCodec.bytesToPost(signed);
      const response = await connection.postTx(txBytes);
      const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo.state).toEqual(TransactionState.Succeeded);

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
      const search = (await connection.searchTx({ sentFromOrTo: faucetAddr })).filter(isConfirmedTransaction);
      expect(search.length).toBeGreaterThanOrEqual(1);
      // make sure we get a valid signature
      const mine = search[search.length - 1];
      // make sure we have a txid
      expect(mine.height).toBeGreaterThan(initialHeight);
      expect(mine.transactionId).toMatch(/^[0-9A-F]{64}$/);
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

    it("can send transaction with fees", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, mainWalletId, faucet } = await userProfileWithFaucet(chainId);

      const initialBalance = (await connection.getAccount({ pubkey: faucet.pubkey }))!.balance.find(
        coin => coin.tokenTicker === cash,
      )!;

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: faucet,
        recipient: await randomBnsAddress(),
        memo: "This time I pay my bills",
        amount: {
          quantity: "100",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
        fee: {
          quantity: "2",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
      };
      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(mainWalletId, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo.state).toEqual(TransactionState.Succeeded);

      const reducedBalance = (await connection.getAccount({ pubkey: faucet.pubkey }))!.balance.find(
        coin => coin.tokenTicker === cash,
      )!;

      expect(reducedBalance.quantity).toEqual(
        Long.fromString(initialBalance.quantity)
          .subtract(100)
          .subtract(2)
          .toString(),
      );

      connection.disconnect();
    });

    it("reports post errors (CheckTx)", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, mainWalletId, faucet } = await userProfileWithFaucet(chainId);

      // memo too long will trigger failure in CheckTx (validation of message)
      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: faucet,
        recipient: await randomBnsAddress(),
        memo: "too long".repeat(100),
        amount: defaultAmount,
      };
      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(mainWalletId, sendTx, bnsCodec, nonce);

      await connection
        .postTx(bnsCodec.bytesToPost(signed))
        .then(() => fail("promise must be rejected"))
        .catch(err => expect(err).toMatch(/memo too long/i));

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
          creator: faucet,
          recipient: recipient,
          memo: "My first payment",
          amount: {
            quantity: "5000075000",
            fractionalDigits: 9,
            tokenTicker: cash,
          },
        };
        const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
        const signed = await profile.signTransaction(mainWalletId, sendTx, bnsCodec, nonce);
        const heightBeforeTransaction = await connection.height();
        const result = await connection.postTx(bnsCodec.bytesToPost(signed));
        expect(result.blockInfo.value).toEqual({ state: TransactionState.Pending });

        const events = new Array<BlockInfo>();
        const subscription = result.blockInfo.updates.subscribe({
          next: info => {
            events.push(info);

            if (events.length === 3) {
              expect(events[0]).toEqual({
                state: TransactionState.Pending,
              });
              expect(events[1]).toEqual({
                state: TransactionState.Succeeded,
                height: heightBeforeTransaction + 1,
                confirmations: 1,
                result: undefined,
              });
              expect(events[2]).toEqual({
                state: TransactionState.Succeeded,
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
        creator: identity,
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
      const signed = await profile.signTransaction(wallet.id, registration, bnsCodec, nonce);
      const txBytes = bnsCodec.bytesToPost(signed);
      const response = await connection.postTx(txBytes);
      const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find registration transaction
      const searchResult = (await connection.searchTx({ signedBy: identityAddress })).filter(
        isConfirmedTransaction,
      );
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
        creator: identity,
        addresses: [
          // TODO: Re-enable when there are pre-registered blockchains for testing
          // (https://github.com/iov-one/weave/issues/184)
          //
          // { chainId: ..., address: ... },
        ],
        username: username,
      };
      const nonce = await connection.getNonce({ pubkey: identity.pubkey });
      const signed = await profile.signTransaction(wallet.id, registration, bnsCodec, nonce);
      const txBytes = bnsCodec.bytesToPost(signed);
      const response = await connection.postTx(txBytes);
      const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find registration transaction
      const searchResult = (await connection.searchTx({ signedBy: address })).filter(isConfirmedTransaction);
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
        creator: identity,
        username: username,
        addresses: [],
      };
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              wallet.id,
              usernameRegistration,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      // Register a blockchain
      const chainId = `wonderland_${Math.random()}` as ChainId;
      const blockchainRegistration: RegisterBlockchainTx = {
        kind: "bns/register_blockchain",
        creator: identity,
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
              blockchainRegistration,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      // Add address
      const address = `testaddress_${Math.random()}` as Address;
      const addAddress: AddAddressToUsernameTx = {
        kind: "bns/add_address_to_username",
        creator: identity,
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
              addAddress,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      // Adding second address for the same chain fails
      const address2 = `testaddress2_${Math.random()}` as Address;
      const addAddress2: AddAddressToUsernameTx = {
        kind: "bns/add_address_to_username",
        creator: identity,
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
              addAddress2,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );

        const blockInfo = await response.blockInfo.waitFor(info => info.state === TransactionState.Failed);
        if (blockInfo.state !== TransactionState.Failed) {
          throw new Error("Transaction is expected to fail");
        }
        // https://github.com/iov-one/weave/blob/v0.10.2/x/nft/errors.go#L14
        expect(blockInfo.code).toEqual(502);
        expect(blockInfo.message || "").toMatch(/duplicate entry/i);
      }

      // Remove address
      const removeAddress: RemoveAddressFromUsernameTx = {
        kind: "bns/remove_address_from_username",
        creator: identity,
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
              removeAddress,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      // Do the same removal again
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              wallet.id,
              removeAddress,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );

        const blockInfo = await response.blockInfo.waitFor(info => info.state === TransactionState.Failed);
        if (blockInfo.state !== TransactionState.Failed) {
          throw new Error("Transaction is expected to fail");
        }
        // TODO: why is the removal of an non-existing address an invalid entry and not a missing entry?
        // https://github.com/iov-one/weave/blob/v0.10.2/x/nft/errors.go#L16
        expect(blockInfo.code).toEqual(504);
        expect(blockInfo.message || "").toMatch(/invalid entry/i);
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
        creator: faucet,
        recipient: rcptAddress,
        memo: memo,
        amount: defaultAmount,
      };

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(mainWalletId, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // finds transaction using tag
      const results = (await connection.searchTx({ sentFromOrTo: rcptAddress })).filter(
        isConfirmedTransaction,
      );
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
        creator: faucet,
        recipient: rcptAddress,
        memo: memo,
        amount: defaultAmount,
      };

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(mainWalletId, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo.state).toBe(TransactionState.Succeeded);
      const txHeight = (blockInfo as BlockInfoSucceeded | BlockInfoFailed).height;

      await tendermintSearchIndexUpdated();

      // finds transaction using height
      const results = (await connection.searchTx({ height: txHeight })).filter(isConfirmedTransaction);
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
        creator: faucet,
        recipient: await randomBnsAddress(),
        memo: memo,
        amount: defaultAmount,
      };

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(mainWalletId, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      const transactionIdToSearch = response.transactionId;

      await tendermintSearchIndexUpdated();

      // finds transaction using id
      const searchResults = (await connection.searchTx({ id: transactionIdToSearch })).filter(
        isConfirmedTransaction,
      );
      expect(searchResults.length).toEqual(1);
      expect(searchResults[0].transactionId).toEqual(transactionIdToSearch);
      const searchResultTransaction = searchResults[0].transaction;
      if (!isSendTransaction(searchResultTransaction)) {
        throw new Error("Expected send transaction");
      }
      expect(searchResultTransaction.memo).toEqual(memo);

      connection.disconnect();
    });

    // Fixed since tendermint v0.26.4
    // see issue https://github.com/tendermint/tendermint/issues/2759
    it("can search for transactions by minHeight/maxHeight", async () => {
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
        creator: faucet,
        recipient: rcptAddress,
        memo: memo,
        amount: defaultAmount,
      };

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(mainWalletId, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      await response.blockInfo.waitFor(info => !isBlockInfoPending(info));

      await tendermintSearchIndexUpdated();

      {
        // finds transaction using sentFromOrTo and minHeight = 1
        const results = (await connection.searchTx({ sentFromOrTo: rcptAddress, minHeight: 1 })).filter(
          isConfirmedTransaction,
        );
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResultTransaction = results[results.length - 1].transaction;
        if (!isSendTransaction(mostRecentResultTransaction)) {
          throw new Error("Expected send transaction");
        }
        expect(mostRecentResultTransaction.memo).toEqual(memo);
      }

      {
        // finds transaction using sentFromOrTo and minHeight = initialHeight
        const results = (await connection.searchTx({
          sentFromOrTo: rcptAddress,
          minHeight: initialHeight,
        })).filter(isConfirmedTransaction);
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResultTransaction = results[results.length - 1].transaction;
        if (!isSendTransaction(mostRecentResultTransaction)) {
          throw new Error("Expected send transaction");
        }
        expect(mostRecentResultTransaction.memo).toEqual(memo);
      }

      {
        // finds transaction using sentFromOrTo and maxHeight = 500 million
        const results = (await connection.searchTx({
          sentFromOrTo: rcptAddress,
          maxHeight: 500_000_000,
        })).filter(isConfirmedTransaction);
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResultTransaction = results[results.length - 1].transaction;
        if (!isSendTransaction(mostRecentResultTransaction)) {
          throw new Error("Expected send transaction");
        }
        expect(mostRecentResultTransaction.memo).toEqual(memo);
      }

      {
        // finds transaction using sentFromOrTo and maxHeight = initialHeight + 10
        const results = (await connection.searchTx({
          sentFromOrTo: rcptAddress,
          maxHeight: initialHeight + 10,
        })).filter(isConfirmedTransaction);
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResultTransaction = results[results.length - 1].transaction;
        if (!isSendTransaction(mostRecentResultTransaction)) {
          throw new Error("Expected send transaction");
        }
        expect(mostRecentResultTransaction.memo).toEqual(memo);
      }

      connection.disconnect();
    });

    it("reports DeliverTx errors for search by ID", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();
      const initialHeight = await connection.height();

      const { profile, mainWalletId } = await userProfileWithFaucet(chainId);
      // this will never have tokens, but can try to sign
      const brokeIdentity = await profile.createIdentity(mainWalletId, chainId, HdPaths.simpleAddress(1234));

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: brokeIdentity,
        recipient: await randomBnsAddress(),
        memo: "Sending from empty",
        amount: defaultAmount,
      };

      const nonce = await connection.getNonce({ pubkey: brokeIdentity.pubkey });
      const signed = await profile.signTransaction(mainWalletId, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const transactionIdToSearch = response.transactionId;
      await response.blockInfo.waitFor(info => !isBlockInfoPending(info));

      await tendermintSearchIndexUpdated();

      const results = await connection.searchTx({ id: transactionIdToSearch });

      expect(results.length).toEqual(1);
      const result = results[0];
      if (!isFailedTransaction(result)) {
        throw new Error("Expected failed transaction");
      }
      expect(result.height).toBeGreaterThan(initialHeight);
      // https://github.com/iov-one/weave/blob/v0.10.0/x/cash/errors.go#L18
      expect(result.code).toEqual(36);
      expect(result.message).toMatch(/account empty/i);

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
          creator: faucet,
          recipient: await randomBnsAddress(),
          memo: memo,
          amount: defaultAmount,
        };

        const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
        const signed = await profile.signTransaction(mainWalletId, sendTx, bnsCodec, nonce);
        const transactionId = bnsCodec.identifier(signed);
        const heightBeforeTransaction = await connection.height();

        // start listening
        const subscription = connection.listenTx({ id: transactionId }).subscribe({
          next: event => {
            if (!isConfirmedTransaction(event)) {
              done.fail("Confirmed transaction expected");
              return;
            }

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

  describe("liveTx", () => {
    it("finds an existing transaction", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, mainWalletId, faucet } = await userProfileWithFaucet(chainId);

      const memo = `Payment ${Math.random()}`;
      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: faucet,
        recipient: await randomBnsAddress(),
        memo: memo,
        amount: defaultAmount,
      };

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(mainWalletId, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const transactionIdToSearch = response.transactionId;
      await response.blockInfo.waitFor(info => !isBlockInfoPending(info));

      await tendermintSearchIndexUpdated();

      // finds transaction using id
      const result = await firstEvent(connection.liveTx({ id: transactionIdToSearch }));

      if (!isConfirmedTransaction(result)) {
        throw new Error("Expected confirmed transaction");
      }
      const searchResultTransaction = result.transaction;
      expect(result.transactionId).toEqual(transactionIdToSearch);
      if (!isSendTransaction(searchResultTransaction)) {
        throw new Error("Expected send transaction");
      }
      expect(searchResultTransaction.memo).toEqual(memo);

      connection.disconnect();
    });

    it("can wait for a future transaction", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, mainWalletId, faucet } = await userProfileWithFaucet(chainId);

      const memo = `Payment ${Math.random()}`;
      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: faucet,
        recipient: await randomBnsAddress(),
        memo: memo,
        amount: defaultAmount,
      };

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(mainWalletId, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const transactionIdToSearch = response.transactionId;

      const result = await firstEvent(connection.liveTx({ id: transactionIdToSearch }));

      if (!isConfirmedTransaction(result)) {
        throw new Error("Expected confirmed transaction");
      }
      const searchResultTransaction = result.transaction;
      expect(result.transactionId).toEqual(transactionIdToSearch);
      if (!isSendTransaction(searchResultTransaction)) {
        throw new Error("Expected send transaction");
      }
      expect(searchResultTransaction.memo).toEqual(memo);

      connection.disconnect();
    });

    it("reports DeliverTx error for an existing transaction", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();
      const initialHeight = await connection.height();

      const { profile, mainWalletId } = await userProfileWithFaucet(chainId);
      // this will never have tokens, but can try to sign
      const brokeIdentity = await profile.createIdentity(mainWalletId, chainId, HdPaths.simpleAddress(1234));

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: brokeIdentity,
        recipient: await randomBnsAddress(),
        memo: "Sending from empty",
        amount: defaultAmount,
      };

      const nonce = await connection.getNonce({ pubkey: brokeIdentity.pubkey });
      const signed = await profile.signTransaction(mainWalletId, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const transactionIdToSearch = response.transactionId;
      await response.blockInfo.waitFor(info => !isBlockInfoPending(info));

      await tendermintSearchIndexUpdated();

      const result = await firstEvent(connection.liveTx({ id: transactionIdToSearch }));

      if (!isFailedTransaction(result)) {
        throw new Error("Expected failed transaction");
      }
      expect(result.height).toBeGreaterThan(initialHeight);
      // https://github.com/iov-one/weave/blob/v0.10.0/x/cash/errors.go#L18
      expect(result.code).toEqual(36);
      expect(result.message).toMatch(/account empty/i);

      connection.disconnect();
    });

    it("reports DeliverTx error for a future transaction", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, mainWalletId } = await userProfileWithFaucet(chainId);
      // this will never have tokens, but can try to sign
      const brokeIdentity = await profile.createIdentity(mainWalletId, chainId, HdPaths.simpleAddress(1234));

      // Sending tokens from an empty account will trigger a failure in DeliverTx
      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: brokeIdentity,
        recipient: await randomBnsAddress(),
        memo: "Sending from empty",
        amount: defaultAmount,
      };

      const nonce = await connection.getNonce({ pubkey: brokeIdentity.pubkey });
      const signed = await profile.signTransaction(mainWalletId, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const transactionIdToSearch = response.transactionId;

      const result = await firstEvent(connection.liveTx({ id: transactionIdToSearch }));

      if (!isFailedTransaction(result)) {
        throw new Error("Expected failed transaction");
      }
      // https://github.com/iov-one/weave/blob/v0.10.0/x/cash/errors.go#L18
      expect(result.code).toEqual(36);
      expect(result.message).toMatch(/account empty/i);

      connection.disconnect();
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
        creator: identity,
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
              blockchainRegistration,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      }

      // Query by existing chain ID
      {
        const results = await connection.getBlockchains({ chainId: chainId });
        expect(results.length).toEqual(1);
        expect(results[0].id).toEqual(chainId);
        expect(results[0].owner).toEqual(identityAddress);
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
        creator: identity,
        addresses: [],
        username: username,
      };
      const nonce = await connection.getNonce({ pubkey: identity.pubkey });
      const signed = await profile.signTransaction(wallet.id, registration, bnsCodec, nonce);
      {
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      }

      // Query by existing name
      {
        const results = await connection.getUsernames({ username: username });
        expect(results.length).toEqual(1);
        expect(results[0]).toEqual({
          id: username,
          owner: identityAddress,
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
        creator: identity,
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
              blockchainRegistration,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      }

      // Register username
      const username = `testuser_${Math.random()}`;
      const usernameRegistration: RegisterUsernameTx = {
        kind: "bns/register_username",
        creator: identity,
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
              usernameRegistration,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
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
          owner: identityAddress,
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

  const sendCash = async (
    connection: BnsConnection,
    profile: UserProfile,
    faucet: PublicIdentity,
    rcptAddr: Address,
  ): Promise<PostTxResponse> => {
    // construct a sendtx, this is normally used in the MultiChainSigner api
    const sendTx: SendTransaction = {
      kind: "bcp/send",
      creator: faucet,
      recipient: rcptAddr,
      amount: {
        quantity: "68000000000",
        fractionalDigits: 9,
        tokenTicker: cash,
      },
    };
    const firstWalletId = profile.wallets.value[0].id;
    const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
    const signed = await profile.signTransaction(firstWalletId, sendTx, bnsCodec, nonce);
    const txBytes = bnsCodec.bytesToPost(signed);
    return connection.postTx(txBytes);
  };

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
    const faucetAcct = lastValue<Account | undefined>(faucetAccountStream);
    const rcptAcct = lastValue<Account | undefined>(recipientAccountStream);

    // give it a chance to get initial feed before checking and proceeding
    await sleep(200);

    // make sure there are original values sent on the wire
    expect(rcptAcct.value()).toBeUndefined();
    expect(faucetAcct.value()).toBeDefined();
    expect(faucetAcct.value()!.balance.length).toEqual(1);
    const faucetStartBalance = faucetAcct.value()!.balance[0];

    // send some cash
    const post = await sendCash(connection, profile, faucet, recipientAddr);
    await post.blockInfo.waitFor(info => !isBlockInfoPending(info));

    // give it a chance to get updates before checking and proceeding
    await sleep(100);

    // rcptAcct should now have a value
    expect(rcptAcct.value()).toBeDefined();
    expect(rcptAcct.value()!.balance.length).toEqual(1);
    expect(rcptAcct.value()!.balance[0].quantity).toEqual("68000000000");

    // facuetAcct should have gone down a bit
    expect(faucetAcct.value()).toBeDefined();
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

    const initSwaps = await connection.getSwaps({ recipient: recipientAddr });
    expect(initSwaps.length).toEqual(0);

    const swapOfferPreimage = Encoding.toAscii(`my top secret phrase... ${Math.random()}`);
    const swapOfferHash = new Sha256(swapOfferPreimage).digest();
    const swapOfferTimeout = (await connection.height()) + 1000;
    const swapOfferTx: SwapOfferTransaction = {
      kind: "bcp/swap_offer",
      creator: faucet,
      recipient: recipientAddr,
      amounts: [
        {
          quantity: "123000456000",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
      ],
      timeout: swapOfferTimeout,
      hash: swapOfferHash,
    };

    const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
    const signed = await profile.signTransaction(mainWalletId, swapOfferTx, bnsCodec, nonce);
    const post = await connection.postTx(bnsCodec.bytesToPost(signed));
    const transactionId = post.transactionId;
    expect(transactionId).toMatch(/^[0-9A-F]{64}$/);

    const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo)) {
      throw new Error(`Expected transaction state success but got state: ${blockInfo.state}`);
    }
    const txHeight = blockInfo.height;
    const txResult = blockInfo.result!;
    // the transaction result is 8 byte number assigned by the application
    expect(Uint64.fromBytesBigEndian(txResult).toNumber()).toBeGreaterThanOrEqual(1);
    expect(Uint64.fromBytesBigEndian(txResult).toNumber()).toBeLessThanOrEqual(1000);

    await tendermintSearchIndexUpdated();

    // now query by the txid
    const search = (await connection.searchTx({ id: transactionId })).filter(isConfirmedTransaction);
    expect(search.length).toEqual(1);
    // make sure we get he same tx loaded
    const loaded = search[0];
    expect(loaded.transactionId).toEqual(transactionId);
    // make sure it also stored a result
    expect(loaded.result).toEqual(txResult);
    expect(loaded.height).toEqual(txHeight);
    const loadedTransaction = loaded.transaction;
    if (!isSwapOfferTransaction(loadedTransaction)) {
      throw new Error("Wrong transaction type");
    }
    expect(loadedTransaction.recipient).toEqual(swapOfferTx.recipient);

    // ----  prepare queries
    const querySwapId: AtomicSwapQuery = { swapid: txResult as SwapIdBytes };
    const querySwapSender: AtomicSwapQuery = { sender: faucetAddr };
    const querySwapRecipient: AtomicSwapQuery = { recipient: recipientAddr };
    const querySwapHash: AtomicSwapQuery = { hashlock: swapOfferHash };

    // ----- connection.searchTx() -----
    // we should be able to find the transaction through quite a number of tag queries

    const txById = (await connection.searchTx({ tags: [bnsSwapQueryTag(querySwapId)] })).filter(
      isConfirmedTransaction,
    );
    expect(txById.length).toEqual(1);
    expect(txById[0].transactionId).toEqual(transactionId);

    const txBySender = (await connection.searchTx({ tags: [bnsSwapQueryTag(querySwapSender)] })).filter(
      isConfirmedTransaction,
    );
    expect(txBySender.length).toBeGreaterThanOrEqual(1);
    expect(txBySender[txBySender.length - 1].transactionId).toEqual(transactionId);

    const txByRecipient = (await connection.searchTx({
      tags: [bnsSwapQueryTag(querySwapRecipient)],
    })).filter(isConfirmedTransaction);
    expect(txByRecipient.length).toEqual(1);
    expect(txByRecipient[0].transactionId).toEqual(transactionId);

    const txByHash = (await connection.searchTx({ tags: [bnsSwapQueryTag(querySwapHash)] })).filter(
      isConfirmedTransaction,
    );
    expect(txByHash.length).toEqual(1);
    expect(txByHash[0].transactionId).toEqual(transactionId);

    // ----- connection.getSwap() -------

    // we can also swap by id (returned by the transaction result)
    const idSwaps = await connection.getSwaps(querySwapId);
    expect(idSwaps.length).toEqual(1);

    const swap = idSwaps[0];
    expect(swap.kind).toEqual(SwapState.Open);

    // and it matches expectations
    const swapData = swap.data;
    expect(swapData.id).toEqual(txResult);
    expect(swapData.sender).toEqual(faucetAddr);
    expect(swapData.recipient).toEqual(recipientAddr);
    expect(swapData.timeout).toEqual(swapOfferTimeout);
    expect(swapData.amounts.length).toEqual(1);
    expect(swapData.amounts[0].quantity).toEqual("123000456000");
    expect(swapData.amounts[0].tokenTicker).toEqual(cash);
    expect(swapData.hash).toEqual(swapOfferHash);

    // we can get the swap by the recipient
    const rcptSwaps = await connection.getSwaps(querySwapRecipient);
    expect(rcptSwaps.length).toEqual(1);
    expect(rcptSwaps[0]).toEqual(swap);

    // we can also get it by the sender
    const sendOpenSwapData = (await connection.getSwaps(querySwapSender)).filter(
      s => s.kind === SwapState.Open,
    );
    expect(sendOpenSwapData.length).toBeGreaterThanOrEqual(1);
    expect(sendOpenSwapData[sendOpenSwapData.length - 1]).toEqual(swap);

    // we can also get it by the hash
    const hashSwap = await connection.getSwaps(querySwapHash);
    expect(hashSwap.length).toEqual(1);
    expect(hashSwap[0]).toEqual(swap);

    connection.disconnect();
  });

  const openSwap = async (
    connection: BnsConnection,
    profile: UserProfile,
    creator: PublicIdentity,
    rcptAddr: Address,
    hash: Uint8Array,
  ): Promise<PostTxResponse> => {
    // construct a swapOfferTx, sign and post to the chain
    const swapOfferTimeout = (await connection.height()) + 1000;
    const swapOfferTx: SwapOfferTransaction = {
      kind: "bcp/swap_offer",
      creator: creator,
      recipient: rcptAddr,
      amounts: [
        {
          quantity: "21000000000",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
      ],
      timeout: swapOfferTimeout,
      hash: hash,
    };
    const firstWalletId = profile.wallets.value[0].id;
    const nonce = await connection.getNonce({ pubkey: creator.pubkey });
    const signed = await profile.signTransaction(firstWalletId, swapOfferTx, bnsCodec, nonce);
    const txBytes = bnsCodec.bytesToPost(signed);
    return connection.postTx(txBytes);
  };

  const claimSwap = async (
    connection: BnsConnection,
    profile: UserProfile,
    creator: PublicIdentity,
    swapId: SwapIdBytes,
    preimage: Preimage,
  ): Promise<PostTxResponse> => {
    // construct a swapOfferTx, sign and post to the chain
    const swapClaimTx: SwapClaimTransaction = {
      kind: "bcp/swap_claim",
      creator: creator,
      swapId,
      preimage,
    };
    const firstWalletId = profile.wallets.value[0].id;
    const nonce = await connection.getNonce({ pubkey: creator.pubkey });
    const signed = await profile.signTransaction(firstWalletId, swapClaimTx, bnsCodec, nonce);
    const txBytes = bnsCodec.bytesToPost(signed);
    return connection.postTx(txBytes);
  };

  it("can start and watch an atomic swap lifecycle", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    const { profile, faucet } = await userProfileWithFaucet(connection.chainId());
    const recipientAddr = await randomBnsAddress();

    // create the preimages for the three swaps
    const preimage1 = Encoding.toAscii("the first swap is easy") as Preimage;
    const hash1 = AtomicSwapHelpers.hashPreimage(preimage1);
    const preimage2 = Encoding.toAscii("ze 2nd iS l337 !@!") as Preimage;
    const hash2 = AtomicSwapHelpers.hashPreimage(preimage2);
    const preimage3 = Encoding.toAscii("and this one is a gift.") as Preimage;
    const hash3 = AtomicSwapHelpers.hashPreimage(preimage3);

    // nothing to start with
    const rcptQuery = { recipient: recipientAddr };
    const initSwaps = await connection.getSwaps(rcptQuery);
    expect(initSwaps.length).toEqual(0);

    // make two offers
    const post1 = await openSwap(connection, profile, faucet, recipientAddr, hash1);
    const blockInfo1 = await post1.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo1)) {
      throw new Error(`Expected transaction state success but got state: ${blockInfo1.state}`);
    }
    const id1 = blockInfo1.result! as SwapIdBytes;
    expect(id1.length).toEqual(8);

    const post2 = await openSwap(connection, profile, faucet, recipientAddr, hash2);
    const blockInfo2 = await post2.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo2)) {
      throw new Error(`Expected transaction state success but got state: ${blockInfo2.state}`);
    }
    const id2 = blockInfo2.result! as SwapIdBytes;
    expect(id2.length).toEqual(8);

    // find two open
    const midSwaps = await connection.getSwaps(rcptQuery);
    expect(midSwaps.length).toEqual(2);
    const [open1, open2] = midSwaps;
    expect(open1.kind).toEqual(SwapState.Open);
    expect(open1.data.id).toEqual(id1);
    expect(open2.kind).toEqual(SwapState.Open);
    expect(open2.data.id).toEqual(id2);

    // then claim, offer, claim - 2 closed, 1 open
    {
      const post = await claimSwap(connection, profile, faucet, id2, preimage2);
      await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
    }

    // start to watch
    const liveView = asArray(connection.watchSwaps(rcptQuery));

    const post3 = await openSwap(connection, profile, faucet, recipientAddr, hash3);
    const blockInfo3 = await post3.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo3)) {
      throw new Error(`Expected transaction state success but got state: ${blockInfo3.state}`);
    }
    const id3 = blockInfo3.result! as SwapIdBytes;
    expect(id3.length).toEqual(8);

    {
      const post = await claimSwap(connection, profile, faucet, id1, preimage1);
      await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
    }

    // make sure we find two claims, one open
    const finalSwaps = await connection.getSwaps({ recipient: recipientAddr });
    expect(finalSwaps.length).toEqual(3);
    const [open3, claim2, claim1] = finalSwaps;
    expect(open3.kind).toEqual(SwapState.Open);
    expect(open3.data.id).toEqual(id3);
    expect(claim2.kind).toEqual(SwapState.Claimed);
    expect(claim2.data.id).toEqual(id2);
    expect(claim1.kind).toEqual(SwapState.Claimed);
    expect(claim1.data.id).toEqual(id1);

    // We have no guarantees which events are fired exactly,
    // as it is a race condition if we get Open, Claimed or Claimed
    // directly. So let's just check the last information per ID.
    const latestEventPerId = new Map<string, AtomicSwap>();
    for (const event of liveView.value()) {
      latestEventPerId.set(toHex(event.data.id), event);
    }

    expect(latestEventPerId.size).toEqual(3);
    expect(latestEventPerId.get(toHex(id1))).toEqual({
      kind: SwapState.Claimed,
      data: open1.data,
      preimage: preimage1,
    });
    expect(latestEventPerId.get(toHex(id2))).toEqual({
      kind: SwapState.Claimed,
      data: open2.data,
      preimage: preimage2,
    });
    expect(latestEventPerId.get(toHex(id3))).toEqual({
      kind: SwapState.Open,
      data: open3.data,
    });

    connection.disconnect();
  });
});
