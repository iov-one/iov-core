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
  createTimestampTimeout,
  Hash,
  Identity,
  isBlockInfoPending,
  isBlockInfoSucceeded,
  isConfirmedTransaction,
  isFailedTransaction,
  isSendTransaction,
  isSwapOfferTransaction,
  Nonce,
  PostTxResponse,
  Preimage,
  PubkeyBundle,
  PubkeyBytes,
  SendTransaction,
  SwapClaimTransaction,
  SwapData,
  SwapId,
  SwapIdBytes,
  swapIdEquals,
  SwapOfferTransaction,
  SwapProcessState,
  SwapTimeout,
  TokenTicker,
  TransactionId,
  TransactionState,
  UnsignedTransaction,
  WithCreator,
} from "@iov/bcp";
import { Ed25519, Random, Sha512 } from "@iov/crypto";
import { Encoding, Uint64 } from "@iov/encoding";
import { Ed25519HdWallet, HdPaths, UserProfile, WalletId } from "@iov/keycontrol";
import { asArray, firstEvent, lastValue, toListPromise } from "@iov/stream";
import BN from "bn.js";
import Long from "long";

import { bnsCodec } from "./bnscodec";
import { BnsConnection } from "./bnsconnection";
import { decodeNumericId } from "./decode";
import { bnsSwapQueryTag } from "./tags";
import {
  ActionKind,
  CreateEscrowTx,
  CreateMultisignatureTx,
  CreateProposalTx,
  CreateTextResolutionAction,
  isCreateEscrowTx,
  isCreateMultisignatureTx,
  isRegisterUsernameTx,
  isReleaseEscrowTx,
  isReturnEscrowTx,
  isUpdateEscrowPartiesTx,
  isUpdateMultisignatureTx,
  Participant,
  ProposalExecutorResult,
  ProposalResult,
  ProposalStatus,
  RegisterUsernameTx,
  ReleaseEscrowTx,
  ReturnEscrowTx,
  TransferUsernameTx,
  UpdateEscrowPartiesTx,
  UpdateMultisignatureTx,
  UpdateTargetsOfUsernameTx,
  VoteOption,
  VoteTx,
} from "./types";
import { encodeBnsAddress, identityToAddress } from "./util";

const { fromHex, toHex } = Encoding;

