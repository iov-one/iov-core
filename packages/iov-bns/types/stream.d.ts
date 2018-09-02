import { Stream } from "xstream";
export declare type ReducerFunc<T, U> = (acc: U, evt: T) => U;
export declare const counter: ReducerFunc<any, number>;
export declare function append<T>(list: ReadonlyArray<T>, evt: T): ReadonlyArray<T>;
export declare function last<T>(_: any, evt: T): T;
export declare class Reducer<T, U> {
    private readonly stream;
    private readonly reducer;
    private state;
    private readonly completed;
    constructor(stream: Stream<T>, reducer: ReducerFunc<T, U>, initState: U);
    value(): U;
    finished(): Promise<void>;
}
export declare function countStream<T>(stream: Stream<T>): Reducer<T, number>;
export declare function asArray<T>(stream: Stream<T>): Reducer<T, ReadonlyArray<T>>;
export declare function lastValue<T>(stream: Stream<T>): Reducer<T, T | undefined>;
export declare function streamPromise<T>(promise: Promise<ReadonlyArray<T>>): Stream<T>;
