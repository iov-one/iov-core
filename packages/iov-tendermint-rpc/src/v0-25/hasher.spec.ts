import { PostableBytes } from "@iov/base-types";
import { Encoding } from "@iov/encoding";

import { hashTx } from "./hasher";

describe("Validate hash tx like tendermint", () => {
  it("Matches example from local test", () => {
    // this was taken from a result from /search_tx
    // for events we need to calculate this client side.
    const txId = Encoding.fromHex("ceb861fd1ac9ab97bd56559e195b1cf87e7beda9");
    const txData = Encoding.fromBase64("CjcKFLHKfnj3RCOuAdo7UeZ2k02RBfKCEhS/R/I/FM+ZWMQDT9kaimaRDMq4aBoJCKgFGgRDQVNIqgFqCAMSIgogUz43ZVn6VREw5yFzWvXnyfzYhp3dVFGe53n85ZhNeJgiQgpAfWoJqSugxZJnsjqsaFZ/vx861sA5f6GbupmpkGFxUwl+Q1lUAFbKuZU7AWMXNJHFl93yC9hdcSErKMxIXZBAAA==") as PostableBytes;
    expect(hashTx(txData)).toEqual(txId);
  });
});
