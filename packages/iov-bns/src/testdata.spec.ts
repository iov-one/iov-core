import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  FullSignature,
  Hash,
  Nonce,
  Preimage,
  PubkeyBundle,
  PubkeyBytes,
  SendTransaction,
  SignatureBytes,
  SignedTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapIdBytes,
  SwapOfferTransaction,
  TokenTicker,
} from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import data from "./testdata/bnsd.json";
import { PrivkeyBundle, PrivkeyBytes } from "./types";

const { fromHex } = Encoding;

export const pubJson: PubkeyBundle = {
  algo: Algorithm.Ed25519,
  data: fromHex(data.pubkey.ed25519_raw) as PubkeyBytes,
};

export const pubBin = fromHex(data.pubkey.bin);

// this private key matches the above public key
export const privJson: PrivkeyBundle = {
  algo: Algorithm.Ed25519,
  data: fromHex(data.privkey.ed25519_raw) as PrivkeyBytes,
};

export const privBin = fromHex(data.privkey.bin);

// address is calculated by bov for the public key
// this address is displayed on testgen, or can be read from the message
// address generated using https://github.com/nym-zone/bech32
export const address = data.address as Address;

export const coinJson: Amount = {
  quantity: data.coin.quantity,
  fractionalDigits: 9,
  tokenTicker: data.coin.ticker as TokenTicker,
};

export const coinBin = fromHex(data.coin.bin);

export const chainId = "test-123" as ChainId;

export const sendTxJson: SendTransaction = {
  kind: "bcp/send",
  chainId: chainId,
  sender: data.unsigned_tx.sender as Address,
  recipient: data.unsigned_tx.recipient as Address,
  memo: data.unsigned_tx.memo,
  amount: {
    quantity: data.unsigned_tx.amount.quantity,
    fractionalDigits: 9,
    tokenTicker: data.unsigned_tx.amount.ticker as TokenTicker,
  },
};

export const sendTxBin = fromHex(data.unsigned_tx.bin);

/** The sha512 of the serialized transaction (ready to be signed) */
export const sendTxSignBytes = fromHex(data.unsigned_tx.signbytes);

export const signedTxSig: FullSignature = {
  nonce: Number(data.signed_tx.sig.nonce) as Nonce,
  pubkey: pubJson,
  signature: fromHex(data.signed_tx.sig.ed25519_raw) as SignatureBytes,
};

export const signedTxJson: SignedTransaction = {
  transaction: sendTxJson,
  primarySignature: signedTxSig,
  otherSignatures: [],
};

export const signedTxBin = fromHex(data.signed_tx.bin);

// ------------------- random data --------------------------
//
// the below items are just randomly generated to ensure encode/decode
// pairs don't lose any data. not tied to actual bov formats (yet)

// randomTxJson has lots of data, not even valid signatures,
// but we just want to ensure that all fields can be writen and
// read back the same
const sig2: FullSignature = {
  nonce: 18 as Nonce,
  pubkey: pubJson,
  signature: fromHex(
    "baddad00cafe00bece8675da9d005f2018b69820673d57f5500ae2728d3e5012a44c786133cd911cc40761cda9ccf9094c1bbe1dc11f2d568cc4998072819a0c",
  ) as SignatureBytes,
};

// recipient address generated using https://github.com/nym-zone/bech32
// bech32 -e -h tiov 009985cb38847474fe9febfd56ab67e14bcd56f3
const randomMsg: SendTransaction = {
  chainId: "foo-bar-baz" as ChainId,
  kind: "bcp/send",
  sender: data.address as Address,
  recipient: "tiov1qzvctjecs368fl5la074d2m8u99u64hn8q7kyn" as Address,
  memo: "One more fix!",
  amount: {
    quantity: "128079890911",
    fractionalDigits: 9,
    tokenTicker: "FOO" as TokenTicker,
  },
  fee: {
    tokens: {
      quantity: "5432",
      fractionalDigits: 9,
      tokenTicker: "PSQL" as TokenTicker,
    },
    payer: address,
  },
};

export const randomTxJson: SignedTransaction = {
  transaction: randomMsg,
  primarySignature: signedTxSig,
  otherSignatures: [sig2],
};

// recipient address generated using https://github.com/nym-zone/bech32
// bech32 -e -h tiov 123485cb38847474fe9febfd56ab67e14bcd56f3
const swapOfferTransaction: SwapOfferTransaction = {
  chainId: "swap-a-doo" as ChainId,
  kind: "bcp/swap_offer",
  sender: address,
  recipient: "tiov1zg6gtjecs368fl5la074d2m8u99u64hnhhlprg" as Address,
  timeout: { timestamp: 1601234567 },
  amounts: [
    {
      quantity: "128079890911",
      fractionalDigits: 9,
      tokenTicker: "FOO" as TokenTicker,
    },
  ],
  hash: fromHex("0000001111111122334455aabbccddee0000001111111122334455aabbccddee") as Hash,
};

export const swapOfferTxJson: SignedTransaction = {
  transaction: swapOfferTransaction,
  primarySignature: sig2,
  otherSignatures: [],
};

const swapClaimMsg: SwapClaimTransaction = {
  chainId: "swap-a-doo" as ChainId,
  kind: "bcp/swap_claim",
  preimage: fromHex("00000000fffffffffff000000000") as Preimage,
  swapId: {
    data: fromHex("1234") as SwapIdBytes,
  },
};

export const swapClaimTxJson: SignedTransaction = {
  transaction: swapClaimMsg,
  primarySignature: sig2,
  otherSignatures: [],
};

const swapAbort: SwapAbortTransaction = {
  chainId: "swap-a-doo" as ChainId,
  kind: "bcp/swap_abort",
  swapId: {
    data: fromHex("1234") as SwapIdBytes,
  },
};
export const swapAbortTxJson: SignedTransaction = {
  transaction: swapAbort,
  primarySignature: signedTxSig,
  otherSignatures: [],
};
