import { Address, BcpSwapQuery } from "@iov/bcp-types";
import { Tag } from "@iov/tendermint-types";
export declare function bnsFromOrToTag(addr: Address): Tag;
export declare function bnsNonceTag(addr: Address): Tag;
export declare function bnsSwapQueryTags(query: BcpSwapQuery, set?: boolean): Tag;
