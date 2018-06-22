import Long from "long";

import { Algorithm, PublicKeyBundle } from "../types/keys";
import {
  ChainId,
  Nonce,
  SendTx,
  TokenTicker,
  TransactionKind,
  TTLBytes,
  TTLString,
  UnsignedTransaction,
} from "../types/transactions";
import { addressBytes, publicKeyBytes } from "./keys";

export const nonce: Nonce = Long.fromNumber(123) as Nonce;

export const iov: TokenTicker = "IOV" as TokenTicker;

export const sender: PublicKeyBundle = {
  algo: Algorithm.ED25519,
  data: publicKeyBytes,
};

export const sendTx: SendTx = {
  amount: { whole: 123, fractional: 0, tokenTicker: iov },
  chainId: "bns-testnet-01" as ChainId,
  fee: { whole: 0, fractional: 100, tokenTicker: iov },
  kind: TransactionKind.SEND,
  recipient: addressBytes,
  signer: sender,
};

export const transaction: UnsignedTransaction = sendTx;

export const ttlBytes: TTLBytes = new Uint8Array([0, 2, 0, 0]) as TTLBytes;
export const ttlString: TTLString = "1000" as TTLString;
