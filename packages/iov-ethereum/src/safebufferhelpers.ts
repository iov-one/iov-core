// tslint:disable:readonly-array
import { Buffer } from "safe-buffer";

/**
 * A reimplementation of Buffer.values that is missing in safe-buffer's Buffer
 *
 * @param safeBuffer buffer of type Buffer from safe-buffer package
 */
export function safeBufferValues(safeBuffer: Buffer): number[] {
  const indexList = Array.from({ length: safeBuffer.length }).map((_, index) => index);
  return indexList.map(index => safeBuffer.readUInt8(index));
}
