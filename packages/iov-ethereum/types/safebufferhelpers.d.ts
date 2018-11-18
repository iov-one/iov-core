import { Buffer } from "safe-buffer";
/**
 * A reimplementation of Buffer.values that is missing in safe-buffer's Buffer
 *
 * @param safeBuffer buffer of type Buffer from safe-buffer package
 */
export declare function safeBufferValues(safeBuffer: Buffer): number[];
