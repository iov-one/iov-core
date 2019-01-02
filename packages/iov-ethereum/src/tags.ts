import { Address, BcpQueryTag } from "@iov/bcp-types";

export function scraperAddressTag(account: Address): BcpQueryTag {
  return {
    key: "scraper_address",
    value: account,
  };
}

export function findScraperAddress(tags: ReadonlyArray<BcpQueryTag>): Address | undefined {
  const resultTag = tags.find(tag => tag.key === "scraper_address");
  return resultTag ? (resultTag.value as Address) : undefined;
}
