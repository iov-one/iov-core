import { Address, TokenTicker } from "@iov/bcp-types";
/**
 * A faucet for the blockchain of value.
 *
 * @deprecated will be removed in 0.10. Migrate to IovFaucet.
 */
export declare class BovFaucet {
    private readonly url;
    constructor(url: string);
    credit(address: Address, ticker?: TokenTicker): Promise<void>;
}
