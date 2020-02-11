import {
  Address,
  Algorithm,
  Amount,
  AtomicSwap,
  ChainId,
  createTimestampTimeout,
  Hash,
  Identity,
  isBlockInfoPending,
  PostTxResponse,
  Preimage,
  PubkeyBundle,
  PubkeyBytes,
  SendTransaction,
  SwapClaimTransaction,
  SwapId,
  swapIdEquals,
  SwapOfferTransaction,
  TokenTicker,
} from "@iov/bcp";
import { Random } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { Ed25519HdWallet, HdPaths, UserProfile, WalletId } from "@iov/keycontrol";
import { sleep } from "@iov/utils";

import { bnsCodec } from "./bnscodec";
import { BnsConnection } from "./bnsconnection";
import { encodeBnsAddress, identityToAddress } from "./util";

const { fromHex, toHex } = Encoding;

export const bash = "BASH" as TokenTicker;
export const cash = "CASH" as TokenTicker;
export const blockTime = 1000;
export const bnsdTendermintUrl = "ws://localhost:23456";
export const bnsdTendermintHttpUrl = "http://localhost:23456";

export function pendingWithoutBnsd(): void {
  if (!process.env.BNSD_ENABLED) {
    pending("Set BNSD_ENABLED to enable bnsd-based tests");
  }
}

export async function tendermintSearchIndexUpdated(): Promise<void> {
  // Tendermint needs some time before a committed transaction is found in search
  return sleep(50);
}

export async function randomBnsAddress(): Promise<Address> {
  return encodeBnsAddress("tiov", Random.getBytes(20));
}

export function randomDomain(): string {
  const randomNumber = Math.random()
    .toString()
    // valid domain has length 3 to 16, we limit to `domain${randomNumber}` length (16 max).
    .substring(10);
  return `domain${randomNumber}`;
}

