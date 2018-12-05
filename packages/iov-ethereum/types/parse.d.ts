import { ChainId, PostableBytes } from "@iov/base-types";
import { Amount, SignedTransaction } from "@iov/bcp-types";
export declare class Parse {
    static ethereumAmount(total: string): Amount;
}
export declare class Scraper {
    static parseBytesTx(bytes: PostableBytes, chainId: ChainId): SignedTransaction;
}
