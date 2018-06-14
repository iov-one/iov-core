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
  SignatureBytes,
  TokenTicker,
  TransactionKind,
} from "@iov/types";
import Long from "long";

const { fromHex } = Encoding;

/*
This info came from `bov testgen <dir>`.
That dumped a number of files in a directory, formatted as the
bov blockchain application desires. I import them as strings
in this testfile to allow simpler tests in the browser as well.
*/

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

export const sigs: ReadonlyArray<FullSignature> = [
  {
    nonce: Long.fromInt(17) as Nonce,
    publicKey: pubJson,
    signature: fromHex(
      "f52af3946c43a0bece8675da9d005f2018b69820673d57f5500ae2728d3e5012a44c786133cd911cc40761cda9ccf9094c1bbe1dc11f2d568cc4998072819a0c",
    ) as SignatureBytes,
  },
];
export const signedTxBin = fromHex(
  "0a440a14715d326689e88080afdfb22adf19394ceb8e90351214552385cb38847474fe9febfd56ab67e14bcd56f31a0808fa011a03455448220c54657374207061796d656e74aa016a081112220a201a1b68a2042ba64436282d1cacb1e91c0166ad2e967e2c0543c99f2230ee04b322420a40f52af3946c43a0bece8675da9d005f2018b69820673d57f5500ae2728d3e5012a44c786133cd911cc40761cda9ccf9094c1bbe1dc11f2d568cc4998072819a0c",
);
