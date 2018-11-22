import { Stream } from "xstream";
export declare function streamPromise<T>(promise: Promise<Iterable<T>>): Stream<T>;
