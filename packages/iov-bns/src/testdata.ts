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
  algo: Algorithm.Ed25519,
  data: fromHex("507629b5f1d3946efb8fde961e146359e33610fa1536185d44fdd5011ca011d5") as PublicKeyBytes,
};
export const pubBin = fromHex("0a20507629b5f1d3946efb8fde961e146359e33610fa1536185d44fdd5011ca011d5");

// this private key matches the above public key
export const privJson: PrivateKeyBundle = {
  algo: Algorithm.Ed25519,
  data: fromHex(
    "516e6af7454f31fa56a43d112ea847c7e5aeea754f08385ca55935757161ad96507629b5f1d3946efb8fde961e146359e33610fa1536185d44fdd5011ca011d5",
  ) as PrivateKeyBytes,
};
export const privBin = fromHex(
  "0a40516e6af7454f31fa56a43d112ea847c7e5aeea754f08385ca55935757161ad96507629b5f1d3946efb8fde961e146359e33610fa1536185d44fdd5011ca011d5",
);

// address is calculated by bov for the public key
export const address = "ACC00B8F2E26FD093894C5B1D87E03AFAB71CF99" as Address;

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
  kind: TransactionKind.Send,
  recipient: "6F0A3E37845B6A3C8CCBE6219199ABC3AE0B26D9" as Address,
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
    "8005d615d1866b8349b8fe1901444b5f76cfd39482d51556066e5de4a281b0394aa2bc9e07580d0a67fd36183b47f2f1b044c0ce459140f493c6e95546715003",
  ) as SignatureBytes,
};
export const signedTxJson: SignedTransaction = {
  transaction: sendTxJson,
  primarySignature: sig,
  otherSignatures: [],
};
export const signedTxBin = fromHex(
  "0a440a14acc00b8f2e26fd093894c5b1d87e03afab71cf9912146f0a3e37845b6a3c8ccbe6219199abc3ae0b26d91a0808fa011a03455448220c54657374207061796d656e74aa016a081112220a20507629b5f1d3946efb8fde961e146359e33610fa1536185d44fdd5011ca011d522420a408005d615d1866b8349b8fe1901444b5f76cfd39482d51556066e5de4a281b0394aa2bc9e07580d0a67fd36183b47f2f1b044c0ce459140f493c6e95546715003",
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
  kind: TransactionKind.Send,
  recipient: "009985CB38847474FE9FEBFD56AB67E14BCD56F3" as Address,
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
  kind: TransactionKind.SetName,
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
  kind: TransactionKind.SwapCounter,
  recipient: "123485CB38847474FE9FEBFD56AB67E14BCD56F3" as Address,
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
  kind: TransactionKind.SwapClaim,
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
  kind: TransactionKind.SwapTimeout,
  swapId: fromHex("1234") as SwapIdBytes,
};
export const swapTimeoutTxJson: SignedTransaction = {
  transaction: swapTimeoutMsg,
  primarySignature: sig,
  otherSignatures: [],
};
