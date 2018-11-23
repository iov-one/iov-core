import { Producer, Stream } from "xstream";

/**
 * Emits one event for each array element as soon as the promise resolves
 */
export function streamPromise<T>(promise: Promise<Iterable<T>>): Stream<T> {
  const producer: Producer<T> = {
    start: listener => {
      // the code in `start` runs as soon as anyone listens to the stream
      promise
        .then(iterable => {
          for (const element of iterable) {
            listener.next(element);
          }
          listener.complete();
        })
        .catch(error => listener.error(error));
    },
    // tslint:disable:no-empty
    stop: () => {},
  };

  return Stream.create(producer);
}
