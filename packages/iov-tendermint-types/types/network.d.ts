import { As } from "type-tagger";

// ChainId is used to differentiate a blockchain
// should be alphanumeric or -_/ and unique
export type ChainId = string & As<"chain-id">;
