export interface StateKey {
  readonly path: string;
  readonly value: Uint8Array;
}

declare const ParsedStateSymbol: unique symbol;
type ParsedState = typeof ParsedStateSymbol;
export type ParsedStateObject = Object & ParsedState;

declare const StateSymbol: unique symbol;
type State = typeof StateSymbol;
export type StateBytes = Uint8Array & State;
