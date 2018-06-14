import Long from "long";

import { Algorithm, PublicKeyBundle } from "../types/keys";
import {
  FullSignature,
  PostableBytes,
  SignableBytes,
  SignedTransaction,
  TransactionIDBytes,
  TxCodec,
} from "../types/signables";
import { Nonce } from "../types/transactions";

import { publicKeyBytes, signatureBytes } from "./keys";
import { sendTx } from "./transactions";
import { convertHexStringToUint8Array } from "./utils";

export const signer: PublicKeyBundle = {
  algo: Algorithm.ED25519,
  data: publicKeyBytes,
};

export const fullSignature: FullSignature = {
  nonce: Long.fromNumber(1234) as Nonce,
  publicKey: signer,
  signature: signatureBytes,
};

export const signableTransaction: SignedTransaction = {
  otherSignatures: [],
  primarySignature: fullSignature,
  transaction: sendTx,
};

export const encoder: TxCodec = {
  bytesToPost: () => (Buffer.from("1234") as Uint8Array) as PostableBytes,
  bytesToSign: () => (Buffer.from("1234") as Uint8Array) as SignableBytes,
  identifier: () => convertHexStringToUint8Array("12345678") as TransactionIDBytes,
  parseBytes: () => signableTransaction,
};
