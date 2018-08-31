import { InternalListener, InternalProducer, Stream } from "xstream";

// streamPromise takes a Promsie that returns an array
// and emits one event for each element of the array
export function streamPromise<T>(promise: Promise<ReadonlyArray<T>>): Stream<T> {
  return new Stream<T>(new StreamPromise<T>(promise));
}

export async function readIntoArray<T>(stream: Stream<T>): Promise<ReadonlyArray<T>> {
  const concat = (acc: ReadonlyArray<T>, val: T) => acc.concat(val);
  const result = stream.fold(concat, []).last();
  return new Promise<ReadonlyArray<T>>((resolve, reject) => {
    result.addListener({
      next: (val: ReadonlyArray<T>) => resolve(val),
      error: (err: any) => reject(err),
    });
  });
}

export async function countStream<T>(stream: Stream<T>): Promise<number> {
  // tslint:disable-next-line:no-let
  let count = 0;
  return new Promise<number>((resolve, reject) => {
    stream.addListener({
      next: () => {
        count++;
      },
      error: (err: any) => reject(err),
      complete: () => resolve(count),
    });
  });
}

// Heavily based on xstream's FromPromise implementation
// https://github.com/staltz/xstream/blob/master/src/index.ts#L436-L467
class StreamPromise<T> implements InternalProducer<T> {
  public readonly type = "streamPromise";
  public readonly p: PromiseLike<ReadonlyArray<T>>;
  // tslint:disable-next-line:readonly-keyword
  public on: boolean;

  constructor(p: PromiseLike<ReadonlyArray<T>>) {
    this.on = false;
    this.p = p;
  }

  public _start(out: InternalListener<T>): void {
    // tslint:disable-next-line:no-this-assignment
    const that = this;
    // tslint:disable-next-line:no-object-mutation
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
    // tslint:disable-next-line:no-object-mutation
    this.on = false;
  }
}
