import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  FullSignature,
  Nonce,
  PublicKeyBundle,
  PublicKeyBytes,
  SendTransaction,
  SignatureBytes,
  SignedTransaction,
  SwapClaimTransaction,
  SwapCounterTransaction,
  SwapIdBytes,
  SwapTimeoutTransaction,
  TokenTicker,
} from "@iov/bcp-types";
import { Encoding, Int53 } from "@iov/encoding";

import { PrivateKeyBundle, PrivateKeyBytes } from "./types";
import { hashId } from "./util";

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
  data: fromHex("7996441cee44893159bb3ad57d78c481da3247bcfa3fabafe3fab44c4f568af9") as PublicKeyBytes,
};
// ./scripts/tohex testvectors/pub_key.bin
export const pubBin = fromHex("200a7996441cee44893159bb3ad57d78c481da3247bcfa3fabafe3fab44c4f568af9");

// this private key matches the above public key
// ./scripts/jsonbytes testvectors/priv_key.json .Priv.Ed25519
export const privJson: PrivateKeyBundle = {
  algo: Algorithm.Ed25519,
  data: fromHex(
    "ce1e40bbcd30b2efa7f3a9264c5f71a1eb72e337bdc7fcba5a0066d322e7f3c27996441cee44893159bb3ad57d78c481da3247bcfa3fabafe3fab44c4f568af9",
  ) as PrivateKeyBytes,
};
// ./scripts/tohex testvectors/priv_key.bin
export const privBin = fromHex(
  "400ace1e40bbcd30b2efa7f3a9264c5f71a1eb72e337bdc7fcba5a0066d322e7f3c27996441cee44893159bb3ad57d78c481da3247bcfa3fabafe3fab44c4f568af9",
);

// address is calculated by bov for the public key
// this address is displayed on testgen, or can be read from the message
// address generated using https://github.com/nym-zone/bech32
// ADDR=$(./scripts/jsonbytes testvectors/unsigned_tx.json .Sum.SendMsg.src)
// bech32 -e -h tiov $ADDR
export const address = "tiov1qsccxrdr5fkzcp7wa5qc2k3ws6urmvvfyg68wx" as Address;

// TODO??? where is this from????
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
export const sendTxJson: SendTransaction = {
  kind: "bcp/send",
  creator: {
    chainId: chainId,
    pubkey: pubJson,
  },
  recipient: "tiov1zqrjl3gvpt3q5akd5vrhmtqjnftecmfcttydsx" as Address,
  memo: "Test payment",
  amount,
};
export const sendTxBin = fromHex(
  "039a0a4431140d04a2832ca3ce6c01075aed86853d2e89b812b10714c5100a2f0a0ccde20776aca39a7d9c1238571a6d080801fa031a54452248540c7365207461706d796e650074",
);
// from unsigned_tx.signbytes
export const signBytes = fromHex(
  "e0c9127d1ead2c22c9927363fb156a35faead3d201a9af253ac7679938ecfb212a0d1678925c64b87eefba065649a14d98005cdbc7bfee9e6e40831e08bd0f61",
);

// from signed_tx.{json,bin}
export const sig: FullSignature = {
  nonce: new Int53(17) as Nonce,
  pubkey: pubJson,
  // ./scripts/jsonbytes testvectors/signed_tx.json .signatures[0].signature.Sig.Ed25519
  signature: fromHex(
    "332133b9823bc1e7ebd9e41521f3656402d56353c02563fc473697f0d43d03a3d42a69c3af6b8b3cac071fc1146f7c67d82b46981b803c60b8849022548b07b0",
  ) as SignatureBytes,
};
export const signedTxJson: SignedTransaction = {
  transaction: sendTxJson,
  primarySignature: sig,
  otherSignatures: [],
};
export const signedTxBin = fromHex(
  "6a1211082212200a2fbe28f8eda07015de4b1a2baac3e2c4431c3f6986c5973315c672cff198f9934222400a332133b9823bc1e7ebd9e41521f3656402d56353c02563fc473697f0d43d03a3d42a69c3af6b8b3cac071fc1146f7c67d82b46981b803c60b8849022548b07b0039a0a4431140d04a2832ca3ce6c01075aed86853d2e89b812b10714c5100a2f0a0ccde20776aca39a7d9c1238571a6d080801fa031a54452248540c7365207461706d796e650074",
);

// ------------------- random data --------------------------
//
// the below items are just randomly generated to ensure encode/decode
// pairs don't lose any data. not tied to actual bov formats (yet)

// randomTxJson has lots of data, not even valid signatures,
// but we just want to ensure that all fields can be writen and
// read back the same
const sig2: FullSignature = {
  nonce: new Int53(18) as Nonce,
  pubkey: pubJson,
  signature: fromHex(
    "baddad00cafe00bece8675da9d005f2018b69820673d57f5500ae2728d3e5012a44c786133cd911cc40761cda9ccf9094c1bbe1dc11f2d568cc4998072819a0c",
  ) as SignatureBytes,
};
// recipient address generated using https://github.com/nym-zone/bech32
// bech32 -e -h tiov 009985cb38847474fe9febfd56ab67e14bcd56f3
const randomMsg: SendTransaction = {
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
    quantity: "5432",
    fractionalDigits: 9,
    tokenTicker: "PSQL" as TokenTicker,
  },
};
export const randomTxJson: SignedTransaction = {
  transaction: randomMsg,
  primarySignature: sig,
  otherSignatures: [sig2],
};

export const hashCode = Uint8Array.from([...hashId, ...fromHex("1122334455aabbccddee")]);
// recipient address generated using https://github.com/nym-zone/bech32
// bech32 -e -h tiov 123485cb38847474fe9febfd56ab67e14bcd56f3
const swapCounterMsg: SwapCounterTransaction = {
  creator: {
    chainId: "swap-a-doo" as ChainId,
    pubkey: pubJson,
  },
  kind: "bcp/swap_counter",
  recipient: "tiov1zg6gtjecs368fl5la074d2m8u99u64hnhhlprg" as Address,
  timeout: 7890,
  amount: [
    {
      quantity: "128079890911",
      fractionalDigits: 9,
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

const swapClaimMsg: SwapClaimTransaction = {
  creator: {
    chainId: "swap-a-doo" as ChainId,
    pubkey: pubJson,
  },
  kind: "bcp/swap_claim",
  preimage: fromHex("00000000fffffffffff000000000"),
  swapId: fromHex("1234") as SwapIdBytes,
};
export const swapClaimTxJson: SignedTransaction = {
  transaction: swapClaimMsg,
  primarySignature: sig2,
  otherSignatures: [],
};

const swapTimeoutMsg: SwapTimeoutTransaction = {
  creator: {
    chainId: "swap-a-doo" as ChainId,
    pubkey: pubJson,
  },
  kind: "bcp/swap_timeout",
  swapId: fromHex("1234") as SwapIdBytes,
};
export const swapTimeoutTxJson: SignedTransaction = {
  transaction: swapTimeoutMsg,
  primarySignature: sig,
  otherSignatures: [],
};
