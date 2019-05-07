import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  FullSignature,
  Hash,
  Nonce,
  Preimage,
  PublicKeyBundle,
  PublicKeyBytes,
  SendTransaction,
  SignatureBytes,
  SignedTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapIdBytes,
  SwapOfferTransaction,
  TokenTicker,
  WithCreator,
} from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import { PrivateKeyBundle, PrivateKeyBytes } from "./types";

const { fromHex } = Encoding;

// ------------------- standard data set ---------------
//
// This info came from `bnsd testgen <dir>`.
// That dumped a number of files in a directory, formatted as the
// bov blockchain application desires. We import them as strings
// in this testfile to allow simpler tests in the browser as well.

// Ex: base64 (from json) -> hex
// ../scripts/jsonbytes testvectors/pub_key.json .Pub.Ed25519

// Ex: bin file -> hex
// ../scripts/tohex testvectors/pub_key.bin
// OR
// cat testvectors/pub_key.bin | ../scripts/tohex

// ./scripts/jsonbytes testvectors/pub_key.json .Pub.Ed25519
export const pubJson: PublicKeyBundle = {
  algo: Algorithm.Ed25519,
  data: fromHex("d9046fd4355b366f33619be7ceb27728441ff11b347976b1378c5d7f8fe4d91e") as PublicKeyBytes,
};
// ./scripts/tohex testvectors/pub_key.bin
export const pubBin = fromHex("0a20d9046fd4355b366f33619be7ceb27728441ff11b347976b1378c5d7f8fe4d91e");

// this private key matches the above public key
// ./scripts/jsonbytes testvectors/priv_key.json .Priv.Ed25519
export const privJson: PrivateKeyBundle = {
  algo: Algorithm.Ed25519,
  data: fromHex(
    "bc1c072063d5099639190cefbd25284d56f722c1b2eacfc1dff0edeee558c637d9046fd4355b366f33619be7ceb27728441ff11b347976b1378c5d7f8fe4d91e",
  ) as PrivateKeyBytes,
};
// ./scripts/tohex testvectors/priv_key.bin
export const privBin = fromHex(
  "0a40bc1c072063d5099639190cefbd25284d56f722c1b2eacfc1dff0edeee558c637d9046fd4355b366f33619be7ceb27728441ff11b347976b1378c5d7f8fe4d91e",
);

// address is calculated by bov for the public key
// this address is displayed on testgen, or can be read from the message
// address generated using https://github.com/nym-zone/bech32
// ADDR=$(./scripts/jsonbytes testvectors/unsigned_tx.json .Sum.SendMsg.src)
// bech32 -e -h tiov $ADDR
export const address = "tiov1mkp7tg2qvyp6m3uttw44ju9dhjzk6mdgzcz6yf" as Address;

export const coinJson: Amount = {
  quantity: "878001567000",
  fractionalDigits: 9,
  tokenTicker: "IOV" as TokenTicker,
};
export const coinBin = fromHex("08ee061098d25f1a03494f56");

// from: unsigned_tx.{json,bin}
const amount: Amount = {
  quantity: "250000000000",
  fractionalDigits: 9,
  tokenTicker: "ETH" as TokenTicker,
};
export const chainId = "test-123" as ChainId;

// the sender in this tx is the above pubkey, pubkey->address should match
// recipient address generated using https://github.com/nym-zone/bech32
// RCPT=$(./scripts/jsonbytes testvectors/unsigned_tx.json .Sum.SendMsg.dest)
// bech32 -e -h tiov $RCPT
export const sendTxJson: SendTransaction & WithCreator = {
  kind: "bcp/send",
  creator: {
    chainId: chainId,
    pubkey: pubJson,
  },
  recipient: "tiov1hl846c5pqgaqnp0kje64rx5axj8t2fvqxunqaf" as Address,
  memo: "Test payment",
  amount: amount,
};
// ./scripts/tohex testvectors/unsigned_tx.bin
export const sendTxBin = fromHex(
  "9a03440a14dd83e5a1406103adc78b5bab5970adbc856d6da81214bfcf5d6281023a0985f69675519a9d348eb525801a0808fa011a03455448220c54657374207061796d656e74",
);
// ./scripts/tohex testvectors/unsigned_tx.signbytes
// this is the sha-512 digest of the sign bytes (ready for signature)
export const signBytes = fromHex(
  "eeaef384712ec65e82cde2a126aa4d1950a3b89957da5e8b54d9a21343eb90dcba28122400b358bd8ed577e2d3017be21e249fb7f880870b09d620fe7bcb7dd2",
);

