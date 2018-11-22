// tslint:disable:readonly-array
import { streamPromise } from "./promise";
import { asArray, countStream } from "./reducer";

describe("streamPromise", () => {
  it("sends many values on a stream", async () => {
    // create a promise that will resolve to an array of strings
    const input = ["a", "fd", "fvss", "gs"];
    const prom = Promise.resolve(input);
    const stream = streamPromise(prom);

    // materialize stream into a counter, and wait for stream to complete
    const counter = countStream(stream);
    await counter.finished();
    expect(counter.value()).toEqual(input.length);
  });

  it("works for iterables like Uint8Array", async () => {
    const inputPromise = Promise.resolve(new Uint8Array([0x00, 0x11, 0x22]));
    const stream = streamPromise(inputPromise);

    const reader = asArray<number>(stream);
    await reader.finished();
    expect(reader.value()).toEqual([0x00, 0x11, 0x22]);
  });

  it("sends proper values", async () => {
    const input = ["let", "us", "say", "something"];
    const prom = Promise.resolve(input);
    const stream = streamPromise(prom);

    // materialize stream into an array, and wait for stream to complete
    const read = asArray<string>(stream);
    await read.finished();
    expect(read.value()).toEqual(input);
  });
});
