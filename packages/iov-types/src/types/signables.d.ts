import { PublicKeyBundle, SignatureBytes } from "./keys";
import { Nonce, Transaction } from "./transactions";

declare const TransactionIDSymbol: unique symbol;
type TransactionID = typeof TransactionIDSymbol;
export type TransactionIDBytes = TransactionID & Uint8Array;
export type TransactionIDString = TransactionID & string;

declare const SignableSymbol: unique symbol;
type Signable = typeof SignableSymbol;
export type SignableBytes = Signable & Uint8Array;
export type SignableString = Signable & string;

declare const PostableSymbol: unique symbol;
type Postable = typeof PostableSymbol;
export type PostableBytes = Postable & Uint8Array;
export type PostableString = Postable & string;

// NB: use Buffer or String, we should be consistent....
// I figure string if this will be json dumped, but maybe less efficient
export interface FullSignature {
  readonly nonce: Nonce;
  readonly publicKey: PublicKeyBundle;
  readonly signature: SignatureBytes;
}

// A signable transaction knows how to serialize itself
// and how to store signatures
export interface SignableTransaction {
  // codec is assigned based on chainId
  readonly codec: TxCodec;
  // transaction is the user request
  readonly transaction: Transaction;
  // signatures can be appended as this is signed
  readonly signatures: ReadonlyArray<FullSignature>;
}

// TxCodec knows how to convert Transactions to bytes for a given blockchain
export interface TxCodec {
  // these are the bytes we create to add a signature
  // they often include nonce and chainID, but not other signatures
  readonly bytesToSign: (
    tx: SignableTransaction,
    nonce: Nonce
  ) => SignableBytes;
  // bytesToPost includes the raw transaction appended with the various signatures
  readonly bytesToPost: (tx: SignableTransaction) => PostableBytes;
  // identifier is usually some sort of hash of bytesToPost, chain-dependent
  readonly identifier: (tx: SignableTransaction) => TransactionIDBytes;
  // parseBytes will recover bytes from the blockchain into a format we can use
  readonly parseBytes: (bytes: PostableBytes) => SignableTransaction;
}
