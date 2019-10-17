import { Encoding } from "@iov/encoding";
import RIPEMD160 from "ripemd160";

import { HashFunction } from "./hash";

const { toHex } = Encoding;

export class Ripemd160 implements HashFunction {
  public readonly blockSize = 512 / 8;

  private readonly impl: RIPEMD160;

  public constructor(firstData?: Uint8Array) {
    this.impl = new RIPEMD160();

    if (firstData) {
      this.update(firstData);
    }
  }

  public update(data: Uint8Array): Ripemd160 {
    this.impl.update(toHex(data), "hex");
    return this;
  }

  public digest(): Uint8Array {
    return Uint8Array.from(this.impl.digest());
  }
}
