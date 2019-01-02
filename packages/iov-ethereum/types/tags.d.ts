import { Address, BcpQueryTag } from "@iov/bcp-types";
export declare function scraperAddressTag(account: Address): BcpQueryTag;
export declare function findScraperAddress(tags: ReadonlyArray<BcpQueryTag>): Address | undefined;
