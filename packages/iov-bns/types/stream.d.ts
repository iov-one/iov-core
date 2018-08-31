import { Stream } from "xstream";
export declare function streamPromise<T>(promise: Promise<ReadonlyArray<T>>): Stream<T>;
