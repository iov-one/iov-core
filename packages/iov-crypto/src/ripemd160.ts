import ripemd160 from "ripemd160";

import { HashFunction } from "./sha";

export class Ripemd160 implements HashFunction {
  // https://github.com/golang/crypto/blob/0e37d00/ripemd160/ripemd160.go#L25
  public readonly blockSize = 64;

  private readonly impl = new ripemd160();

  constructor(firstData?: Uint8Array) {
    if (firstData) {
      this.update(firstData);
    }
  }

  public update(data: Uint8Array): Ripemd160 {
    this.impl.update(Buffer.from(data));
    return this;
  }

  public digest(): Uint8Array {
    return new Uint8Array(this.impl.digest());
  }
}