export function getRandomInteger(min: number, max: number): number {
  if (!Number.isInteger(min)) throw new Error("Argument min is not an integer");
  if (!Number.isInteger(max)) throw new Error("Argument max is not an integer");
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Dev faucet
// path: m/1229936198'/1'/0'/0'
// pubkey: e05f47e7639b47625c23738e2e46d092819abd6039c5fc550d9aa37f1a2556a1
// IOV address: tiov1q5lyl7asgr2dcweqrhlfyexqpkgcuzrm4e0cku
// This account has money in the genesis file (see scripts/bnsd/README.md).
const faucetMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
// tslint:disable-next-line: deprecation
const faucetPath = HdPaths.iovFaucet();
// Dev admin
// path: m/44'/234'/0'
// pubkey: 418f88ff4876d33a3d6e2a17d0fe0e78dc3cb5e4b42c6c156ed1b8bfce5d46d1
// IOV address: tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea
// Same mnemonic as faucet.
// This account has money in the genesis file (see scripts/bnsd/README.md).
const adminPath = HdPaths.iov(0);

// Generated using https://github.com/nym-zone/bech32
// bech32 -e -h tiov 010101020202030303040404050505050A0A0A0A
export const unusedAddress = "tiov1qyqszqszqgpsxqcyqszq2pg9q59q5zs2fx9n6s" as Address;
export const unusedPubkey: PubkeyBundle = {
  algo: Algorithm.Ed25519,
  data: fromHex("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb") as PubkeyBytes,
};

export const defaultAmount: Amount = {
  quantity: "1000000001",
  fractionalDigits: 9,
  tokenTicker: cash,
};
// this is enough money in an account that registers names... twice the cost of one name registration product fee
export const registerAmount: Amount = {
  quantity: "10000000000",
  fractionalDigits: 9,
  tokenTicker: cash,
};

export async function userProfileWithFaucet(
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

export async function sendTokensFromFaucet(
  connection: BnsConnection,
  recipient: Address,
  amount: Amount = defaultAmount,
): Promise<void> {
  const chainId = connection.chainId;
  const { profile, faucet } = await userProfileWithFaucet(chainId);
  const faucetAddress = bnsCodec.identityToAddress(faucet);

  const sendTx = await connection.withDefaultFee<SendTransaction>(
    {
      kind: "bcp/send",
      chainId: chainId,
      sender: faucetAddress,
      recipient: recipient,
      amount: amount,
    },
    faucetAddress,
  );
  const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
  const signed = await profile.signTransaction(faucet, sendTx, bnsCodec, nonce);
  const response = await connection.postTx(bnsCodec.bytesToPost(signed));
  await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
}

export async function sendCash(
  connection: BnsConnection,
  profile: UserProfile,
  faucet: Identity,
  rcptAddr: Address,
): Promise<PostTxResponse> {
  const faucetAddress = bnsCodec.identityToAddress(faucet);
  // construct a sendtx, this is normally used in the MultiChainSigner api
  const sendTx = await connection.withDefaultFee<SendTransaction>(
    {
      kind: "bcp/send",
      chainId: faucet.chainId,
      sender: faucetAddress,
      recipient: rcptAddr,
      amount: {
        quantity: "68000000000",
        fractionalDigits: 9,
        tokenTicker: cash,
      },
    },
    faucetAddress,
  );
  const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
  const signed = await profile.signTransaction(faucet, sendTx, bnsCodec, nonce);
  const txBytes = bnsCodec.bytesToPost(signed);
  return connection.postTx(txBytes);
}

export async function ensureNonceNonZero(
  connection: BnsConnection,
  profile: UserProfile,
  identity: Identity,
): Promise<void> {
  const address = bnsCodec.identityToAddress(identity);
  const sendTx = await connection.withDefaultFee<SendTransaction>(
    {
      kind: "bcp/send",
      chainId: identity.chainId,
      sender: address,
      recipient: await randomBnsAddress(),
      amount: defaultAmount,
    },
    address,
  );
  const nonce = await connection.getNonce({ pubkey: identity.pubkey });
  const signed = await profile.signTransaction(identity, sendTx, bnsCodec, nonce);
  const response = await connection.postTx(bnsCodec.bytesToPost(signed));
  await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
}

export function matchId(id: SwapId): (swap: AtomicSwap) => boolean {
  return s => swapIdEquals(id, s.data.id);
}

export function serializeBnsSwapId(id: SwapId): string {
  return toHex(id.data);
}

export async function openSwap(
  connection: BnsConnection,
  profile: UserProfile,
  identity: Identity,
  rcptAddr: Address,
  hash: Hash,
): Promise<PostTxResponse> {
  const senderAddress = identityToAddress(identity);
  // construct a swapOfferTx, sign and post to the chain
  const swapOfferTimeout = createTimestampTimeout(48 * 3600);
  const swapOfferTx = await connection.withDefaultFee<SwapOfferTransaction>(
    {
      kind: "bcp/swap_offer",
      chainId: identity.chainId,
      sender: senderAddress,
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
    },
    senderAddress,
  );
  const nonce = await connection.getNonce({ pubkey: identity.pubkey });
  const signed = await profile.signTransaction(identity, swapOfferTx, bnsCodec, nonce);
  const txBytes = bnsCodec.bytesToPost(signed);
  return connection.postTx(txBytes);
}

export async function claimSwap(
  connection: BnsConnection,
  profile: UserProfile,
  identity: Identity,
  swapId: SwapId,
  preimage: Preimage,
): Promise<PostTxResponse> {
  const address = bnsCodec.identityToAddress(identity);
  // construct a swapOfferTx, sign and post to the chain
  const swapClaimTx = await connection.withDefaultFee<SwapClaimTransaction>(
    {
      kind: "bcp/swap_claim",
      chainId: identity.chainId,
      swapId: swapId,
      preimage: preimage,
    },
    address,
  );
  const nonce = await connection.getNonce({ pubkey: identity.pubkey });
  const signed = await profile.signTransaction(identity, swapClaimTx, bnsCodec, nonce);
  const txBytes = bnsCodec.bytesToPost(signed);
  return connection.postTx(txBytes);
}
