import { Address, BcpTransactionResponse, IovReader, Nonce, TxCodec, UnsignedTransaction } from "@iov/bcp-types";
import { Client as BnsClient } from "@iov/bns";
import { KeyringEntryId, UserProfile } from "@iov/keycontrol";
import { ChainId, PublicKeyBundle } from "@iov/tendermint-types";
export declare class IovWriter {
    readonly profile: UserProfile;
    private readonly knownChains;
    constructor(profile: UserProfile);
    chainIds(): ReadonlyArray<ChainId>;
    reader(chainId: ChainId): IovReader;
    addChain(connector: ChainConnector): Promise<void>;
    keyToAddress(chainId: ChainId, key: PublicKeyBundle): Address;
    getNonce(chainId: ChainId, addr: Address): Promise<Nonce>;
    signAndCommit(tx: UnsignedTransaction, keyring: number | KeyringEntryId): Promise<BcpTransactionResponse>;
    private getChain;
}
export interface ChainConnector {
    readonly client: () => Promise<IovReader>;
    readonly codec: TxCodec;
}
export interface ChainConnection {
    readonly chainId: ChainId;
    readonly client: IovReader;
    readonly codec: TxCodec;
}
export declare const bnsFromOrToTag: typeof BnsClient.fromOrToTag;
export declare const bnsConnector: (url: string) => ChainConnector;
