import { Address, BcpConnection, ChainConnector, ChainId, Nonce, PostTxResponse, PublicIdentity, SignedTransaction, TxCodec, UnsignedTransaction } from "@iov/bcp";
import { WalletId } from "@iov/keycontrol";
/**
 * TransactionSigner is just the methods on `UserProfile` that we need in `MultiChainSigner`.
 * By only requiring this interface, we allow the use of other implementations with custom
 * logic for key derivation, etc.
 */
export interface Profile {
    readonly signTransaction: (transaction: UnsignedTransaction, codec: TxCodec, nonce: Nonce) => Promise<SignedTransaction>;
    readonly appendSignature: (identity: PublicIdentity, originalTransaction: SignedTransaction, codec: TxCodec, nonce: Nonce) => Promise<SignedTransaction>;
}
export declare class MultiChainSigner {
    private readonly knownChains;
    private readonly profile;
    constructor(profile: Profile);
    chainIds(): ReadonlyArray<ChainId>;
    connection(chainId: ChainId): BcpConnection;
    /**
     * Connects to a chain using the provided connector.
     *
     * @returns an object of chain information, currently just a BcpConnection
     */
    addChain(connector: ChainConnector): Promise<{
        readonly connection: BcpConnection;
    }>;
    /**
     * Calculate an address in a blockchain-specific way
     */
    identityToAddress(identity: PublicIdentity): Address;
    /**
     * A chain-dependent validation of address
     */
    isValidAddress(chainId: ChainId, address: string): boolean;
    /**
     * Queries the nonce, signs the transaction and posts it to the blockchain.
     *
     * The transaction signer is determined by the transaction content. A lookup for
     * the private key for the signer in the given wallet ID is done automatically.
     */
    signAndPost(tx: UnsignedTransaction, _: WalletId): Promise<PostTxResponse>;
    /**
     * Call this to free ressources when signer is not needed anymore.
     * This disconnects all chains and other housekeeping if necessary.
     */
    shutdown(): void;
    /**
     * Throws for unknown chain ID
     */
    private getChain;
}
