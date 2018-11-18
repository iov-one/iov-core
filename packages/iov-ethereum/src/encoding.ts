import * as rlp from "rlp";

import { safeBufferValues } from "./safebufferhelpers";

// data: rlp.EncodeInput error
export function toRlp(data: any): Uint8Array {
  const dataBuffer = rlp.encode(data);
  return Uint8Array.from(safeBufferValues(dataBuffer));
}
