import Long from "long";

import {
  Address,
  FullSignature,
  FungibleToken,
  Nonce,
  SendTx,
  SetNameTx,
  SignedTransaction,
  SwapClaimTx,
  SwapCounterTx,
  SwapIdBytes,
  SwapTimeoutTx,
  TokenTicker,
  TransactionKind,
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import {
  Algorithm,
  ChainId,
  PrivateKeyBundle,
  PrivateKeyBytes,
  PublicKeyBundle,
  PublicKeyBytes,
  SignatureBytes,
} from "@iov/tendermint-types";

import { hashId } from "./util";

const { fromHex } = Encoding;

// ------------------- standard data set ---------------
//
// This info came from `bov testgen <dir>`.
// That dumped a number of files in a directory, formatted as the
// bov blockchain application desires. We import them as strings
// in this testfile to allow simpler tests in the browser as well.

export const pubJson: PublicKeyBundle = {
  algo: Algorithm.ED25519,
  data: fromHex("507629b5f1d3946efb8fde961e146359e33610fa1536185d44fdd5011ca011d5") as PublicKeyBytes,
};
export const pubBin = fromHex("0a20507629b5f1d3946efb8fde961e146359e33610fa1536185d44fdd5011ca011d5");

// this private key matches the above public key
export const privJson: PrivateKeyBundle = {
  algo: Algorithm.ED25519,
  data: fromHex(
    "516e6af7454f31fa56a43d112ea847c7e5aeea754f08385ca55935757161ad96507629b5f1d3946efb8fde961e146359e33610fa1536185d44fdd5011ca011d5",
  ) as PrivateKeyBytes,
};
export const privBin = fromHex(
  "0a40516e6af7454f31fa56a43d112ea847c7e5aeea754f08385ca55935757161ad96507629b5f1d3946efb8fde961e146359e33610fa1536185d44fdd5011ca011d5",
);

// address is calculated by bov for the public key
export const address = fromHex("acc00b8f2e26fd093894c5b1d87e03afab71cf99") as Address;

export const coinJson: FungibleToken = {
  whole: 878,
  fractional: 1567000,
  tokenTicker: "IOV" as TokenTicker,
};
export const coinBin = fromHex("08ee061098d25f1a03494f56");

const amount = {
  whole: 250,
  fractional: 0,
  tokenTicker: "ETH" as TokenTicker,
};
export const chainId = "test-123" as ChainId;
// the sender in this tx is the above pubkey, pubkey->address should match
export const sendTxJson: SendTx = {
  chainId,
  signer: pubJson,
  kind: TransactionKind.SEND,
  recipient: fromHex("6f0a3e37845b6a3c8ccbe6219199abc3ae0b26d9") as Address,
  memo: "Test payment",
  amount,
};
export const sendTxBin = fromHex(
  "0a440a14acc00b8f2e26fd093894c5b1d87e03afab71cf9912146f0a3e37845b6a3c8ccbe6219199abc3ae0b26d91a0808fa011a03455448220c54657374207061796d656e74",
);

export const signBytes = fromHex(
  "00cafe0008746573742d31323300000000000000110a440a14acc00b8f2e26fd093894c5b1d87e03afab71cf9912146f0a3e37845b6a3c8ccbe6219199abc3ae0b26d91a0808fa011a03455448220c54657374207061796d656e74",
);
export const sig: FullSignature = {
  nonce: Long.fromInt(17) as Nonce,
  publicKey: pubJson,
  signature: fromHex(
    "f838ecb02d960345fa101f1ecfa5acc18396d4e122cfb2f7f7af6b38e7318a4b2ddf7a5e5f5a214ed1c759780a2fe187c1c30effcfb4c6a0174e44133fe0630e",
  ) as SignatureBytes,
};
export const signedTxJson: SignedTransaction = {
  transaction: sendTxJson,
  primarySignature: sig,
  otherSignatures: [],
};
export const signedTxBin = fromHex(
  "0a440a14acc00b8f2e26fd093894c5b1d87e03afab71cf9912146f0a3e37845b6a3c8ccbe6219199abc3ae0b26d91a0808fa011a03455448220c54657374207061796d656e74aa016a081112220a20507629b5f1d3946efb8fde961e146359e33610fa1536185d44fdd5011ca011d522420a40f838ecb02d960345fa101f1ecfa5acc18396d4e122cfb2f7f7af6b38e7318a4b2ddf7a5e5f5a214ed1c759780a2fe187c1c30effcfb4c6a0174e44133fe0630e",
);

// ------------------- random data --------------------------
//
// the below items are just randomly generated to ensure encode/decode
// pairs don't lose any data. not tied to actual bov formats (yet)

// randomTxJson has lots of data, not even valid signatures,
// but we just want to ensure that all fields can be writen and
// read back the same
const sig2: FullSignature = {
  nonce: Long.fromInt(18) as Nonce,
  publicKey: pubJson,
  signature: fromHex(
    "baddad00cafe00bece8675da9d005f2018b69820673d57f5500ae2728d3e5012a44c786133cd911cc40761cda9ccf9094c1bbe1dc11f2d568cc4998072819a0c",
  ) as SignatureBytes,
};
const randomMsg: SendTx = {
  chainId: "foo-bar-baz" as ChainId,
  signer: pubJson,
  kind: TransactionKind.SEND,
  recipient: fromHex("009985cb38847474fe9febfd56ab67e14bcd56f3") as Address,
  memo: "One more fix!",
  amount: {
    whole: 128,
    fractional: 79890911,
    tokenTicker: "FOO" as TokenTicker,
  },
  fee: {
    whole: 0,
    fractional: 5432,
    tokenTicker: "PSQL" as TokenTicker,
  },
};
export const randomTxJson: SignedTransaction = {
  transaction: randomMsg,
  primarySignature: sig,
  otherSignatures: [sig2],
};

const setNameMsg: SetNameTx = {
  chainId: "bns-mainnet" as ChainId,
  signer: pubJson,
  kind: TransactionKind.SET_NAME,
  name: "king*iov.one",
};
export const setNameTxJson: SignedTransaction = {
  transaction: setNameMsg,
  primarySignature: sig,
  otherSignatures: [],
};

export const hashCode = Uint8Array.from([...hashId, ...fromHex("1122334455aabbccddee")]);
const swapCounterMsg: SwapCounterTx = {
  chainId: "swap-a-doo" as ChainId,
  signer: pubJson,
  kind: TransactionKind.SWAP_COUNTER,
  recipient: fromHex("123485cb38847474fe9febfd56ab67e14bcd56f3") as Address,
  timeout: 7890,
  amount: [
    {
      whole: 128,
      fractional: 79890911,
      tokenTicker: "FOO" as TokenTicker,
    },
  ],
  hashCode,
};
export const swapCounterTxJson: SignedTransaction = {
  transaction: swapCounterMsg,
  primarySignature: sig2,
  otherSignatures: [],
};

const swapClaimMsg: SwapClaimTx = {
  chainId: "swap-a-doo" as ChainId,
  signer: pubJson,
  kind: TransactionKind.SWAP_CLAIM,
  preimage: fromHex("00000000fffffffffff000000000"),
  swapId: fromHex("1234") as SwapIdBytes,
};
export const swapClaimTxJson: SignedTransaction = {
  transaction: swapClaimMsg,
  primarySignature: sig2,
  otherSignatures: [],
};

const swapTimeoutMsg: SwapTimeoutTx = {
  chainId: "swap-a-doo" as ChainId,
  signer: pubJson,
  kind: TransactionKind.SWAP_TIMEOUT,
  swapId: fromHex("1234") as SwapIdBytes,
};
export const swapTimeoutTxJson: SignedTransaction = {
  transaction: swapTimeoutMsg,
  primarySignature: sig,
  otherSignatures: [],
};
