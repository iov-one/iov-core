import { PublicKeyString, SignatureString } from "../types/keys";
import {
  FullSignature,
  PostableBuffer,
  SignableBuffer,
  SignableTransaction,
  TransactionIDString,
  TxCodec
} from "../types/signables";
import { NonceString } from "../types/transactions";

import { sendTx } from "./transactions";

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
