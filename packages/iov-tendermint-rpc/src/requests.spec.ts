import { buildTxQuery } from "./requests";

describe("Check query building", () => {
  it("Handles no tags", () => {
    const query = buildTxQuery({ tags: [] });
    expect(query).toEqual("");
  });

  it("Handles one tags", () => {
    const query = buildTxQuery({ tags: [{ key: "abc", value: "def" }] });
    expect(query).toEqual("abc='def'");
  });

  it("Handles two tags", () => {
    const query = buildTxQuery({ tags: [{ key: "k", value: "9" }, { key: "L", value: "7" }] });
    expect(query).toEqual("k='9' AND L='7'");
  });

  it("Handles height", () => {
    const query = buildTxQuery({ height: 17, tags: [] });
    expect(query).toEqual("tx.height=17");
  });

  it("Handles min and max height", () => {
    const query = buildTxQuery({ minHeight: 21, maxHeight: 111, tags: [] });
    expect(query).toEqual("tx.height>21 AND tx.height<111");
  });

  it("Handles height with tags", () => {
    const query = buildTxQuery({ minHeight: 77, tags: [{ key: "some", value: "info" }] });
    expect(query).toEqual("some='info' AND tx.height>77");
  });
});
