import { TransactionBuffer } from "./transactions";

declare const BlockHashSymbol: unique symbol;
type BlockHash = typeof BlockHashSymbol;
export type BlockHashBuffer = Uint8Array & BlockHash;
export type BlockHashString = string & BlockHash;

export interface Header {
  readonly height: number;
  readonly hash: BlockHashString;
  // TODO: much more...
}

export interface Block {
  readonly header: Header;
  readonly transactions: ReadonlyArray<TransactionBuffer>;
  // TODO: more?
}
