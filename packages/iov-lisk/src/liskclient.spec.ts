import { LiskClient } from "./liskclient";

describe("LiskClient", () => {
  it("can be constructed", () => {
    const client = new LiskClient();
    expect(client).toBeTruthy();
  });

  it("can disconnect", () => {
    const client = new LiskClient();
    expect(() => client.disconnect()).not.toThrow();
  });
});
