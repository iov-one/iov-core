import { Stream } from "xstream";
export declare function streamPromise<T>(promise: Promise<ReadonlyArray<T>>): Stream<T>;
export declare function readIntoArray<T>(stream: Stream<T>): Promise<ReadonlyArray<T>>;
export declare function countStream<T>(stream: Stream<T>): Promise<number>;
