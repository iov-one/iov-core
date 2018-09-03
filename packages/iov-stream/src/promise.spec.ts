// tslint:disable:readonly-array
import { streamPromise } from "./promise";
import { asArray, countStream } from "./reducer";

describe("Test streamPromise", () => {
  it("streamPromise will send many values on a stream", async () => {
    // create a promise that will resolve to an array of strings
    const input = ["a", "fd", "fvss", "gs"];
    const prom = new Promise<ReadonlyArray<string>>(resolve => resolve(input));
    const stream = streamPromise(prom);

    // materialize stream into a counter, and wait for stream to complete
    const counter = countStream(stream);
    await counter.finished();
    expect(counter.value()).toEqual(input.length);
  });

  it("streamPromise will send proper values", async () => {
    const input = ["let", "us", "say", "something"];
    const prom = new Promise<ReadonlyArray<string>>(resolve => resolve(input));
    const stream = streamPromise(prom);

    // materialize stream into an array, and wait for stream to complete
    const read = asArray<string>(stream);
    await read.finished();
    expect(read.value()).toEqual(input);
  });
});
