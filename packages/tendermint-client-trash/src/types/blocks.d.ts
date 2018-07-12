import { TransactionBytes } from "./transactions";

declare const BlockHashSymbol: unique symbol;
type BlockHash = typeof BlockHashSymbol;
export type BlockHashBytes = Uint8Array & BlockHash;
export type BlockHashString = string & BlockHash;

export interface Header {
  readonly height: number;
  readonly hash: BlockHashBytes;
  // TODO: much more...
}

export interface Block {
  readonly header: Header;
  readonly transactions: ReadonlyArray<TransactionBytes>;
  // TODO: more?
}
