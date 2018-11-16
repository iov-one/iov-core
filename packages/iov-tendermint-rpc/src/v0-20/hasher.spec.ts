import { PostableBytes } from "@iov/base-types";
import { Encoding } from "@iov/encoding";

import { hashTx } from "./hasher";

describe("Validate hash tx like tendermint", () => {
  it("Matches example from local test", () => {
    // tendermint version == v0.21.0....
    // mkdir ~/tmsearch
    // tendermint --home ~/tmsearch/ init
    // TM_TX_INDEX_INDEX_ALL_TAGS=true tendermint node --home ~/tmsearch \
    //   --proxy_app=kvstore --log_level=state:info,rpc:info,*:error
    // curl http://localhost:26657/broadcast_tx_commit\?tx\=\"foo\"
    // curl http://localhost:26657/broadcast_tx_commit\?tx\=\"something-special\"

    const tx = Encoding.toAscii("foo") as PostableBytes;
    const refHash = Encoding.fromHex("7BE352EB8BA2EFD42CA15815C58B5623B1F3257B");
    expect(hashTx(tx)).toEqual(refHash);

    const tx2 = Encoding.toAscii("something-special") as PostableBytes;
    const refHash2 = Encoding.fromHex("BC25BBB8415108B242DC509AE086D814570A8B39");
    expect(hashTx(tx2)).toEqual(refHash2);
  });
});
