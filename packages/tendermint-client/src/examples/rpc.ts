import { Stream } from "xstream";
import { ParsedState, StateBuffer, StateParser } from "../types/state";

// parseWith is just to typecheck, no need to a function
// here, can just call map directly
export const parseWith = (parser: StateParser) => (
  raw: Stream<StateBuffer>
): Stream<ParsedState> => raw.map<ParsedState>(parser);
