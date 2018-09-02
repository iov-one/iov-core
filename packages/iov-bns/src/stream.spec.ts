// tslint:disable:readonly-array
import { Stream } from "xstream";
import { asArray, countStream, streamPromise } from "./stream";

describe("Test stream helpers", () => {
  it("readIntoArray returns input", async () => {
    const input = [1, 6, 92, 2, 9];
    const stream = Stream.fromArray(input);
    const result = asArray<number>(stream);
    await result.finished();
    expect(result.value()).toEqual(input);
  });

  it("Reducer.finished throws error on stream error", async () => {
    const stream = Stream.throw("error");
    try {
      const result = asArray<number>(stream);
      await result.finished();
      fail("This should have thrown an error");
    } catch (err) {
      expect(err).toEqual("error");
    }
  });

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
