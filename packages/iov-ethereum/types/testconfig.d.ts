import { ChainId } from "@iov/base-types";
import { Address, Nonce } from "@iov/bcp-types";
export interface EthereumNetworkConfig {
    readonly env: string;
    readonly base: string;
    readonly chainId: ChainId;
    readonly minHeight: number;
    readonly address: Address;
    readonly whole: number;
    readonly fractional: number;
    readonly nonce: Nonce;
}
export declare const TestConfig: EthereumNetworkConfig;