// from signed_tx.json
export const sig: FullSignature = {
  nonce: 17 as Nonce,
  pubkey: pubJson,
  // ./scripts/jsonbytes testvectors/signed_tx.json .signatures[0].signature.Sig.Ed25519
  signature: fromHex(
    "54376d9b806f41976ba87fc850ebd8654f1d75860dec6251741f4df11aed6de8774429cf3ec432cd5e5527f2df6542198043a3fa839ba99cdf1c754b6668c70d",
  ) as SignatureBytes,
};
export const signedTxJson: SignedTransaction = {
  transaction: sendTxJson,
  primarySignature: sig,
  otherSignatures: [],
};
// ./scripts/tohex testvectors/signed_tx.bin
export const signedTxBin = fromHex(
  "126a081112220a20d9046fd4355b366f33619be7ceb27728441ff11b347976b1378c5d7f8fe4d91e22420a4054376d9b806f41976ba87fc850ebd8654f1d75860dec6251741f4df11aed6de8774429cf3ec432cd5e5527f2df6542198043a3fa839ba99cdf1c754b6668c70d9a03440a14dd83e5a1406103adc78b5bab5970adbc856d6da81214bfcf5d6281023a0985f69675519a9d348eb525801a0808fa011a03455448220c54657374207061796d656e74",
);

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
const randomMsg: SendTransaction & WithCreator = {
  creator: {
    chainId: "foo-bar-baz" as ChainId,
    pubkey: pubJson,
  },
  kind: "bcp/send",
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
  },
};
export const randomTxJson: SignedTransaction = {
  transaction: randomMsg,
  primarySignature: sig,
  otherSignatures: [sig2],
};

// recipient address generated using https://github.com/nym-zone/bech32
// bech32 -e -h tiov 123485cb38847474fe9febfd56ab67e14bcd56f3
const swapOfferTransaction: SwapOfferTransaction & WithCreator = {
  creator: {
    chainId: "swap-a-doo" as ChainId,
    pubkey: pubJson,
  },
  kind: "bcp/swap_offer",
  recipient: "tiov1zg6gtjecs368fl5la074d2m8u99u64hnhhlprg" as Address,
  timeout: { timestamp: 1601234567 },
  amounts: [
    {
      quantity: "128079890911",
      fractionalDigits: 9,
      tokenTicker: "FOO" as TokenTicker,
    },
  ],
  hash: fromHex("1122334455aabbccddee") as Hash,
};

export const swapOfferTxJson: SignedTransaction = {
  transaction: swapOfferTransaction,
  primarySignature: sig2,
  otherSignatures: [],
};

const swapClaimMsg: SwapClaimTransaction & WithCreator = {
  creator: {
    chainId: "swap-a-doo" as ChainId,
    pubkey: pubJson,
  },
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

const swapAbort: SwapAbortTransaction & WithCreator = {
  creator: {
    chainId: "swap-a-doo" as ChainId,
    pubkey: pubJson,
  },
  kind: "bcp/swap_abort",
  swapId: {
    data: fromHex("1234") as SwapIdBytes,
  },
};
export const swapAbortTxJson: SignedTransaction = {
  transaction: swapAbort,
  primarySignature: sig,
  otherSignatures: [],
};