function pendingWithoutBnsd(): void {
  if (!process.env.BNSD_ENABLED) {
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

function getRandomInteger(min: number, max: number): number {
  if (!Number.isInteger(min)) throw new Error("Argument min is not an integer");
  if (!Number.isInteger(max)) throw new Error("Argument max is not an integer");
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function randomBnsAddress(): Promise<Address> {
  return encodeBnsAddress("tiov", Random.getBytes(20));
}

function matchId(id: SwapId): (swap: AtomicSwap) => boolean {
  return s => swapIdEquals(id, s.data.id);
}

function serializeBnsSwapId(id: SwapId): string {
  return toHex(id.data);
}

const bash = "BASH" as TokenTicker;
const cash = "CASH" as TokenTicker;
const blockTime = 1000;

describe("BnsConnection", () => {
  const defaultAmount: Amount = {
    quantity: "1000000001",
    fractionalDigits: 9,
    tokenTicker: cash,
  };

  // this is enough money in an account that registers names... twice the cost of one name registration product fee
  const registerAmount: Amount = {
    quantity: "10000000000",
    fractionalDigits: 9,
    tokenTicker: cash,
  };

  // Generated using https://github.com/nym-zone/bech32
  // bech32 -e -h tiov 010101020202030303040404050505050A0A0A0A
  const unusedAddress = "tiov1qyqszqszqgpsxqcyqszq2pg9q59q5zs2fx9n6s" as Address;

  const unusedPubkey: PubkeyBundle = {
    algo: Algorithm.Ed25519,
    data: fromHex("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb") as PubkeyBytes,
  };

  // Dev faucet
  // path: m/1229936198'/1'/0'/0'
  // pubkey: e05f47e7639b47625c23738e2e46d092819abd6039c5fc550d9aa37f1a2556a1
  // IOV address: tiov1q5lyl7asgr2dcweqrhlfyexqpkgcuzrm4e0cku
  // This account has money in the genesis file (see scripts/bnsd/README.md).
  const faucetMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
  const faucetPath = HdPaths.iovFaucet();
  // Dev admin
  // path: m/44'/234'/0'
  // pubkey: 418f88ff4876d33a3d6e2a17d0fe0e78dc3cb5e4b42c6c156ed1b8bfce5d46d1
  // IOV address: tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea
  // Same mnemonic as faucet.
  // This account has money in the genesis file (see scripts/bnsd/README.md).
  const adminPath = HdPaths.iov(0);

  const bnsdTendermintUrl = "ws://localhost:23456";
  const bnsdTendermintHttpUrl = "http://localhost:23456";

  async function userProfileWithFaucet(
    chainId: ChainId,
  ): Promise<{
    readonly profile: UserProfile;
    readonly walletId: WalletId;
    readonly faucet: Identity;
    readonly admin: Identity;
  }> {
    const profile = new UserProfile();
    const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(faucetMnemonic));
    const faucet = await profile.createIdentity(wallet.id, chainId, faucetPath);
    const admin = await profile.createIdentity(wallet.id, chainId, adminPath);
    return { profile: profile, walletId: wallet.id, faucet: faucet, admin: admin };
  }

  async function ensureNonceNonZero(
    connection: BnsConnection,
    profile: UserProfile,
    identity: Identity,
  ): Promise<void> {
    const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
      kind: "bcp/send",
      creator: identity,
      sender: bnsCodec.identityToAddress(identity),
      recipient: await randomBnsAddress(),
      amount: defaultAmount,
    });
    const nonce = await connection.getNonce({ pubkey: identity.pubkey });
    const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
    const response = await connection.postTx(bnsCodec.bytesToPost(signed));
    await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
  }

  async function sendTokensFromFaucet(
    connection: BnsConnection,
    recipient: Address,
    amount: Amount = defaultAmount,
  ): Promise<void> {
    const { profile, faucet } = await userProfileWithFaucet(connection.chainId());

    const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
      kind: "bcp/send",
      creator: faucet,
      sender: bnsCodec.identityToAddress(faucet),
      recipient: recipient,
      amount: amount,
    });
    const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
    const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
    const response = await connection.postTx(bnsCodec.bytesToPost(signed));
    await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
  }

  it("can connect to tendermint via WS", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);

    const chainId = await connection.chainId();
    expect(chainId).toMatch(/^[a-zA-Z0-9-]{7,25}$/);

    const height = await connection.height();
    expect(height).toBeGreaterThan(1);

    connection.disconnect();
  });

  it("can connect to tendermint via HTTP", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintHttpUrl);

    const chainId = await connection.chainId();
    expect(chainId).toMatch(/^[a-zA-Z0-9-]{7,25}$/);

    const height = await connection.height();
    expect(height).toBeGreaterThan(1);

    connection.disconnect();
  });

  describe("getToken", () => {
    it("can get existing token", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);

      const token = await connection.getToken("MASH" as TokenTicker);
      expect(token).toEqual({
        tokenTicker: "MASH" as TokenTicker,
        tokenName: "The mashed coin",
        fractionalDigits: 9,
      });

      connection.disconnect();
    });

    it("produces empty result for non-existing token", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);

      const token = await connection.getToken("ETH" as TokenTicker);
      expect(token).toBeUndefined();

      connection.disconnect();
    });
  });

  describe("getAllTokens", () => {
    it("can query all tokens", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);

      const tokens = await connection.getAllTokens();
      expect(tokens).toEqual([
        {
          tokenTicker: "BASH" as TokenTicker,
          tokenName: "Another token of this chain",
          fractionalDigits: 9,
        },
        {
          tokenTicker: "CASH" as TokenTicker,
          tokenName: "Main token of this chain",
          fractionalDigits: 9,
        },
        {
          tokenTicker: "MASH" as TokenTicker,
          tokenName: "The mashed coin",
          fractionalDigits: 9,
        },
      ]);

      connection.disconnect();
    });
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
        expect(account.balance.length).toEqual(2);
        const bashAccount = account.balance.find(({ tokenTicker }) => tokenTicker === bash);
        expect(bashAccount).toBeDefined();
        expect(Number.parseInt(bashAccount!.quantity, 10)).toBeGreaterThan(990000_000000000);
        const cashAccount = account.balance.find(({ tokenTicker }) => tokenTicker === cash);
        expect(cashAccount).toBeDefined();
        expect(Number.parseInt(cashAccount!.quantity, 10)).toBeGreaterThan(990000_000000000);
      }

      // can get the faucet by publicKey, same result
      const responseFromPubkey = await connection.getAccount({ pubkey: faucet.pubkey });
      expect(responseFromPubkey).toBeDefined();
      {
        const account = responseFromPubkey!;
        expect(account.address).toEqual(faucetAddress);
        expect(account.pubkey).toEqual(faucet.pubkey);
        expect(account.balance.length).toEqual(2);
        const bashAccount = account.balance.find(({ tokenTicker }) => tokenTicker === bash);
        expect(bashAccount).toBeDefined();
        expect(Number.parseInt(bashAccount!.quantity, 10)).toBeGreaterThan(990000_000000000);
        const cashAccount = account.balance.find(({ tokenTicker }) => tokenTicker === cash);
        expect(cashAccount).toBeDefined();
        expect(Number.parseInt(cashAccount!.quantity, 10)).toBeGreaterThan(990000_000000000);
      }

      connection.disconnect();
    });

    it("returns empty pubkey and name when getting an account with no outgoing transactions", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const newAddress = await randomBnsAddress();
      await sendTokensFromFaucet(connection, newAddress);

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

      // by address
      const response1 = await connection.getAccount({ address: unusedAddress });
      expect(response1).toBeUndefined();

      // by pubkey
      const response2 = await connection.getAccount({ pubkey: unusedPubkey });
      expect(response2).toBeUndefined();

      connection.disconnect();
    });
  });

  describe("getNonce", () => {
    it("can query empty nonce from unused account by address and pubkey", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);

      // by address
      const nonce1 = await connection.getNonce({ address: unusedAddress });
      expect(nonce1).toEqual(0 as Nonce);

      // by pubkey
      const nonce2 = await connection.getNonce({ pubkey: unusedPubkey });
      expect(nonce2).toEqual(0 as Nonce);

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
      expect(nonce1).toBeGreaterThan(0);

      // by pubkey
      const nonce2 = await connection.getNonce({ pubkey: faucet.pubkey });
      expect(nonce2).toBeGreaterThan(0);

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
        expect(nonces[1]).toEqual((nonces[0] + 1) as Nonce);
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
        expect(nonces[1]).toEqual((nonces[0] + 1) as Nonce);
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
      expect(headers[0].id).not.toEqual(headerFromGet.id);
      expect(headers[0].height).toEqual(headerFromGet.height - 1);
      expect(headers[0].transactionCount).toBeGreaterThanOrEqual(0);
      expect(headers[0].time.getTime()).toBeGreaterThan(headerFromGet.time.getTime() - blockTime - 200);
      expect(headers[0].time.getTime()).toBeLessThan(headerFromGet.time.getTime() - blockTime + 200);

      // second header
      expect(headers[1].id).toEqual(headerFromGet.id);
      expect(headers[1].height).toEqual(headerFromGet.height);
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

      const { profile, faucet } = await userProfileWithFaucet(chainId);
      const faucetAddr = identityToAddress(faucet);
      const recipient = await randomBnsAddress();

      // construct a sendtx, this is normally used in the MultiChainSigner api
      const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: faucet,
        sender: bnsCodec.identityToAddress(faucet),
        recipient: recipient,
        memo: "My first payment",
        amount: {
          quantity: "5000075000",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
      });
      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
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
      expect(fNonce).toBeGreaterThanOrEqual(1);

      await tendermintSearchIndexUpdated();

      // now verify we can query the same tx back
      const search = (await connection.searchTx({ sentFromOrTo: faucetAddr })).filter(isConfirmedTransaction);
      expect(search.length).toBeGreaterThanOrEqual(1);
      // make sure we get a valid signature
      const mine = search[search.length - 1];
      // make sure we have a txid
      expect(mine.height).toBeGreaterThan(initialHeight);
      expect(mine.transactionId).toMatch(/^[0-9A-F]{64}$/);
      const tx = mine.transaction;
      if (!isSendTransaction(tx)) {
        throw new Error("Expected send transaction");
      }
      expect(tx).toEqual(sendTx);

      connection.disconnect();
    });

    // TODO: extend this with missing and high fees
    it("rejects send transaction with manual fees too low", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, faucet } = await userProfileWithFaucet(chainId);

      const sendTx: SendTransaction & WithCreator = {
        kind: "bcp/send",
        creator: faucet,
        sender: bnsCodec.identityToAddress(faucet),
        recipient: await randomBnsAddress(),
        memo: "This time I pay my bills",
        amount: {
          quantity: "100",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
        fee: {
          tokens: {
            quantity: "2",
            fractionalDigits: 9,
            tokenTicker: cash,
          },
        },
      };
      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
      try {
        await connection.postTx(bnsCodec.bytesToPost(signed));
        fail("above line should reject with low fees");
      } catch (err) {
        expect(err).toMatch(/fee less than minimum/);
      }
      connection.disconnect();
    });

    it("reports post errors (CheckTx)", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, faucet } = await userProfileWithFaucet(chainId);

      // memo too long will trigger failure in CheckTx (validation of message)
      const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: faucet,
        sender: bnsCodec.identityToAddress(faucet),
        recipient: await randomBnsAddress(),
        amount: {
          ...defaultAmount,
          tokenTicker: "UNKNOWN" as TokenTicker,
        },
      });
      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);

      await connection
        .postTx(bnsCodec.bytesToPost(signed))
        .then(
          () => fail("promise must be rejected"),
          error => expect(error).toMatch(/field \\"Amount\\": invalid currency: UNKNOWN/i),
        );

      connection.disconnect();
    });

    it("can post transaction and watch confirmations", done => {
      pendingWithoutBnsd();

      (async () => {
        const connection = await BnsConnection.establish(bnsdTendermintUrl);
        const chainId = connection.chainId();

        const { profile, faucet } = await userProfileWithFaucet(chainId);
        const recipient = await randomBnsAddress();

        // construct a sendtx, this is normally used in the MultiChainSigner api
        const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
          kind: "bcp/send",
          creator: faucet,
          sender: bnsCodec.identityToAddress(faucet),
          recipient: recipient,
          memo: "My first payment",
          amount: {
            quantity: "5000075000",
            fractionalDigits: 9,
            tokenTicker: cash,
          },
        });
        const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
        const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
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

    it("can register a username", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(0));

      // we need funds to pay the fees
      const address = identityToAddress(identity);
      await sendTokensFromFaucet(connection, address, registerAmount);

      // Create and send registration
      const username = `testuser_${Math.random()}*iov`;
      const registration = await connection.withDefaultFee<RegisterUsernameTx & WithCreator>({
        kind: "bns/register_username",
        creator: identity,
        username: username,
        targets: [{ chainId: "foobar" as ChainId, address: address }],
      });
      const nonce = await connection.getNonce({ pubkey: identity.pubkey });
      const signed = await profile.signTransaction(registration, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
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
      expect(firstSearchResultTransaction.targets.length).toEqual(1);

      connection.disconnect();
    });

    it("can register a username with empty list of targets", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(0));

      // we need funds to pay the fees
      const address = identityToAddress(identity);
      await sendTokensFromFaucet(connection, address, registerAmount);

      // Create and send registration
      const username = `testuser_${Math.random()}*iov`;
      const registration = await connection.withDefaultFee<RegisterUsernameTx & WithCreator>({
        kind: "bns/register_username",
        creator: identity,
        username: username,
        targets: [],
      });
      const nonce = await connection.getNonce({ pubkey: identity.pubkey });
      const signed = await profile.signTransaction(registration, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
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
      expect(firstSearchResultTransaction.targets.length).toEqual(0);

      connection.disconnect();
    });

    it("can update targets of username", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(0));
      // we need funds to pay the fees
      const myAddress = identityToAddress(identity);
      await sendTokensFromFaucet(connection, myAddress, registerAmount);

      const targets1 = [{ chainId: "foobar" as ChainId, address: myAddress }] as const;
      const targets2 = [{ chainId: "barfoo" as ChainId, address: myAddress }] as const;

      // Create and send registration
      const username = `testuser_${Math.random()}*iov`;
      const usernameRegistration = await connection.withDefaultFee<RegisterUsernameTx & WithCreator>({
        kind: "bns/register_username",
        creator: identity,
        username: username,
        targets: targets1,
      });
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              usernameRegistration,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      // Update targets
      const updateTargets = await connection.withDefaultFee<UpdateTargetsOfUsernameTx & WithCreator>({
        kind: "bns/update_targets_of_username",
        creator: identity,
        username: username,
        targets: targets2,
      });
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              updateTargets,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      // Clear addresses
      const clearAddresses = await connection.withDefaultFee<UpdateTargetsOfUsernameTx & WithCreator>({
        kind: "bns/update_targets_of_username",
        creator: identity,
        username: username,
        targets: [],
      });
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              clearAddresses,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      connection.disconnect();
    });

    it("can transfer a username", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(0));
      // we need funds to pay the fees
      const myAddress = identityToAddress(identity);
      await sendTokensFromFaucet(connection, myAddress, registerAmount);

      const targets1 = [{ chainId: "foobar" as ChainId, address: myAddress }] as const;

      // Create and send registration
      const username = `testuser_${Math.random()}*iov`;
      const usernameRegistration = await connection.withDefaultFee<RegisterUsernameTx & WithCreator>({
        kind: "bns/register_username",
        creator: identity,
        username: username,
        targets: targets1,
      });
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              usernameRegistration,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      const transferUsername = await connection.withDefaultFee<TransferUsernameTx & WithCreator>({
        kind: "bns/transfer_username",
        creator: identity,
        username: username,
        newOwner: unusedAddress,
      });
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              transferUsername,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      const usernameAfterTransfer = (await connection.getUsernames({ username: username }))[0];
      expect(usernameAfterTransfer.owner).toEqual(unusedAddress);

      connection.disconnect();
    });

    it("can create and update a multisignature account", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(0));

      // we need funds to pay the fees
      const address = identityToAddress(identity);
      await sendTokensFromFaucet(connection, address, registerAmount);

      // Create multisignature
      const otherIdentities = await Promise.all(
        [10, 11, 12, 13, 14].map(i => profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(i))),
      );
      const participants: readonly Participant[] = [identity, ...otherIdentities].map((id, i) => ({
        address: identityToAddress(id),
        weight: i === 0 ? 5 : 1,
      }));
      const tx1 = await connection.withDefaultFee<CreateMultisignatureTx & WithCreator>({
        kind: "bns/create_multisignature_contract",
        creator: identity,
        participants: participants,
        activationThreshold: 4,
        adminThreshold: 5,
      });
      const nonce1 = await connection.getNonce({ pubkey: identity.pubkey });
      const signed1 = await profile.signTransaction(tx1, bnsCodec, nonce1);
      const txBytes1 = bnsCodec.bytesToPost(signed1);
      const response1 = await connection.postTx(txBytes1);
      const blockInfo1 = await response1.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo1.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult1 = (await connection.searchTx({ signedBy: address })).filter(isConfirmedTransaction);
      expect(searchResult1.length).toEqual(1);
      const { result: contractId, transaction: firstSearchResultTransaction } = searchResult1[0];
      if (!isCreateMultisignatureTx(firstSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(firstSearchResultTransaction.participants.length).toEqual(6);
      firstSearchResultTransaction.participants.forEach((participant, i) => {
        expect(participant.address).toEqual(participants[i].address);
        expect(participant.weight).toEqual(participants[i].weight);
      });
      expect(firstSearchResultTransaction.activationThreshold).toEqual(4);
      expect(firstSearchResultTransaction.adminThreshold).toEqual(5);
      expect(contractId).toBeDefined();

      // Update multisignature
      const participantsUpdated: readonly Participant[] = (await Promise.all(
        [15, 16, 17].map(i => profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(i))),
      )).map(id => ({
        address: identityToAddress(id),
        weight: 6,
      }));
      const tx2 = await connection.withDefaultFee<UpdateMultisignatureTx & WithCreator>({
        kind: "bns/update_multisignature_contract",
        creator: identity,
        contractId: contractId!,
        participants: participantsUpdated,
        activationThreshold: 2,
        adminThreshold: 6,
      });
      const nonce2 = await connection.getNonce({ pubkey: identity.pubkey });
      const signed2 = await profile.signTransaction(tx2, bnsCodec, nonce2);
      const txBytes2 = bnsCodec.bytesToPost(signed2);
      const response2 = await connection.postTx(txBytes2);
      const blockInfo2 = await response2.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo2.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction2
      const searchResult2 = (await connection.searchTx({ signedBy: address })).filter(isConfirmedTransaction);
      expect(searchResult2.length).toEqual(2);
      const { transaction: secondSearchResultTransaction } = searchResult2[1];
      if (!isUpdateMultisignatureTx(secondSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(secondSearchResultTransaction.participants.length).toEqual(3);
      secondSearchResultTransaction.participants.forEach((participant, i) => {
        expect(participant.address).toEqual(participantsUpdated[i].address);
        expect(participant.weight).toEqual(participantsUpdated[i].weight);
      });
      expect(secondSearchResultTransaction.activationThreshold).toEqual(2);
      expect(secondSearchResultTransaction.adminThreshold).toEqual(6);
      expect(contractId).toBeDefined();

      connection.disconnect();
    });

    it("can create and release an escrow", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const [sender, recipient, arbiter] = await Promise.all(
        [0, 10, 20].map(i => profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(i))),
      );
      const [senderAddress, recipientAddress, arbiterAddress] = [sender, recipient, arbiter].map(
        identityToAddress,
      );
      const timeout = {
        timestamp: Math.floor(Date.now() / 1000) + 3000,
      };
      const memo = "testing 123";

      // we need funds to pay the fees
      await sendTokensFromFaucet(connection, senderAddress, registerAmount);
      await sendTokensFromFaucet(connection, arbiterAddress, registerAmount);

      // Create escrow
      const tx1 = await connection.withDefaultFee<CreateEscrowTx & WithCreator>({
        kind: "bns/create_escrow",
        creator: sender,
        sender: senderAddress,
        arbiter: arbiterAddress,
        recipient: recipientAddress,
        amounts: [defaultAmount],
        timeout: timeout,
        memo: memo,
      });
      const nonce1 = await connection.getNonce({ pubkey: sender.pubkey });
      const signed1 = await profile.signTransaction(tx1, bnsCodec, nonce1);
      const txBytes1 = bnsCodec.bytesToPost(signed1);
      const response1 = await connection.postTx(txBytes1);
      const blockInfo1 = await response1.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo1.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult1 = (await connection.searchTx({ signedBy: senderAddress })).filter(
        isConfirmedTransaction,
      );
      expect(searchResult1.length).toEqual(1);
      const { result, transaction: firstSearchResultTransaction } = searchResult1[0];
      if (!isCreateEscrowTx(firstSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(firstSearchResultTransaction.sender).toEqual(senderAddress);
      expect(firstSearchResultTransaction.recipient).toEqual(recipientAddress);
      expect(firstSearchResultTransaction.arbiter).toEqual(arbiterAddress);
      expect(firstSearchResultTransaction.amounts).toEqual([defaultAmount]);
      expect(firstSearchResultTransaction.timeout).toEqual(timeout);
      expect(firstSearchResultTransaction.memo).toEqual(memo);
      expect(result).toBeDefined();

      const escrowId = decodeNumericId(result!);

      // Release escrow
      const tx2 = await connection.withDefaultFee<ReleaseEscrowTx & WithCreator>({
        kind: "bns/release_escrow",
        creator: arbiter,
        escrowId: escrowId,
        amounts: [defaultAmount],
      });
      const nonce2 = await connection.getNonce({ pubkey: arbiter.pubkey });
      const signed2 = await profile.signTransaction(tx2, bnsCodec, nonce2);
      const txBytes2 = bnsCodec.bytesToPost(signed2);
      const response2 = await connection.postTx(txBytes2);
      const blockInfo2 = await response2.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo2.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult2 = (await connection.searchTx({ signedBy: arbiterAddress })).filter(
        isConfirmedTransaction,
      );
      expect(searchResult2.length).toEqual(1);
      const { transaction: secondSearchResultTransaction } = searchResult2[0];
      if (!isReleaseEscrowTx(secondSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(secondSearchResultTransaction.escrowId).toEqual(escrowId);
      expect(secondSearchResultTransaction.amounts).toEqual([defaultAmount]);

      connection.disconnect();
    });

    it("any account can return an escrow (after the timeout)", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));

      let escrowId: Uint8Array;
      {
        const sender = await profile.createIdentity(wallet.id, chainId, HdPaths.iov(0));
        const senderAddress = identityToAddress(sender);
        await sendTokensFromFaucet(connection, senderAddress, registerAmount);

        const timeout = Math.floor(Date.now() / 1000) + 3;

        const createEscrowTx = await connection.withDefaultFee<CreateEscrowTx & WithCreator>({
          kind: "bns/create_escrow",
          creator: sender,
          sender: senderAddress,
          arbiter: encodeBnsAddress("tiov", fromHex("0000000000000000000000000000000000000000")),
          recipient: encodeBnsAddress("tiov", fromHex("0000000000000000000000000000000000000000")),
          amounts: [defaultAmount],
          timeout: { timestamp: timeout },
        });

        const nonce = await connection.getNonce({ pubkey: sender.pubkey });
        const signed = await profile.signTransaction(createEscrowTx, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        if (!isBlockInfoSucceeded(blockInfo)) throw new Error("Transaction did not succeed");
        escrowId = blockInfo.result || fromHex("");
      }

      await sleep(5_000);

      {
        // Use an external helper account (random path from random wallet) that returns the escrow for source
        const addressIndex = getRandomInteger(100, 2 ** 31);
        const helperIdentity = await profile.createIdentity(wallet.id, chainId, HdPaths.iov(addressIndex));
        const helperAddress = identityToAddress(helperIdentity);
        await sendTokensFromFaucet(connection, helperAddress);

        const returnEscrowTx = await connection.withDefaultFee<ReturnEscrowTx & WithCreator>({
          kind: "bns/return_escrow",
          creator: helperIdentity,
          escrowId: decodeNumericId(escrowId),
        });

        const nonce = await connection.getNonce({ pubkey: helperIdentity.pubkey });
        const signed = await profile.signTransaction(returnEscrowTx, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }
    });

    it("can create and return an escrow", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const [sender, recipient, arbiter] = await Promise.all(
        [0, 10, 20].map(i => profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(i))),
      );
      const [senderAddress, recipientAddress, arbiterAddress] = [sender, recipient, arbiter].map(
        identityToAddress,
      );
      const timeout = {
        timestamp: Math.floor(Date.now() / 1000) + 3,
      };
      const memo = "testing 123";

      // we need funds to pay the fees
      await sendTokensFromFaucet(connection, senderAddress, registerAmount);
      await sendTokensFromFaucet(connection, arbiterAddress, registerAmount);

      // Create escrow
      const tx1 = await connection.withDefaultFee<CreateEscrowTx & WithCreator>({
        kind: "bns/create_escrow",
        creator: sender,
        sender: senderAddress,
        arbiter: arbiterAddress,
        recipient: recipientAddress,
        amounts: [defaultAmount],
        timeout: timeout,
        memo: memo,
      });
      const nonce1 = await connection.getNonce({ pubkey: sender.pubkey });
      const signed1 = await profile.signTransaction(tx1, bnsCodec, nonce1);
      const txBytes1 = bnsCodec.bytesToPost(signed1);
      const response1 = await connection.postTx(txBytes1);
      const blockInfo1 = await response1.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo1.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult1 = (await connection.searchTx({ signedBy: senderAddress })).filter(
        isConfirmedTransaction,
      );
      expect(searchResult1.length).toEqual(1);
      const { result, transaction: firstSearchResultTransaction } = searchResult1[0];
      if (!isCreateEscrowTx(firstSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(firstSearchResultTransaction.sender).toEqual(senderAddress);
      expect(firstSearchResultTransaction.recipient).toEqual(recipientAddress);
      expect(firstSearchResultTransaction.arbiter).toEqual(arbiterAddress);
      expect(firstSearchResultTransaction.amounts).toEqual([defaultAmount]);
      expect(firstSearchResultTransaction.timeout).toEqual(timeout);
      expect(firstSearchResultTransaction.memo).toEqual(memo);
      expect(result).toBeDefined();

      const escrowId = decodeNumericId(result!);

      // Wait for timeout to pass
      await sleep(7000);

      // Return escrow
      const tx2 = await connection.withDefaultFee<ReturnEscrowTx & WithCreator>({
        kind: "bns/return_escrow",
        creator: arbiter,
        escrowId: escrowId,
      });
      const nonce2 = await connection.getNonce({ pubkey: arbiter.pubkey });
      const signed2 = await profile.signTransaction(tx2, bnsCodec, nonce2);
      const txBytes2 = bnsCodec.bytesToPost(signed2);
      const response2 = await connection.postTx(txBytes2);
      const blockInfo2 = await response2.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo2.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult2 = (await connection.searchTx({ signedBy: arbiterAddress })).filter(
        isConfirmedTransaction,
      );
      expect(searchResult2.length).toEqual(1);
      const { transaction: secondSearchResultTransaction } = searchResult2[0];
      if (!isReturnEscrowTx(secondSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(secondSearchResultTransaction.escrowId).toEqual(escrowId);

      connection.disconnect();
    });

    it("can create and update an escrow", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const [sender, recipient, arbiter, newArbiter] = await Promise.all(
        [0, 10, 20, 21].map(i => profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(i))),
      );
      const [senderAddress, recipientAddress, arbiterAddress, newArbiterAddress] = [
        sender,
        recipient,
        arbiter,
        newArbiter,
      ].map(identityToAddress);
      const timeout = {
        timestamp: Math.floor(Date.now() / 1000) + 3000,
      };
      const memo = "testing 123";

      // we need funds to pay the fees
      await sendTokensFromFaucet(connection, senderAddress, registerAmount);
      await sendTokensFromFaucet(connection, arbiterAddress, registerAmount);

      // Create escrow
      const tx1 = await connection.withDefaultFee<CreateEscrowTx & WithCreator>({
        kind: "bns/create_escrow",
        creator: sender,
        sender: senderAddress,
        arbiter: arbiterAddress,
        recipient: recipientAddress,
        amounts: [defaultAmount],
        timeout: timeout,
        memo: memo,
      });
      const nonce1 = await connection.getNonce({ pubkey: sender.pubkey });
      const signed1 = await profile.signTransaction(tx1, bnsCodec, nonce1);
      const txBytes1 = bnsCodec.bytesToPost(signed1);
      const response1 = await connection.postTx(txBytes1);
      const blockInfo1 = await response1.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo1.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult1 = (await connection.searchTx({ signedBy: senderAddress })).filter(
        isConfirmedTransaction,
      );
      expect(searchResult1.length).toEqual(1);
      const { result, transaction: firstSearchResultTransaction } = searchResult1[0];
      if (!isCreateEscrowTx(firstSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(firstSearchResultTransaction.sender).toEqual(senderAddress);
      expect(firstSearchResultTransaction.recipient).toEqual(recipientAddress);
      expect(firstSearchResultTransaction.arbiter).toEqual(arbiterAddress);
      expect(firstSearchResultTransaction.amounts).toEqual([defaultAmount]);
      expect(firstSearchResultTransaction.timeout).toEqual(timeout);
      expect(firstSearchResultTransaction.memo).toEqual(memo);
      expect(result).toBeDefined();

      const escrowId = decodeNumericId(result!);

      // Update escrow
      const tx2 = await connection.withDefaultFee<UpdateEscrowPartiesTx & WithCreator>({
        kind: "bns/update_escrow_parties",
        creator: arbiter,
        escrowId: escrowId,
        arbiter: newArbiterAddress,
      });
      const nonce2 = await connection.getNonce({ pubkey: arbiter.pubkey });
      const signed2 = await profile.signTransaction(tx2, bnsCodec, nonce2);
      const txBytes2 = bnsCodec.bytesToPost(signed2);
      const response2 = await connection.postTx(txBytes2);
      const blockInfo2 = await response2.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo2.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult2 = (await connection.searchTx({ signedBy: arbiterAddress })).filter(
        isConfirmedTransaction,
      );
      expect(searchResult2.length).toEqual(1);
      const { transaction: secondSearchResultTransaction } = searchResult2[0];
      if (!isUpdateEscrowPartiesTx(secondSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(secondSearchResultTransaction.escrowId).toEqual(escrowId);
      expect(secondSearchResultTransaction.arbiter).toEqual(newArbiterAddress);

      connection.disconnect();
    });

    it("can create and vote on a proposal", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, admin: author } = await userProfileWithFaucet(chainId);
      const authorAddress = identityToAddress(author);

      const someElectionRule = (await connection.getElectionRules()).find(
        // Dictatorship electorate
        ({ electorateId }) => electorateId === 2,
      );
      if (!someElectionRule) {
        throw new Error("No election rule found");
      }
      const startTime = Math.floor(Date.now() / 1000) + 3;

      const title = `Hello ${Math.random()}`;
      const description = `Hello ${Math.random()}`;
      const action: CreateTextResolutionAction = {
        kind: ActionKind.CreateTextResolution,
        resolution: `The winner is Alice ${Math.random()}`,
      };
      let proposalId: number;

      {
        const createProposal = await connection.withDefaultFee<CreateProposalTx & WithCreator>({
          kind: "bns/create_proposal",
          creator: author,
          title: title,
          description: description,
          author: authorAddress,
          electionRuleId: someElectionRule.id,
          action: action,
          startTime: startTime,
        });
        const nonce = await connection.getNonce({ pubkey: author.pubkey });
        const signed = await profile.signTransaction(createProposal, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        if (!isBlockInfoSucceeded(blockInfo)) {
          throw new Error("Transaction did not succeed");
        }
        if (!blockInfo.result) {
          throw new Error("Transaction result missing");
        }
        proposalId = new BN(blockInfo.result).toNumber();
      }

      {
        // Election submitted, voting period not yet started
        const proposal = (await connection.getProposals()).find(p => p.id === proposalId)!;
        expect(proposal.votingStartTime).toBeGreaterThan(Date.now() / 1000);
        expect(proposal.state.totalYes).toEqual(0);
        expect(proposal.state.totalNo).toEqual(0);
        expect(proposal.state.totalAbstain).toEqual(0);
        expect(proposal.status).toEqual(ProposalStatus.Submitted);
        expect(proposal.result).toEqual(ProposalResult.Undefined);
        expect(proposal.executorResult).toEqual(ProposalExecutorResult.NotRun);
      }

      await sleep(6_000);

      {
        // Election submitted, voting period started
        const proposal = (await connection.getProposals()).find(p => p.id === proposalId)!;
        expect(proposal.votingStartTime).toBeLessThan(Date.now() / 1000);
        expect(proposal.votingEndTime).toBeGreaterThan(Date.now() / 1000);
        expect(proposal.state.totalYes).toEqual(0);
        expect(proposal.state.totalNo).toEqual(0);
        expect(proposal.state.totalAbstain).toEqual(0);
        expect(proposal.status).toEqual(ProposalStatus.Submitted);
        expect(proposal.result).toEqual(ProposalResult.Undefined);
        expect(proposal.executorResult).toEqual(ProposalExecutorResult.NotRun);
      }

      {
        const voteForProposal = await connection.withDefaultFee<VoteTx & WithCreator>({
          kind: "bns/vote",
          creator: author,
          proposalId: proposalId,
          selection: VoteOption.Yes,
        });
        const nonce = await connection.getNonce({ pubkey: author.pubkey });
        const signed = await profile.signTransaction(voteForProposal, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      }

      await sleep(15_000);

      {
        // Election ended, was tallied automatically and is accepted
        const proposal = (await connection.getProposals()).find(p => p.id === proposalId)!;
        expect(proposal.state.totalYes).toEqual(10);
        expect(proposal.state.totalNo).toEqual(0);
        expect(proposal.state.totalAbstain).toEqual(0);
        expect(proposal.status).toEqual(ProposalStatus.Closed);
        expect(proposal.result).toEqual(ProposalResult.Accepted);
        expect(proposal.executorResult).toEqual(ProposalExecutorResult.Succeeded);
      }

      connection.disconnect();
    }, 30_000);
  });

  describe("getTx", () => {
    it("can get a transaction by ID", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);

      // by non-existing ID
      {
        const nonExistentId = "abcd" as TransactionId;
        await connection
          .getTx(nonExistentId)
          .then(fail.bind(null, "should not resolve"), error =>
            expect(error).toMatch(/transaction does not exist/i),
          );
      }

      {
        const chainId = connection.chainId();
        const { profile, faucet } = await userProfileWithFaucet(chainId);

        const memo = `Payment ${Math.random()}`;
        const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
          kind: "bcp/send",
          creator: faucet,
          sender: bnsCodec.identityToAddress(faucet),
          recipient: await randomBnsAddress(),
          memo: memo,
          amount: defaultAmount,
        });

        const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
        const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        const transactionId = response.transactionId;

        await tendermintSearchIndexUpdated();

        const result = await connection.getTx(transactionId);
        expect(result.height).toBeGreaterThanOrEqual(2);
        expect(result.transactionId).toEqual(transactionId);
        if (isFailedTransaction(result)) {
          throw new Error("Expected ConfirmedTransaction, received FailedTransaction");
        }
        const transaction = result.transaction;
        if (!isSendTransaction(transaction)) {
          throw new Error("Unexpected transaction type");
        }
        expect(transaction.recipient).toEqual(sendTx.recipient);
        expect(transaction.amount).toEqual(defaultAmount);
      }

      connection.disconnect();
    });

    it("can get a transaction by ID and verify its signature", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();
      const { profile, faucet } = await userProfileWithFaucet(chainId);

      const memo = `Payment ${Math.random()}`;
      const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: faucet,
        sender: bnsCodec.identityToAddress(faucet),
        recipient: await randomBnsAddress(),
        memo: memo,
        amount: defaultAmount,
      });

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      const transactionId = response.transactionId;

      await tendermintSearchIndexUpdated();

      const result = await connection.getTx(transactionId);
      if (isFailedTransaction(result)) {
        throw new Error("Expected ConfirmedTransaction, received FailedTransaction");
      }
      const { transaction, primarySignature: signature } = result;
      const publicKey = transaction.creator.pubkey.data;
      const signingJob = bnsCodec.bytesToSign(transaction, signature.nonce);
      const txBytes = new Sha512(signingJob.bytes).digest();

      const valid = await Ed25519.verifySignature(signature.signature, txBytes, publicKey);
      expect(valid).toBe(true);

      connection.disconnect();
    });
  });

  describe("searchTx", () => {
    it("can search for transactions by tags", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, faucet } = await userProfileWithFaucet(chainId);
      const rcptAddress = await randomBnsAddress();

      // construct a sendtx, this is normally used in the MultiChainSigner api
      const memo = `Payment ${Math.random()}`;
      const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: faucet,
        sender: bnsCodec.identityToAddress(faucet),
        recipient: rcptAddress,
        memo: memo,
        amount: defaultAmount,
      });

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
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

      const { profile, faucet } = await userProfileWithFaucet(chainId);
      const rcptAddress = await randomBnsAddress();

      // construct a sendtx, this is normally used in the MultiChainSigner api
      const memo = `Payment ${Math.random()}`;
      const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: faucet,
        sender: bnsCodec.identityToAddress(faucet),
        recipient: rcptAddress,
        memo: memo,
        amount: defaultAmount,
      });

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
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

      const { profile, faucet } = await userProfileWithFaucet(chainId);

      const memo = `Payment ${Math.random()}`;
      const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: faucet,
        sender: bnsCodec.identityToAddress(faucet),
        recipient: await randomBnsAddress(),
        memo: memo,
        amount: defaultAmount,
      });

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
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

      const { profile, faucet } = await userProfileWithFaucet(chainId);
      const recipientAddress = await randomBnsAddress();

      // construct a sendtx, this is normally used in the MultiChainSigner api
      const memo = `Payment ${Math.random()}`;
      const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: faucet,
        sender: bnsCodec.identityToAddress(faucet),
        recipient: recipientAddress,
        memo: memo,
        amount: defaultAmount,
      });

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      await response.blockInfo.waitFor(info => !isBlockInfoPending(info));

      await tendermintSearchIndexUpdated();

      {
        // finds transaction using sentFromOrTo and minHeight = 1
        const results = (await connection.searchTx({ sentFromOrTo: recipientAddress, minHeight: 1 })).filter(
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
          sentFromOrTo: recipientAddress,
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
          sentFromOrTo: recipientAddress,
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
          sentFromOrTo: recipientAddress,
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

      const { profile, walletId } = await userProfileWithFaucet(chainId);
      // this will never have tokens, but can try to sign
      const brokeIdentity = await profile.createIdentity(walletId, chainId, HdPaths.iov(1234));

      const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: brokeIdentity,
        sender: bnsCodec.identityToAddress(brokeIdentity),
        recipient: await randomBnsAddress(),
        memo: "Sending from empty",
        amount: defaultAmount,
      });

      // give the broke Identity just enough to pay the fee
      await sendTokensFromFaucet(connection, identityToAddress(brokeIdentity), sendTx.fee!.tokens);

      const nonce = await connection.getNonce({ pubkey: brokeIdentity.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
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
      // https://github.com/iov-one/weave/blob/v0.15.0/errors/errors.go#L52
      expect(result.code).toEqual(13);
      expect(result.message).toMatch(/invalid amount/i);

      connection.disconnect();
    });
  });

  describe("listenTx", () => {
    it("can listen to transactions by hash", done => {
      pendingWithoutBnsd();

      (async () => {
        const connection = await BnsConnection.establish(bnsdTendermintUrl);
        const chainId = connection.chainId();

        const { profile, faucet } = await userProfileWithFaucet(chainId);

        const memo = `Payment ${Math.random()}`;
        const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
          kind: "bcp/send",
          creator: faucet,
          sender: bnsCodec.identityToAddress(faucet),
          recipient: await randomBnsAddress(),
          memo: memo,
          amount: defaultAmount,
        });

        const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
        const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
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

      const { profile, faucet } = await userProfileWithFaucet(chainId);

      const memo = `Payment ${Math.random()}`;
      const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: faucet,
        sender: bnsCodec.identityToAddress(faucet),
        recipient: await randomBnsAddress(),
        memo: memo,
        amount: defaultAmount,
      });

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
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

      const { profile, faucet } = await userProfileWithFaucet(chainId);

      const memo = `Payment ${Math.random()}`;
      const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: faucet,
        sender: bnsCodec.identityToAddress(faucet),
        recipient: await randomBnsAddress(),
        memo: memo,
        amount: defaultAmount,
      });

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
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

      const { profile, walletId } = await userProfileWithFaucet(chainId);
      // this will never have tokens, but can try to sign
      const brokeIdentity = await profile.createIdentity(walletId, chainId, HdPaths.iov(1234));

      const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: brokeIdentity,
        sender: bnsCodec.identityToAddress(brokeIdentity),
        recipient: await randomBnsAddress(),
        memo: "Sending from empty",
        amount: defaultAmount,
      });

      // give the broke Identity just enough to pay the fee
      await sendTokensFromFaucet(connection, identityToAddress(brokeIdentity), sendTx.fee!.tokens);

      const nonce = await connection.getNonce({ pubkey: brokeIdentity.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const transactionIdToSearch = response.transactionId;
      await response.blockInfo.waitFor(info => !isBlockInfoPending(info));

      await tendermintSearchIndexUpdated();

      const result = await firstEvent(connection.liveTx({ id: transactionIdToSearch }));

      if (!isFailedTransaction(result)) {
        throw new Error("Expected failed transaction");
      }
      expect(result.height).toBeGreaterThan(initialHeight);
      // https://github.com/iov-one/weave/blob/v0.15.0/errors/errors.go#L52
      expect(result.code).toEqual(13);
      expect(result.message).toMatch(/invalid amount/i);

      connection.disconnect();
    });

    it("reports DeliverTx error for a future transaction", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, walletId } = await userProfileWithFaucet(chainId);
      // this will never have tokens, but can try to sign
      const brokeIdentity = await profile.createIdentity(walletId, chainId, HdPaths.iov(1234));

      // Sending tokens from an empty account will trigger a failure in DeliverTx
      const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: brokeIdentity,
        sender: bnsCodec.identityToAddress(brokeIdentity),
        recipient: await randomBnsAddress(),
        memo: "Sending from empty",
        amount: defaultAmount,
      });

      // give the broke Identity just enough to pay the fee
      await sendTokensFromFaucet(connection, identityToAddress(brokeIdentity), sendTx.fee!.tokens);

      const nonce = await connection.getNonce({ pubkey: brokeIdentity.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const transactionIdToSearch = response.transactionId;

      const result = await firstEvent(connection.liveTx({ id: transactionIdToSearch }));

      if (!isFailedTransaction(result)) {
        throw new Error("Expected failed transaction");
      }
      // https://github.com/iov-one/weave/blob/v0.15.0/errors/errors.go#L52
      expect(result.code).toEqual(13);
      expect(result.message).toMatch(/invalid amount/i);

      connection.disconnect();
    });
  });

  describe("getValidators", () => {
    it("works", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);

      const validators = await connection.getValidators();
      expect(validators.length).toEqual(1);
      expect(validators[0].pubkey.algo).toEqual(Algorithm.Ed25519);
      expect(validators[0].pubkey.data.length).toEqual(32);
      expect(validators[0].power).toEqual(10);

      connection.disconnect();
    });
  });

  describe("getElectorates", () => {
    it("can query electorates set in genesis", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);

      const electorates = await connection.getElectorates();
      expect(electorates.length).toBeGreaterThanOrEqual(1);
      expect(electorates[0]).toEqual({
        id: 1,
        version: 1,
        admin: "tiov1qkz3ujh7fwpjy88tc3xnc70xr8xfh703pm8r85" as Address,
        title: "Default electorate",
        electors: {
          tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea: { weight: 9 },
          tiov12shyht3pvvacvyee36w5844jkfh5s0mf4gszp9: { weight: 10 },
          tiov18mgvcwg4339w40ktv0hmmln80ttvza2n6hjaxh: { weight: 11 },
        },
        totalWeight: 30,
      });

      connection.disconnect();
    });
  });

  describe("getElectionRules", () => {
    it("can query election rules set in genesis", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);

      const rules = await connection.getElectionRules();
      expect(rules.length).toEqual(3);
      expect(rules[0]).toEqual({
        id: 1,
        version: 1,
        admin: "tiov1qkz3ujh7fwpjy88tc3xnc70xr8xfh703pm8r85" as Address,
        electorateId: 1,
        title: "fooo",
        votingPeriod: 1 * 3600,
        threshold: {
          numerator: 2,
          denominator: 3,
        },
        quorum: null,
      });
      expect(rules[1]).toEqual({
        id: 2,
        version: 1,
        admin: "tiov1k0dp2fmdunscuwjjusqtk6mttx5ufk3z0mmp0z" as Address,
        electorateId: 2,
        title: "barr",
        votingPeriod: 10,
        threshold: {
          numerator: 1,
          denominator: 2,
        },
        quorum: {
          numerator: 2,
          denominator: 3,
        },
      });
      expect(rules[2]).toEqual({
        id: 3,
        version: 1,
        admin: "tiov1k0dp2fmdunscuwjjusqtk6mttx5ufk3z0mmp0z" as Address,
        electorateId: 2,
        title: "frontend",
        votingPeriod: 10 * 3600,
        threshold: {
          numerator: 1,
          denominator: 2,
        },
        quorum: {
          numerator: 2,
          denominator: 3,
        },
      });

      connection.disconnect();
    });
  });

  describe("getProposals", () => {
    it("can get list of proposals", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const proposals = await connection.getProposals(); // empty list for fresh chains
      expect(proposals.length).toBeGreaterThanOrEqual(0);
      connection.disconnect();
    });

    it("can create a proposal and find it in list", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, admin: author } = await userProfileWithFaucet(chainId);
      const authorAddress = identityToAddress(author);

      const someElectionRule = (await connection.getElectionRules()).find(() => true);
      if (!someElectionRule) {
        throw new Error("No election rule found");
      }
      const startTime = Math.floor(Date.now() / 1000) + 3;

      const title = `Hello ${Math.random()}`;
      const description = `Hello ${Math.random()}`;
      const action: CreateTextResolutionAction = {
        kind: ActionKind.CreateTextResolution,
        resolution: `The winner is Alice ${Math.random()}`,
      };

      const createProposal = await connection.withDefaultFee<CreateProposalTx & WithCreator>({
        kind: "bns/create_proposal",
        creator: author,
        title: title,
        description: description,
        author: authorAddress,
        electionRuleId: someElectionRule.id,
        action: action,
        startTime: startTime,
      });

      const nonce = await connection.getNonce({ pubkey: author.pubkey });
      const signed = await profile.signTransaction(createProposal, bnsCodec, nonce);
      {
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      }

      const proposals = await connection.getProposals();
      expect(proposals.length).toBeGreaterThanOrEqual(1);

      const myProposal = proposals.find(p => p.author === authorAddress && p.votingStartTime === startTime);
      expect(myProposal).toBeDefined();
      expect(myProposal!.title).toEqual(title);
      expect(myProposal!.description).toEqual(description);
      expect(myProposal!.action).toEqual(action);

      connection.disconnect();
    });
  });

  describe("getUsernames", () => {
    it("can query usernames by name", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(0));
      const identityAddress = identityToAddress(identity);
      await sendTokensFromFaucet(connection, identityAddress, registerAmount);

      // Register username
      const username = `testuser_${Math.random()}*iov`;
      const targets = [{ chainId: "foobar" as ChainId, address: identityAddress }] as const;
      const registration = await connection.withDefaultFee<RegisterUsernameTx & WithCreator>({
        kind: "bns/register_username",
        creator: identity,
        username: username,
        targets: targets,
      });
      const nonce = await connection.getNonce({ pubkey: identity.pubkey });
      const signed = await profile.signTransaction(registration, bnsCodec, nonce);
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
          targets: targets,
        });
      }

      // Query by non-existing name
      {
        const results = await connection.getUsernames({ username: "user_we_dont_have*iov" });
        expect(results.length).toEqual(0);
      }

      connection.disconnect();
    });

    it("can query usernames owner", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(0));
      const identityAddress = identityToAddress(identity);
      await sendTokensFromFaucet(connection, identityAddress, registerAmount);

      // Register username
      const username = `testuser_${Math.random()}*iov`;
      const targets = [{ chainId: "foobar" as ChainId, address: identityAddress }] as const;
      const registration = await connection.withDefaultFee<RegisterUsernameTx & WithCreator>({
        kind: "bns/register_username",
        creator: identity,
        username: username,
        targets: targets,
      });
      const nonce = await connection.getNonce({ pubkey: identity.pubkey });
      const signed = await profile.signTransaction(registration, bnsCodec, nonce);
      {
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
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
  });

  const sendCash = async (
    connection: BnsConnection,
    profile: UserProfile,
    faucet: Identity,
    rcptAddr: Address,
  ): Promise<PostTxResponse> => {
    // construct a sendtx, this is normally used in the MultiChainSigner api
    const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
      kind: "bcp/send",
      creator: faucet,
      sender: bnsCodec.identityToAddress(faucet),
      recipient: rcptAddr,
      amount: {
        quantity: "68000000000",
        fractionalDigits: 9,
        tokenTicker: cash,
      },
    });
    const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
    const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
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
    expect(faucetAcct.value()!.balance.length).toEqual(2);
    const faucetStartBalance = faucetAcct.value()!.balance.find(({ tokenTicker }) => tokenTicker === cash)!;

    // send some cash
    const post = await sendCash(connection, profile, faucet, recipientAddr);
    await post.blockInfo.waitFor(info => !isBlockInfoPending(info));

    // give it a chance to get updates before checking and proceeding
    await sleep(100);

    // rcptAcct should now have a value
    expect(rcptAcct.value()).toBeDefined();
    expect(rcptAcct.value()!.balance.length).toEqual(1);
    expect(rcptAcct.value()!.balance.find(({ tokenTicker }) => tokenTicker === cash)!.quantity).toEqual(
      "68000000000",
    );

    // facuetAcct should have gone down a bit
    expect(faucetAcct.value()).toBeDefined();
    expect(faucetAcct.value()!.balance.length).toEqual(2);
    const faucetEndBalance = faucetAcct.value()!.balance.find(({ tokenTicker }) => tokenTicker === cash)!;
    expect(faucetEndBalance).not.toEqual(faucetStartBalance);
    expect(faucetEndBalance.quantity).toEqual(
      Long.fromString(faucetStartBalance.quantity)
        .subtract(68_000000000)
        .subtract(0_010000000) // the fee (0.01 CASH)
        .toString(),
    );

    connection.disconnect();
  });

  it("can start atomic swap", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    const chainId = connection.chainId();

    const { profile, faucet } = await userProfileWithFaucet(chainId);
    const faucetAddr = identityToAddress(faucet);
    const recipientAddr = await randomBnsAddress();

    const initSwaps = await connection.getSwaps({ recipient: recipientAddr });
    expect(initSwaps.length).toEqual(0);

    const swapOfferPreimage = await AtomicSwapHelpers.createPreimage();
    const swapOfferHash = AtomicSwapHelpers.hashPreimage(swapOfferPreimage);

    // it will live 48 hours
    const swapOfferTimeout: SwapTimeout = createTimestampTimeout(48 * 3600);
    const amount = {
      quantity: "123000456000",
      fractionalDigits: 9,
      tokenTicker: cash,
    };
    const swapOfferTx = await connection.withDefaultFee<SwapOfferTransaction & WithCreator>({
      kind: "bcp/swap_offer",
      creator: faucet,
      recipient: recipientAddr,
      amounts: [amount],
      timeout: swapOfferTimeout,
      hash: swapOfferHash,
    });

    const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
    const signed = await profile.signTransaction(swapOfferTx, bnsCodec, nonce);
    const post = await connection.postTx(bnsCodec.bytesToPost(signed));
    const transactionId = post.transactionId;
    expect(transactionId).toMatch(/^[0-9A-F]{64}$/);

    const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo)) {
      throw new Error(`Expected transaction state success but got state: ${blockInfo.state}`);
    }
    const txHeight = blockInfo.height;
    const txResult = blockInfo.result! as SwapIdBytes;
    // the transaction result is 8 byte number assigned by the application
    expect(Uint64.fromBytesBigEndian(txResult).toNumber()).toBeGreaterThanOrEqual(1);
    expect(Uint64.fromBytesBigEndian(txResult).toNumber()).toBeLessThanOrEqual(1000);

    await tendermintSearchIndexUpdated();

    // now query by the txid
    const search = (await connection.searchTx({ id: transactionId })).filter(isConfirmedTransaction);
    expect(search.length).toEqual(1);
    // make sure we get the same tx loaded
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
    const querySwapId: AtomicSwapQuery = {
      id: {
        data: txResult,
      },
    };
    const querySwapSender: AtomicSwapQuery = { sender: faucetAddr };
    const querySwapRecipient: AtomicSwapQuery = { recipient: recipientAddr };
    const querySwapHash: AtomicSwapQuery = { hash: swapOfferHash };

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

    // ----- connection.getSwaps() -------

    // we can also swap by id (returned by the transaction result)
    const idSwaps = await connection.getSwaps(querySwapId);
    expect(idSwaps.length).toEqual(1);

    const swap = idSwaps[0];
    expect(swap.kind).toEqual(SwapProcessState.Open);

    // and it matches expectations
    const swapData = swap.data;
    expect(swapData.id).toEqual({ data: txResult });
    expect(swapData.sender).toEqual(faucetAddr);
    expect(swapData.recipient).toEqual(recipientAddr);
    expect(swapData.timeout).toEqual(swapOfferTimeout);
    expect(swapData.amounts.length).toEqual(1);
    expect(swapData.amounts[0]).toEqual(amount);
    expect(swapData.hash).toEqual(swapOfferHash);

    // we can get the swap by the recipient
    const rcptSwaps = await connection.getSwaps(querySwapRecipient);
    expect(rcptSwaps.length).toEqual(1);
    expect(rcptSwaps[0]).toEqual(swap);

    // we can also get it by the sender
    const sendOpenSwapData = (await connection.getSwaps(querySwapSender)).filter(
      s => s.kind === SwapProcessState.Open,
    );
    expect(sendOpenSwapData.length).toBeGreaterThanOrEqual(1);
    expect(sendOpenSwapData[sendOpenSwapData.length - 1]).toEqual(swap);

    // we can also get it by the hash
    const hashSwap = await connection.getSwaps(querySwapHash);
    expect(hashSwap.length).toEqual(1);
    expect(hashSwap[0]).toEqual(swap);

    connection.disconnect();
  });

  describe("getSwapsFromState", () => {
    it("works", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const { profile, faucet } = await userProfileWithFaucet(connection.chainId());
      const faucetAddr = identityToAddress(faucet);
      const recipientAddr = await randomBnsAddress();

      const swapOfferHash = AtomicSwapHelpers.hashPreimage(await AtomicSwapHelpers.createPreimage());

      // it will live 48 hours
      const swapOfferTimeout = createTimestampTimeout(48 * 3600);
      const swapOfferTx = await connection.withDefaultFee<SwapOfferTransaction & WithCreator>({
        kind: "bcp/swap_offer",
        creator: faucet,
        recipient: recipientAddr,
        amounts: [defaultAmount],
        timeout: swapOfferTimeout,
        hash: swapOfferHash,
        memo: "fooooobar",
      });

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(swapOfferTx, bnsCodec, nonce);
      const post = await connection.postTx(bnsCodec.bytesToPost(signed));

      const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
      if (!isBlockInfoSucceeded(blockInfo)) {
        throw new Error(`Expected transaction state success but got state: ${blockInfo.state}`);
      }
      const txResult = blockInfo.result! as SwapIdBytes;

      await tendermintSearchIndexUpdated();

      // Prepare queries
      const expectedSwapData: SwapData = {
        id: { data: txResult },
        sender: faucetAddr,
        recipient: recipientAddr,
        timeout: swapOfferTimeout,
        amounts: [defaultAmount],
        hash: swapOfferHash,
        memo: "fooooobar",
      };

      // by ID
      const querySwapId: AtomicSwapQuery = { id: { data: txResult } };
      const swapsById = await connection.getSwapsFromState(querySwapId);
      expect(swapsById.length).toEqual(1);
      expect(swapsById[0].kind).toEqual(SwapProcessState.Open);
      expect(swapsById[0].data).toEqual(expectedSwapData);

      // by hash
      const querySwapHash: AtomicSwapQuery = { hash: swapOfferHash };
      const swapsByPreimageHash = await connection.getSwapsFromState(querySwapHash);
      expect(swapsByPreimageHash.length).toEqual(1);
      expect(swapsByPreimageHash[0].kind).toEqual(SwapProcessState.Open);
      expect(swapsByPreimageHash[0].data).toEqual(expectedSwapData);

      // by recipient
      const querySwapRecipient: AtomicSwapQuery = { recipient: recipientAddr };
      const swapsByRecipient = await connection.getSwapsFromState(querySwapRecipient);
      expect(swapsByRecipient.length).toEqual(1);
      expect(swapsByRecipient[0].kind).toEqual(SwapProcessState.Open);
      expect(swapsByRecipient[0].data).toEqual(expectedSwapData);

      // by sender
      const querySwapSender: AtomicSwapQuery = { sender: faucetAddr };
      const swapsBySender = await connection.getSwapsFromState(querySwapSender);
      expect(swapsBySender[swapsBySender.length - 1].kind).toEqual(SwapProcessState.Open);
      expect(swapsBySender[swapsBySender.length - 1].data).toEqual(expectedSwapData);

      connection.disconnect();
    });
  });

  const openSwap = async (
    connection: BnsConnection,
    profile: UserProfile,
    creator: Identity,
    rcptAddr: Address,
    hash: Hash,
  ): Promise<PostTxResponse> => {
    // construct a swapOfferTx, sign and post to the chain
    const swapOfferTimeout = createTimestampTimeout(48 * 3600);
    const swapOfferTx = await connection.withDefaultFee<SwapOfferTransaction & WithCreator>({
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
    });
    const nonce = await connection.getNonce({ pubkey: creator.pubkey });
    const signed = await profile.signTransaction(swapOfferTx, bnsCodec, nonce);
    const txBytes = bnsCodec.bytesToPost(signed);
    return connection.postTx(txBytes);
  };

  const claimSwap = async (
    connection: BnsConnection,
    profile: UserProfile,
    creator: Identity,
    swapId: SwapId,
    preimage: Preimage,
  ): Promise<PostTxResponse> => {
    // construct a swapOfferTx, sign and post to the chain
    const swapClaimTx = await connection.withDefaultFee<SwapClaimTransaction & WithCreator>({
      kind: "bcp/swap_claim",
      creator: creator,
      swapId: swapId,
      preimage: preimage,
    });
    const nonce = await connection.getNonce({ pubkey: creator.pubkey });
    const signed = await profile.signTransaction(swapClaimTx, bnsCodec, nonce);
    const txBytes = bnsCodec.bytesToPost(signed);
    return connection.postTx(txBytes);
  };

  it("can start and watch an atomic swap lifecycle", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    const { profile, faucet } = await userProfileWithFaucet(connection.chainId());
    const recipientAddr = await randomBnsAddress();

    // create the preimages for the three swaps
    const preimage1 = await AtomicSwapHelpers.createPreimage();
    const hash1 = AtomicSwapHelpers.hashPreimage(preimage1);
    const preimage2 = await AtomicSwapHelpers.createPreimage();
    const hash2 = AtomicSwapHelpers.hashPreimage(preimage2);
    const preimage3 = await AtomicSwapHelpers.createPreimage();
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
    const id1: SwapId = {
      data: blockInfo1.result! as SwapIdBytes,
    };
    expect(id1.data.length).toEqual(8);

    const post2 = await openSwap(connection, profile, faucet, recipientAddr, hash2);
    const blockInfo2 = await post2.blockInfo.waitFor(info => !isBlockInfoPending(info));
    if (!isBlockInfoSucceeded(blockInfo2)) {
      throw new Error(`Expected transaction state success but got state: ${blockInfo2.state}`);
    }
    const id2: SwapId = {
      data: blockInfo2.result! as SwapIdBytes,
    };
    expect(id2.data.length).toEqual(8);

    // find two open
    const midSwaps = await connection.getSwaps(rcptQuery);
    expect(midSwaps.length).toEqual(2);
    const open1 = midSwaps.find(matchId(id1));
    const open2 = midSwaps.find(matchId(id2));
    expect(open1).toBeDefined();
    expect(open2).toBeDefined();
    expect(open1!.kind).toEqual(SwapProcessState.Open);
    expect(open2!.kind).toEqual(SwapProcessState.Open);

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
    const id3: SwapId = {
      data: blockInfo3.result! as SwapIdBytes,
    };
    expect(id3.data.length).toEqual(8);

    {
      const post = await claimSwap(connection, profile, faucet, id1, preimage1);
      await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
    }

    // make sure we find two claims, one open
    const finalSwaps = await connection.getSwaps({ recipient: recipientAddr });
    expect(finalSwaps.length).toEqual(3);
    const claim1 = finalSwaps.find(matchId(id1));
    const claim2 = finalSwaps.find(matchId(id2));
    const open3 = finalSwaps.find(matchId(id3));
    expect(claim1).toBeDefined();
    expect(claim2).toBeDefined();
    expect(open3).toBeDefined();
    expect(claim1!.kind).toEqual(SwapProcessState.Claimed);
    expect(claim2!.kind).toEqual(SwapProcessState.Claimed);
    expect(open3!.kind).toEqual(SwapProcessState.Open);

    // We have no guarantees which events are fired exactly,
    // as it is a race condition if we get Open, Claimed or Aborted
    // directly. So let's just check the last information per ID.
    const latestEventPerId = new Map<string, AtomicSwap>();
    for (const event of liveView.value()) {
      latestEventPerId.set(serializeBnsSwapId(event.data.id), event);
    }

    expect(latestEventPerId.size).toEqual(3);
    expect(latestEventPerId.get(serializeBnsSwapId(id1))).toEqual({
      kind: SwapProcessState.Claimed,
      data: open1!.data,
      preimage: preimage1,
    });
    expect(latestEventPerId.get(serializeBnsSwapId(id2))).toEqual({
      kind: SwapProcessState.Claimed,
      data: open2!.data,
      preimage: preimage2,
    });
    expect(latestEventPerId.get(serializeBnsSwapId(id3))).toEqual({
      kind: SwapProcessState.Open,
      data: open3!.data,
    });

    connection.disconnect();
  });

  describe("getFeeQuote", () => {
    it("works for send transaction", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);

      const sendTransaction = {
        kind: "bcp/send",
        creator: {
          chainId: connection.chainId(),
          pubkey: {
            algo: Algorithm.Ed25519,
            data: fromHex("aabbccdd") as PubkeyBytes,
          },
        },
        recipient: await randomBnsAddress(),
        memo: `We ❤️ developers – iov.one`,
        amount: defaultAmount,
      };
      const result = await connection.getFeeQuote(sendTransaction);
      // anti-spam gconf fee from genesis
      expect(result.tokens!.quantity).toEqual("10000000");
      expect(result.tokens!.fractionalDigits).toEqual(9);
      expect(result.tokens!.tokenTicker).toEqual("CASH" as TokenTicker);

      expect(result.gasPrice).toBeUndefined();
      expect(result.gasLimit).toBeUndefined();

      connection.disconnect();
    });

    it("works for other BNS transaction", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);

      const username = `testuser_${Math.random()}`;
      const usernameRegistration = {
        kind: "bns/register_username",
        creator: {
          chainId: connection.chainId(),
          pubkey: {
            algo: Algorithm.Ed25519,
            data: fromHex("aabbccdd") as PubkeyBytes,
          },
        },
        addresses: [
          {
            address: "12345678912345W" as Address,
            chainId: "somechain" as ChainId,
          },
        ],
        username: username,
      };

      const result = await connection.getFeeQuote(usernameRegistration);
      // 5 CASH product fee
      expect(result.tokens!.quantity).toEqual("5000000000");
      expect(result.tokens!.fractionalDigits).toEqual(9);
      expect(result.tokens!.tokenTicker).toEqual("CASH" as TokenTicker);

      expect(result.gasPrice).toBeUndefined();
      expect(result.gasLimit).toBeUndefined();

      connection.disconnect();
    });

    it("throws for unsupported transaction kind", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);

      const otherTransaction: UnsignedTransaction = {
        kind: "other/kind",
        creator: {
          chainId: connection.chainId(),
          pubkey: {
            algo: Algorithm.Ed25519,
            data: fromHex("aabbccdd") as PubkeyBytes,
          },
        },
      };
      await connection
        .getFeeQuote(otherTransaction)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/transaction of unsupported kind/i));

      connection.disconnect();
    });
  });
});
