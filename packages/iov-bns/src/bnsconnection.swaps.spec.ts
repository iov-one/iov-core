import {
  Address,
  Amount,
  AtomicSwap,
  AtomicSwapHelpers,
  AtomicSwapQuery,
  ChainId,
  createTimestampTimeout,
  Hash,
  Identity,
  isBlockInfoPending,
  isBlockInfoSucceeded,
  isConfirmedTransaction,
  isSwapOfferTransaction,
  PostTxResponse,
  Preimage,
  SwapClaimTransaction,
  SwapData,
  SwapId,
  SwapIdBytes,
  swapIdEquals,
  SwapOfferTransaction,
  SwapProcessState,
  SwapTimeout,
  TokenTicker,
  WithCreator,
} from "@iov/bcp";
import { Random } from "@iov/crypto";
import { Encoding, Uint64 } from "@iov/encoding";
import { Ed25519HdWallet, HdPaths, UserProfile, WalletId } from "@iov/keycontrol";
import { asArray } from "@iov/stream";

import { bnsCodec } from "./bnscodec";
import { BnsConnection } from "./bnsconnection";
import { bnsSwapQueryTag } from "./tags";
import { encodeBnsAddress, identityToAddress } from "./util";

const { toHex } = Encoding;

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

async function randomBnsAddress(): Promise<Address> {
  return encodeBnsAddress("tiov", Random.getBytes(20));
}

function matchId(id: SwapId): (swap: AtomicSwap) => boolean {
  return s => swapIdEquals(id, s.data.id);
}

function serializeBnsSwapId(id: SwapId): string {
  return toHex(id.data);
}

const cash = "CASH" as TokenTicker;

fdescribe("BnsConnection (swaps)", () => {
  const defaultAmount: Amount = {
    quantity: "1000000001",
    fractionalDigits: 9,
    tokenTicker: cash,
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
});
