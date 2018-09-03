/*
This file maintains some stream helpers used in iov-bns, but which
may be useful other places, and should consider to be moved.

Reducer and related code works to maintain a current state
materialized by reducing all events on a stream. Similar
to ValueAndUpdate in keycontrol, but more general.

streamPromise takes a promise that returns an array of items,
and produces a stream that returns many events, one for each
item in the resultant array. This is a minor helper function
that is useful here eg. to streamify searchTx, but not in xstream
library.
*/

// tslint:disable:readonly-keyword
// tslint:disable:no-object-mutation
import { InternalListener, InternalProducer, Stream } from "xstream";

export type ReducerFunc<T, U> = (acc: U, evt: T) => U;
// some sample ReducerFuncs
export const counter: ReducerFunc<any, number> = (sum: number) => sum + 1;
export function append<T>(list: ReadonlyArray<T>, evt: T): ReadonlyArray<T> {
  return [...list, evt];
}
export function last<T>(_: any, evt: T): T {
  return evt;
}

// Reducer takes a stream of events T and a ReducerFunc, that
// materializes a state of type U.
export class Reducer<T, U> {
  private readonly stream: Stream<T>;
  private readonly reducer: ReducerFunc<T, U>;
  private state: U;
  // completed maintains state of stream, resolves/rejects
  // on complete or error
  private readonly completed: Promise<void>;

  constructor(stream: Stream<T>, reducer: ReducerFunc<T, U>, initState: U) {
    this.stream = stream;
    this.reducer = reducer;
    this.state = initState;
    this.completed = new Promise<void>((resolve, reject) => {
      this.stream.addListener({
        complete: () => resolve(),
        error: (err: any) => reject(err),
        next: (evt: T) => {
          this.state = this.reducer(this.state, evt);
        },
      });
    });
  }

  // value returns current materialized state
  public value(): U {
    return this.state;
  }

  // finished resolves on completed stream, rejects on stream error
  public finished(): Promise<void> {
    return this.completed;
  }
}

// countStream returns a reducer that contains current count
// of events on the stream
export function countStream<T>(stream: Stream<T>): Reducer<T, number> {
  return new Reducer(stream, counter, 0);
}

// asArray maintains an array containing all events that have
// occurred on the stream
export function asArray<T>(stream: Stream<T>): Reducer<T, ReadonlyArray<T>> {
  return new Reducer(stream, append, []);
}

export function lastValue<T>(stream: Stream<T>): Reducer<T, T | undefined> {
  return new Reducer(stream, last, undefined);
}

// streamPromise takes a Promsie that returns an array
// and emits one event for each element of the array
export function streamPromise<T>(promise: Promise<ReadonlyArray<T>>): Stream<T> {
  return new Stream<T>(new StreamPromise<T>(promise));
}
// Heavily based on xstream's FromPromise implementation
// https://github.com/staltz/xstream/blob/master/src/index.ts#L436-L467
class StreamPromise<T> implements InternalProducer<T> {
  public readonly type = "streamPromise";
  public readonly p: PromiseLike<ReadonlyArray<T>>;
  public on: boolean;

  constructor(p: PromiseLike<ReadonlyArray<T>>) {
    this.on = false;
    this.p = p;
  }

  public _start(out: InternalListener<T>): void {
    // tslint:disable-next-line:no-this-assignment
    const that = this;
    this.on = true;
    this.p
      .then(
        (vs: ReadonlyArray<T>) => {
          if (that.on) {
            for (const v of vs) {
              out._n(v);
            }
            out._c();
          }
        },
        (e: any) => {
          out._e(e);
        },
      )
      .then(
        () => 0,
        (err: any) => {
          setTimeout(() => {
            throw err;
          });
        },
      );
  }

  public _stop(): void {
    this.on = false;
  }
}
