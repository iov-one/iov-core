import { PublicKeyString, SignatureString } from "../keys";
import { NonceString } from "../transactions";
import { sendTx } from "../transactions/examples";
import {
  FullSignature,
  PostableBuffer,
  SignableBuffer,
  SignableTransaction,
  TransactionIDString,
  TxCodec
} from "./";

export const fullSignature: FullSignature = {
  nonce: "1234" as NonceString,
  publicKey: "abcd1234abcd1234" as PublicKeyString,
  signature: "deadbeef00cafe00" as SignatureString
};

export const signableTransaction = (): SignableTransaction => ({
  codec: encoder,
  signatures: [fullSignature],
  transaction: sendTx
});

export const encoder: TxCodec = {
  bytesToPost: () => (Buffer.from("1234") as Uint8Array) as PostableBuffer,
  bytesToSign: () => (Buffer.from("1234") as Uint8Array) as SignableBuffer,
  identifier: () => "1234" as TransactionIDString,
  parseBytes: () => signableTransaction()
};
