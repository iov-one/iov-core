import { Address, BcpQueryTag } from "@iov/bcp-types";

export function dposFromOrToTag(account: Address): BcpQueryTag {
  return {
    key: "from_or_to_address",
    value: account,
  };
}

export function findDposAddress(tags: ReadonlyArray<BcpQueryTag>): Address | undefined {
  const resultTag = tags.find(tag => tag.key === "from_or_to_address");
  return resultTag ? (resultTag.value as Address) : undefined;
}
