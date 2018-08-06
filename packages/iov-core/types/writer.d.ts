import { Address, BcpTransactionResponse, IovReader, Nonce, TxCodec, UnsignedTransaction } from "@iov/bcp-types";
import { Client as BnsClient } from "@iov/bns";
import { UserProfile } from "@iov/keycontrol";
import { ChainId, PublicKeyBundle } from "@iov/tendermint-types";
export declare class IovWriter {
    readonly profile: UserProfile;
    private readonly knownChains;
    constructor(profile: UserProfile, knownChains: Iterable<[string, ChainConnector]>);
    chainIds(): ReadonlyArray<ChainId>;
    reader(chainId: ChainId): IovReader;
    addChain(connector: ChainConnector): Promise<void>;
    keyToAddress(chainId: ChainId, key: PublicKeyBundle): Address;
    getNonce(chainId: ChainId, addr: Address): Promise<Nonce>;
    signAndCommit(tx: UnsignedTransaction, keyring: number): Promise<BcpTransactionResponse>;
    private mustGet;
}
export interface ChainConnector {
    readonly client: IovReader;
    readonly codec: TxCodec;
}
export declare const bnsFromOrToTag: typeof BnsClient.fromOrToTag;
export declare const bnsConnector: (url: string) => Promise<ChainConnector>;
export declare const withConnectors: (...connectors: ChainConnector[]) => Promise<ReadonlyArray<[string, ChainConnector]>>;
