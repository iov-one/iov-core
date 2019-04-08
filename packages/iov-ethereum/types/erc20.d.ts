import { Address } from "@iov/bcp";
export interface Erc20Options {
    readonly contractAddress: Address;
    /** The token ticker. Overrides the on-chain value. */
    readonly symbol: string;
    /** The number of fractional digits. Overrides the on-chain value. */
    readonly decimals: number;
    /** Override on-chain name. Use this if contract does not define value on-chain. */
    readonly name?: string;
}
