import { ChainID, CurrencyCode, PublicKeyString, SendTx } from "@iov/types";

export const iov: CurrencyCode = "IOV" as CurrencyCode;

export const sendTx: SendTx = {
  amount: { whole: 123, fractional: 0, currency: iov },
  chainId: "bns-testnet-01" as ChainID,
  fee: { whole: 0, fractional: 100, currency: iov },
  kind: "send",
  recipient: "a5bdf5841d9c56d6d975c1ab56ba569c3e367aafa2f9e2ce3dc518eab2594b77" as PublicKeyString,
  signer: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString
};
