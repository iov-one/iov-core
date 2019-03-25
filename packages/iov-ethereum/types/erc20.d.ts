import BN = require("bn.js");
import { Address } from "@iov/bcp";
export interface EthereumRpcClient {
    readonly ethCall: (to: Address, data: Uint8Array) => Promise<Uint8Array>;
}
export interface Erc20Options {
    readonly contractAddress: Address;
    readonly hasSymbol: boolean;
    readonly hasName: boolean;
    readonly hasDecimals: boolean;
}
export declare class Erc20 {
    private readonly client;
    private readonly options;
    constructor(client: EthereumRpcClient, options: Erc20Options);
    totalSupply(): Promise<BN>;
    balanceOf(address: Address): Promise<BN>;
    /** optional, returns undefined if call does not exist */
    name(): Promise<string | undefined>;
    /** optional, returns undefined if call does not exist */
    symbol(): Promise<string | undefined>;
    /** optional, returns undefined if call does not exist */
    decimals(): Promise<BN | undefined>;
}
