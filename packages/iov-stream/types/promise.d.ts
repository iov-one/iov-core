import { Stream } from "xstream";
/**
 * Emits one event for each list element as soon as the promise resolves
 */
export declare function fromListPromise<T>(promise: Promise<Iterable<T>>): Stream<T>;
