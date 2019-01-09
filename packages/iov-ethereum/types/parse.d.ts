import { Amount, ChainId, SignedTransaction } from "@iov/bcp-types";
export declare class Parse {
    static ethereumAmount(total: string): Amount;
}
export declare class Scraper {
    static parseBytesTx(json: any, chainId: ChainId): SignedTransaction;
}
