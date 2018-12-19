import { ChainId, PublicKeyBundle } from "@iov/base-types";
import { Address, BcpConnection, ChainConnector, Nonce, PostTxResponse, UnsignedTransaction } from "@iov/bcp-types";
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
     * Returns one value for the address, 0 if not found.
     *
     * This is done automatically when you use signAndPost().
     *
     * @deprecated will be removed in 0.11. See https://github.com/iov-one/iov-core/issues/620
     */
    getNonce(chainId: ChainId, addr: Address): Promise<Nonce>;
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
