import { Address, BcpQueryTag, BcpSwapQuery } from "@iov/bcp-types";
export declare function bnsNonceTag(addr: Address): BcpQueryTag;
export declare function bnsSwapQueryTags(query: BcpSwapQuery, set?: boolean): BcpQueryTag;
