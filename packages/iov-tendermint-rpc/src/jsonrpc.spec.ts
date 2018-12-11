import { jsonRpc, jsonRpcWith, randomChar, randomId } from "./jsonrpc";

describe("jsonrpc", () => {
  it("Generates random chars", () => {
    const char = randomChar();
    expect(char.length).toEqual(1);

    const char2 = randomChar();
    expect(char2.length).toEqual(1);

    const char3 = randomChar();
    const char4 = randomChar();

    // two might be duplicates (1 in 62), but not all 4
    expect(char === char2 && char2 === char3 && char3 === char4).toBeFalsy();
  });

  it("Generates random id", () => {
    const id = randomId();
    expect(id).toBeTruthy();
    expect(id.length).toEqual(12);

    const id2 = randomId();
    expect(id2).toBeTruthy();
    expect(id.length).toEqual(12);
    expect(id2).not.toEqual(id);
  });

  it("Generates proper jsonrpc objects with distinct ids", () => {
    const rpc = jsonRpc();
    expect(rpc.jsonrpc).toEqual("2.0");
    expect(rpc.id).toBeTruthy();
    expect(rpc.id.length).toEqual(12);

    const rpc2 = jsonRpc();
    expect(rpc2.id).toBeTruthy();
    expect(rpc2.id.length).toEqual(12);
    expect(rpc2.id).not.toEqual(rpc.id);
  });

  it("Passes method and params", () => {
    const method = "do_something";
    const params = { foo: "bar" };
    const rpc = jsonRpcWith(method, params);
    expect(rpc.jsonrpc).toEqual("2.0");
    expect(rpc.id).toBeTruthy();
    expect(rpc.id.length).toEqual(12);
    expect(rpc.method).toEqual(method);
    expect(rpc.params).toEqual(params);
  });
});
