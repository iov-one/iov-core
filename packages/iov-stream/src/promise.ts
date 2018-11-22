// tslint:disable:readonly-keyword
// tslint:disable:no-object-mutation
import { InternalListener, InternalProducer, Stream } from "xstream";

// streamPromise takes a Promsie that returns an array
// and emits one event for each element of the array
export function streamPromise<T>(promise: Promise<Iterable<T>>): Stream<T> {
  return new Stream<T>(new StreamPromise<T>(promise));
}
// Heavily based on xstream's FromPromise implementation
// https://github.com/staltz/xstream/blob/master/src/index.ts#L436-L467
class StreamPromise<T> implements InternalProducer<T> {
  public readonly type = "streamPromise";
  public readonly p: PromiseLike<Iterable<T>>;
  public on: boolean;

  constructor(p: PromiseLike<Iterable<T>>) {
    this.on = false;
    this.p = p;
  }

  public _start(out: InternalListener<T>): void {
    // tslint:disable-next-line:no-this-assignment
    const that = this;
    this.on = true;
    this.p
      .then(
        (vs: Iterable<T>) => {
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
