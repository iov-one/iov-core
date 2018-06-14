import Long from "long";

import { Algorithm, PublicKeyBundle } from "../types/keys";
import {
  ChainID,
  Nonce,
  SendTx,
  TokenTicker,
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
  chainId: "bns-testnet-01" as ChainID,
  fee: { whole: 0, fractional: 100, tokenTicker: iov },
  kind: "send",
  recipient: addressBytes,
  signer: sender,
};

export const transaction: UnsignedTransaction = sendTx;

export const ttlBytes: TTLBytes = new Uint8Array([0, 2, 0, 0]) as TTLBytes;
export const ttlString: TTLString = "1000" as TTLString;
