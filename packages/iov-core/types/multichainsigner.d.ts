import { Address, BcpConnection, BcpTransactionResponse, ChainConnector, Nonce, UnsignedTransaction } from "@iov/bcp-types";
import { UserProfile, WalletId } from "@iov/keycontrol";
import { ChainId, PublicKeyBundle } from "@iov/tendermint-types";
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
    getNonce(chainId: ChainId, addr: Address): Promise<Nonce>;
    signAndCommit(tx: UnsignedTransaction, walletId: WalletId): Promise<BcpTransactionResponse>;
    /**
     * Throws for unknown chain ID
     */
    private getChain;
}
