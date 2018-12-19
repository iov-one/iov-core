import { Address, BcpConnection, ChainConnector, ChainId, PostTxResponse, PublicKeyBundle, UnsignedTransaction } from "@iov/bcp-types";
import { UserProfile, WalletId } from "@iov/keycontrol";
export declare class MultiChainSigner {
    readonly profile: UserProfile;
    private readonly knownChains;
    constructor(profile: UserProfile);
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
