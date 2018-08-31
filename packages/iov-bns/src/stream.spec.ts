// tslint:disable:readonly-array
import { Stream } from "xstream";
import { countStream, readIntoArray, streamPromise } from "./stream";

describe("Test stream helpers", () => {
  it("readIntoArray returns input", async () => {
    const input = [1, 6, 92, 2, 9];
    const stream = Stream.fromArray(input);
    const result = await readIntoArray<number>(stream);
    expect(result).toEqual(input);
  });

  it("readIntoArray throws error", async () => {
    const stream = Stream.throw("error");
    try {
      await readIntoArray<number>(stream);
      fail("This should have thrown an error");
    } catch (err) {
      expect(err).toEqual("error");
    }
  });

  it("streamPromise will send many values on a stream", async () => {
    const input = ["a", "fd", "fvss", "gs"];
    const prom = new Promise<ReadonlyArray<string>>(resolve => resolve(input));
    const stream = streamPromise(prom);
    const read = await countStream(stream);
    expect(read).toEqual(input.length);
  });

  it("streamPromise will send proper values", async () => {
    const input = ["let", "us", "say", "something"];
    const prom = new Promise<ReadonlyArray<string>>(resolve => resolve(input));
    const stream = streamPromise(prom);
    const read = await readIntoArray(stream);
    expect(read).toEqual(input);
  });
});
