import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Sha256, Sha512 } from "@iov/crypto";

export function prehash(bytes: SignableBytes, type: PrehashType): Uint8Array {
  switch (type) {
    case PrehashType.None:
      return new Uint8Array([...bytes]);
    case PrehashType.Sha256:
      return new Sha256(bytes).digest();
    case PrehashType.Sha512:
      return new Sha512(bytes).digest();
    default:
      throw new Error("Unknown prehash type");
  }
}
