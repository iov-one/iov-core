// Types in this file are exported outside of the @iov/tendermint-rpc package,
// e.g. as part of a request or response

import { As } from "type-tagger";

/**
 * A raw tendermint transaction hash, currently 20 bytes
 */
export type TxHash = Uint8Array & As<"tx-hash">;

export type IpPortString = string & As<"ipport">;
