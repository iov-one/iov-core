import { Address, BcpConnection, ChainConnector, ChainId, Nonce, PostTxResponse, PublicKeyBundle, SignedTransaction, TxCodec, UnsignedTransaction } from "@iov/bcp-types";
import { PublicIdentity, WalletId } from "@iov/keycontrol";
/**
 * TransactionSigner is just the methods on `UserProfile` that we need in `MultiChainSigner`.
 * By only requiring this interface, we allow the use of other implementations with custom
 * logic for key derivation, etc.
 */
export interface Profile {
    readonly signTransaction: (id: WalletId, identity: PublicIdentity, transaction: UnsignedTransaction, codec: TxCodec, nonce: Nonce) => Promise<SignedTransaction>;
    readonly appendSignature: (id: WalletId, identity: PublicIdentity, originalTransaction: SignedTransaction, codec: TxCodec, nonce: Nonce) => Promise<SignedTransaction>;
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
    keyToAddress(chainId: ChainId, key: PublicKeyBundle): Address;
    /**
     * Queries the nonce, signs the transaction and posts it to the blockchain.
     *
     * The transaction signer is determined by the transaction content. A lookup for
     * the private key for the signer in the given wallet ID is done automatically.
     */
    signAndPost(tx: UnsignedTransaction, walletId: WalletId): Promise<PostTxResponse>;
    /**
     * Throws for unknown chain ID
     */
    private getChain;
}
