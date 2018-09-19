import { Encoding } from "@iov/encoding";

import { Ripemd160 } from "./ripemd160";

const toAscii = Encoding.toAscii;
const fromHex = Encoding.fromHex;

describe("Ripemd160", () => {
  it("conforms to go test vectors", () => {
    // https://github.com/golang/crypto/blob/0e37d00/ripemd160/ripemd160_test.go
    expect(new Ripemd160(toAscii("")).digest()).toEqual(fromHex("9c1185a5c5e9fc54612808977ee8f548b2258d31"));
    expect(new Ripemd160(toAscii("a")).digest()).toEqual(fromHex("0bdc9d2d256b3ee9daae347be6f4dc835a467ffe"));
    expect(new Ripemd160(toAscii("abc")).digest()).toEqual(fromHex("8eb208f7e05d987a9b044a8e98c6b087f15a0bfc"));
    expect(new Ripemd160(toAscii("message digest")).digest()).toEqual(fromHex("5d0689ef49d2fae572b881b123a85ffa21595f36"));
    expect(new Ripemd160(toAscii("abcdefghijklmnopqrstuvwxyz")).digest()).toEqual(fromHex("f71c27109c692c1b56bbdceb5b9d2865b3708dbc"));
    expect(new Ripemd160(toAscii("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")).digest()).toEqual(fromHex("12a053384a9c0c88e405a06c27dcf49ada62eb2b"));
    expect(new Ripemd160(toAscii("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")).digest()).toEqual(fromHex("b0e20b6e3116640286ed3a87a5713079b21f5189"));
    expect(new Ripemd160(toAscii("12345678901234567890123456789012345678901234567890123456789012345678901234567890")).digest()).toEqual(fromHex("9b752e45573d4b39f4dbd3323cab82bf63326bfb"));
  });

  it("can update", () => {
    const hash = new Ripemd160(toAscii("a")).update(toAscii("b")).update(toAscii("c"));
    expect(hash.digest()).toEqual(fromHex("8eb208f7e05d987a9b044a8e98c6b087f15a0bfc"));
  });
});
