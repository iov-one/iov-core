declare const ClientNameSymbol: unique symbol;
type ClientName = typeof ClientNameSymbol
export type ClientNameString = ClientName & string

declare const ClientTokenSymbol: unique symbol;
type ClientToken = typeof ClientTokenSymbol
export type ClientTokenString = ClientToken & string
