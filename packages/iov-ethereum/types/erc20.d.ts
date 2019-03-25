import BN = require("bn.js");
import { Address } from "@iov/bcp";
export interface EthereumRpcClient {
    readonly ethCall: (to: Address, data: Uint8Array) => Promise<Uint8Array>;
}
export interface Erc20Options {
    readonly contractAddress: Address;
    /** Override on-chain symbol. Use this of contract does not define value on-chain */
    readonly symbol?: string;
    /** Override on-chain name. Use this of contract does not define value on-chain */
    readonly name?: string;
    /** Override on-chain decimals. Use this of contract does not define value on-chain */
    readonly decimals?: number;
}
export declare class Erc20 {
    private readonly client;
    private readonly options;
    constructor(client: EthereumRpcClient, options: Erc20Options);
    totalSupply(): Promise<BN>;
    balanceOf(address: Address): Promise<BN>;
    name(): Promise<string>;
    symbol(): Promise<string>;
    decimals(): Promise<number>;
}
