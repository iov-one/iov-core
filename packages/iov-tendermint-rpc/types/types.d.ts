import { As } from "type-tagger";
/**
 * A raw tendermint transaction hash, currently 20 bytes
 */
export declare type TxHash = Uint8Array & As<"tx-hash">;
export declare type IpPortString = string & As<"ipport">;
