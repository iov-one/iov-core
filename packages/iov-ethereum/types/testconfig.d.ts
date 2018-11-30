import { ChainId, PublicKeyBytes } from "@iov/base-types";
import { Address, Nonce } from "@iov/bcp-types";
export interface EthereumNetworkConfig {
    readonly env: string;
    readonly base: string;
    readonly chainId: ChainId;
    readonly minHeight: number;
    readonly pubkey: PublicKeyBytes;
    readonly address: Address;
    readonly quantity: string;
    readonly nonce: Nonce;
    readonly gasPrice: string;
    readonly gasLimit: string;
}
export declare const TestConfig: EthereumNetworkConfig;
