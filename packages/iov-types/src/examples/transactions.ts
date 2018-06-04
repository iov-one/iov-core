import { Algorithm, PublicKey, PublicKeyString } from "../types/keys";
import {
  ChainID,
  Nonce,
  SendTx,
  TokenTicker,
  Transaction,
  TTLBuffer,
  TTLString
} from "../types/transactions";

export const nonce: Nonce = 123 as Nonce;

export const iov: TokenTicker = "IOV" as TokenTicker;

export const sender: PublicKey = {
  algo: Algorithm.ED25519,
  data: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString
};

export const rcpt: PublicKey = {
  algo: Algorithm.SECP256K1,
  data: "a5bdf5841d9c56d6d975c1ab56ba569c3e367aafa2f9e2ce3dc518eab2594b77" as PublicKeyString
};

export const sendTx: SendTx = {
  amount: { whole: 123, fractional: 0, tokenTicker: iov },
  chainId: "bns-testnet-01" as ChainID,
  fee: { whole: 0, fractional: 100, tokenTicker: iov },
  kind: "send",
  recipient: rcpt,
  signer: sender
};

export const transaction: Transaction = sendTx;

export const ttlBuffer: TTLBuffer = new Uint8Array([0, 2, 0, 0]) as TTLBuffer;
export const ttlString: TTLString = "1000" as TTLString;
