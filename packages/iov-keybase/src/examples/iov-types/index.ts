import {
  AddressBytes,
  Algorithm,
  ChainID,
  PublicKeyBundle,
  PublicKeyBytes,
  SendTx,
  TokenTicker,
  TransactionKind,
} from "@iov/types";

const convertHexStringToUint8Array = (str: string): Uint8Array => {
  const buffer = Buffer.from(str, "hex");
  return Uint8Array.from(buffer);
};

export const iov: TokenTicker = "IOV" as TokenTicker;

const recipient: AddressBytes = convertHexStringToUint8Array(
  "a5bdf5841d9c56d6d975c1ab56ba569c",
) as AddressBytes;

const sender: PublicKeyBundle = {
  algo: Algorithm.ED25519,
  data: convertHexStringToUint8Array(
    "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352",
  ) as PublicKeyBytes,
};

export const sendTx: SendTx = {
  amount: { whole: 123, fractional: 0, tokenTicker: iov },
  chainId: "bns-testnet-01" as ChainID,
  fee: { whole: 0, fractional: 100, tokenTicker: iov },
  kind: TransactionKind.SEND,
  recipient,
  signer: sender,
};
