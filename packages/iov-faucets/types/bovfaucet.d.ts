import { Address, TokenTicker } from "@iov/bcp-types";
export declare class BovFaucet {
    private readonly url;
    constructor(url: string);
    credit(address: Address, ticker?: TokenTicker): Promise<void>;
}
