import { Address } from "@iov/bcp-types";
import jssha3 from "js-sha3";
import { HashFunction } from "./sha";

export class Keccak256 implements HashFunction {
  public readonly blockSize = 512 / 8;

  private readonly impl: any;

  constructor(firstData?: Uint8Array | Address) {
    this.impl = jssha3.keccak256.create();

    if (firstData) {
      this.update(firstData);
    }
  }

  public update(data: Uint8Array | Address): Keccak256 {
    this.impl.update(data);
    return this;
  }

  public digest(): Uint8Array {
    return new Uint8Array(this.impl.digest());
  }
}
