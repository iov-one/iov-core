import { Client as BnsClient } from "@iov/bns";
import { UserProfile } from "@iov/keycontrol";
import { ChainId, PublicKeyBundle } from "@iov/tendermint-types";
import { Address, BcpTransactionResponse, Nonce, TxCodec, UnsignedTransaction, Web4Read } from "@iov/types";
export declare class Web4Write {
    readonly profile: UserProfile;
    private readonly knownChains;
    constructor(profile: UserProfile, knownChains: Iterable<[string, ChainConnector]>);
    chainIds(): ReadonlyArray<ChainId>;
    reader(chainId: ChainId): Web4Read;
    addChain(connector: ChainConnector): Promise<void>;
    keyToAddress(chainId: ChainId, key: PublicKeyBundle): Address;
    getNonce(chainId: ChainId, addr: Address): Promise<Nonce>;
    signAndCommit(tx: UnsignedTransaction, keyring: number): Promise<BcpTransactionResponse>;
    private mustGet;
}
export interface ChainConnector {
    readonly client: Web4Read;
    readonly codec: TxCodec;
}
export declare const bnsFromOrToTag: typeof BnsClient.fromOrToTag;
export declare const bnsConnector: (url: string) => Promise<ChainConnector>;
export declare const withConnectors: (...connectors: ChainConnector[]) => Promise<ReadonlyArray<[string, ChainConnector]>>;
