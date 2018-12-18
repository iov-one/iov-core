import { ChainId, PostableBytes, PublicKeyBundle } from "@iov/base-types";
import { Address, Nonce, SignedTransaction, SigningJob, TransactionId, UnsignedTransaction } from "./transactions";
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
    readonly identifier: (tx: SignedTransaction) => TransactionId;
}
