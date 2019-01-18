import { Address, BcpQueryTag } from "@iov/bcp-types";
export declare function dposFromOrToTag(account: Address): BcpQueryTag;
export declare function findDposAddress(tags: ReadonlyArray<BcpQueryTag>): Address | undefined;
