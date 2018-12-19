import { Amount, ChainId, PostableBytes, SignedTransaction } from "@iov/bcp-types";
export declare class Parse {
    static ethereumAmount(total: string): Amount;
}
export declare class Scraper {
    static parseBytesTx(bytes: PostableBytes, chainId: ChainId): SignedTransaction;
}
