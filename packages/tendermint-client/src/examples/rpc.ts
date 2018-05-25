import { Stream } from "xstream";
import {
  StateBuffer,
  StateParser,
  ParsedState
} from "../types/rpc";

// parseWith is just to typecheck, no need to a function
// here, can just call map directly
export const parseWith = (parser: StateParser) => 
  (raw: Stream<StateBuffer>) : Stream<ParsedState> =>
    raw.map<ParsedState>(parser);
