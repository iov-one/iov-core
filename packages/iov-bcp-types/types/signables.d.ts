import { As } from "type-tagger";
import { ChainId, PostableBytes, PublicKeyBundle, SignatureBytes } from "@iov/base-types";
import { Nonce, UnsignedTransaction } from "./transactions";
export declare type TransactionIdBytes = Uint8Array & As<"transaction-id">;
export declare type SignableBytes = Uint8Array & As<"signable">;
export declare enum PrehashType {
    None = 0,
    Sha512 = 1,
    Sha256 = 2,
    Keccak256 = 3
}
export interface SigningJob {
    readonly bytes: SignableBytes;
    readonly prehashType: PrehashType;
}
export interface FullSignature {
    readonly nonce: Nonce;
    readonly pubkey: PublicKeyBundle;
    readonly signature: SignatureBytes;
}
/** A signable transaction knows how to serialize itself and how to store signatures */
export interface SignedTransaction<T extends UnsignedTransaction = UnsignedTransaction> {
    /** transaction is the user request */
    readonly transaction: T;
    readonly primarySignature: FullSignature;
    /** signatures can be appended as this is signed */
    readonly otherSignatures: ReadonlyArray<FullSignature>;
}
/** A codec specific address encoded as a string */
export declare type Address = string & As<"address">;
export interface TxReadCodec {
    /** parseBytes will recover bytes from the blockchain into a format we can use */
    readonly parseBytes: (bytes: PostableBytes, chainId: ChainId) => SignedTransaction;
    /** chain-dependent way to calculate address from key */
    readonly keyToAddress: (key: PublicKeyBundle) => Address;
    /** chain-dependent validation of address */
    readonly isValidAddress: (address: string) => boolean;
}
/** TxCodec knows how to convert Transactions to bytes for a given blockchain */
export interface TxCodec extends TxReadCodec {
    /** these are the bytes we create to add a signature */
    /** they often include nonce and chainID, but not other signatures */
    readonly bytesToSign: (tx: UnsignedTransaction, nonce: Nonce) => SigningJob;
    /** bytesToPost includes the raw transaction appended with the various signatures */
    readonly bytesToPost: (tx: SignedTransaction) => PostableBytes;
    /** identifier is usually some sort of hash of bytesToPost, chain-dependent */
    readonly identifier: (tx: SignedTransaction) => TransactionIdBytes;
}
