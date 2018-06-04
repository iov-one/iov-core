import { Algorithm, PublicKeyBundle, SignatureString } from "../types/keys";
import {
  FullSignature,
  PostableBytes,
  SignableBytes,
  SignableTransaction,
  TransactionIDString,
  TxCodec
} from "../types/signables";
import { Nonce } from "../types/transactions";

import { publicKeyBytes } from "./keys";
import { sendTx } from "./transactions";

export const signer: PublicKeyBundle = {
  algo: Algorithm.ED25519,
  data: publicKeyBytes
};

export const fullSignature: FullSignature = {
  nonce: 1234 as Nonce,
  publicKey: signer,
  signature: "deadbeef00cafe00" as SignatureString
};

export const signableTransaction = (): SignableTransaction => ({
  codec: encoder,
  signatures: [fullSignature],
  transaction: sendTx
});

export const encoder: TxCodec = {
  bytesToPost: () => (Buffer.from("1234") as Uint8Array) as PostableBytes,
  bytesToSign: () => (Buffer.from("1234") as Uint8Array) as SignableBytes,
  identifier: () => "1234" as TransactionIDString,
  parseBytes: () => signableTransaction()
};
