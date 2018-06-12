import { Stream } from "xstream";
import { StateParser } from "../types/parsed";
import { ParsedState, StateBytes } from "../types/state";

// parseWith is just to typecheck, no need to a function
// here, can just call map directly
export const parseWith = (parser: StateParser) => (raw: Stream<StateBytes>): Stream<ParsedState> =>
  raw.map<ParsedState>(parser);
