import { Stream } from "xstream";
/**
 * Emits one event for each array element as soon as the promise resolves
 */
export declare function streamPromise<T>(promise: Promise<Iterable<T>>): Stream<T>;
