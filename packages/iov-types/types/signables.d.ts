import { As } from "./as";
import { PublicKeyBundle, SignatureBytes } from "./keys";
import { Nonce, UnsignedTransaction } from "./transactions";

export type TransactionIDBytes = Uint8Array & As<"transaction-id">;
export type TransactionIDString = string & As<"transaction-id">;

export type SignableBytes = Uint8Array & As<"signable">;
export type SignableString = string & As<"signable">;

export type PostableBytes = Uint8Array & As<"postable">;
export type PostableString = string & As<"postable">;

// NB: use Buffer or String, we should be consistent....
// I figure string if this will be json dumped, but maybe less efficient
export interface FullSignature {
  readonly nonce: Nonce;
  readonly publicKey: PublicKeyBundle;
  readonly signature: SignatureBytes;
}

// A signable transaction knows how to serialize itself
// and how to store signatures
export interface SignedTransaction {
  // transaction is the user request
  readonly transaction: UnsignedTransaction;

  readonly primarySignature: FullSignature;

  // signatures can be appended as this is signed
  readonly otherSignatures: ReadonlyArray<FullSignature>;
}

// TxCodec knows how to convert Transactions to bytes for a given blockchain
export interface TxCodec {
  // these are the bytes we create to add a signature
  // they often include nonce and chainID, but not other signatures
  readonly bytesToSign: (tx: UnsignedTransaction, nonce: Nonce) => SignableBytes;
  // bytesToPost includes the raw transaction appended with the various signatures
  readonly bytesToPost: (tx: SignedTransaction) => PostableBytes;
  // identifier is usually some sort of hash of bytesToPost, chain-dependent
  readonly identifier: (tx: SignedTransaction) => TransactionIDBytes;
  // parseBytes will recover bytes from the blockchain into a format we can use
  readonly parseBytes: (bytes: PostableBytes) => SignedTransaction;
}
