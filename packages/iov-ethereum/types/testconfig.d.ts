import { ChainId } from "@iov/tendermint-types";
export interface EthereumNetworkConfig {
    readonly env: string;
    readonly base: string;
    readonly chainId: ChainId;
    readonly minHeight: number;
}
export declare const TestConfig: EthereumNetworkConfig;
