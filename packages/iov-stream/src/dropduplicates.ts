import { Stream } from "xstream";

/**
 * The type that fits into Stream.compose() with input stream and output stream
 * of the same type.
 */
export type SameTypeStreamOperator<T> = (ins: Stream<T>) => Stream<T>;

/**
 * Drops duplicate values in a stream.
 *
 * Marble diagram:
 *
 * ```text
 * -1-1-1-2-4-3-3-4--
 *   dropDuplicates
 * -1-----2-4-3------
 * ```
 *
 * Each value must be uniquely identified by a string given by
 * valueToKey(value).
 *
 * Internally this maintains a set of keys that have been processed already,
 * i.e. memory consumption and Set lookup times should be considered when
 * using this function.
 */
export function dropDuplicates<T>(valueToKey: (x: T) => string): SameTypeStreamOperator<T> {
  const operand: SameTypeStreamOperator<T> = (instream: Stream<T>): Stream<T> => {
    const emittedKeys = new Set<string>();

    const deduplicatedStream = instream
      .filter((value) => !emittedKeys.has(valueToKey(value)))
      .debug((value) => emittedKeys.add(valueToKey(value)));

    return deduplicatedStream;
  };
  return operand;
}
