import { Encoding } from "@iov/crypto";
import {
  AddressBytes,
  Algorithm,
  ChainID,
  FullSignature,
  FungibleToken,
  Nonce,
  PrivateKeyBundle,
  PrivateKeyBytes,
  PublicKeyBundle,
  PublicKeyBytes,
  SendTx,
  SetNameTx,
  SignatureBytes,
  SignedTransaction,
  SwapClaimTx,
  SwapCounterTx,
  SwapIDBytes,
  SwapTimeoutTx,
  TokenTicker,
  TransactionKind,
} from "@iov/types";
import Long from "long";

import { hashId } from "../src/util";

const { fromHex } = Encoding;

// ------------------- standard data set ---------------
//
// This info came from `bov testgen <dir>`.
// That dumped a number of files in a directory, formatted as the
// bov blockchain application desires. We import them as strings
// in this testfile to allow simpler tests in the browser as well.

export const pubJson: PublicKeyBundle = {
  algo: Algorithm.ED25519,
  data: fromHex("1a1b68a2042ba64436282d1cacb1e91c0166ad2e967e2c0543c99f2230ee04b3") as PublicKeyBytes,
};
export const pubBin = fromHex("0a201a1b68a2042ba64436282d1cacb1e91c0166ad2e967e2c0543c99f2230ee04b3");

// this private key matches the above public key
export const privJson: PrivateKeyBundle = {
  algo: Algorithm.ED25519,
  data: fromHex(
    "e404ff758df0c269c9105bc597351e7934339ef27dbf509b020eae68d8f8eace1a1b68a2042ba64436282d1cacb1e91c0166ad2e967e2c0543c99f2230ee04b3",
  ) as PrivateKeyBytes,
};
export const privBin = fromHex(
  "0a40e404ff758df0c269c9105bc597351e7934339ef27dbf509b020eae68d8f8eace1a1b68a2042ba64436282d1cacb1e91c0166ad2e967e2c0543c99f2230ee04b3",
);

// address is calculated by bov for the public key
export const address = fromHex("715d326689e88080afdfb22adf19394ceb8e9035") as AddressBytes;

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
export const chainId = "test-123" as ChainID;
// the sender in this tx is the above pubkey, pubkey->address should match
export const sendTxJson: SendTx = {
  chainId,
  signer: pubJson,
  kind: TransactionKind.SEND,
  recipient: fromHex("552385cb38847474fe9febfd56ab67e14bcd56f3") as AddressBytes,
  memo: "Test payment",
  amount,
};
export const sendTxBin = fromHex(
  "0a440a14715d326689e88080afdfb22adf19394ceb8e90351214552385cb38847474fe9febfd56ab67e14bcd56f31a0808fa011a03455448220c54657374207061796d656e74",
);

export const sig: FullSignature = {
  nonce: Long.fromInt(17) as Nonce,
  publicKey: pubJson,
  signature: fromHex(
    "f52af3946c43a0bece8675da9d005f2018b69820673d57f5500ae2728d3e5012a44c786133cd911cc40761cda9ccf9094c1bbe1dc11f2d568cc4998072819a0c",
  ) as SignatureBytes,
};
export const signedTxJson: SignedTransaction = {
  transaction: sendTxJson,
  primarySignature: sig,
  otherSignatures: [],
};
export const signedTxBin = fromHex(
  "0a440a14715d326689e88080afdfb22adf19394ceb8e90351214552385cb38847474fe9febfd56ab67e14bcd56f31a0808fa011a03455448220c54657374207061796d656e74aa016a081112220a201a1b68a2042ba64436282d1cacb1e91c0166ad2e967e2c0543c99f2230ee04b322420a40f52af3946c43a0bece8675da9d005f2018b69820673d57f5500ae2728d3e5012a44c786133cd911cc40761cda9ccf9094c1bbe1dc11f2d568cc4998072819a0c",
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
  chainId: "foo-bar-baz" as ChainID,
  signer: pubJson,
  kind: TransactionKind.SEND,
  recipient: fromHex("009985cb38847474fe9febfd56ab67e14bcd56f3") as AddressBytes,
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
  chainId: "bns-mainnet" as ChainID,
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
  chainId: "swap-a-doo" as ChainID,
  signer: pubJson,
  kind: TransactionKind.SWAP_COUNTER,
  recipient: fromHex("123485cb38847474fe9febfd56ab67e14bcd56f3") as AddressBytes,
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
  chainId: "swap-a-doo" as ChainID,
  signer: pubJson,
  kind: TransactionKind.SWAP_CLAIM,
  preimage: fromHex("00000000fffffffffff000000000"),
  swapId: fromHex("1234") as SwapIDBytes,
};
export const swapClaimTxJson: SignedTransaction = {
  transaction: swapClaimMsg,
  primarySignature: sig2,
  otherSignatures: [],
};

const swapTimeoutMsg: SwapTimeoutTx = {
  chainId: "swap-a-doo" as ChainID,
  signer: pubJson,
  kind: TransactionKind.SWAP_TIMEOUT,
  swapId: fromHex("1234") as SwapIDBytes,
};
export const swapTimeoutTxJson: SignedTransaction = {
  transaction: swapTimeoutMsg,
  primarySignature: sig,
  otherSignatures: [],
};
