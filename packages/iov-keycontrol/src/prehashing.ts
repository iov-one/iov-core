import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Sha256, Sha512 } from "@iov/crypto";

export function prehash(bytes: SignableBytes, type: PrehashType): SignableBytes {
  switch (type) {
    case PrehashType.None:
      return new Uint8Array([...bytes]) as SignableBytes;
    case PrehashType.Sha256:
      return new Sha256(bytes).digest() as SignableBytes;
    case PrehashType.Sha512:
      return new Sha512(bytes).digest() as SignableBytes;
    default:
      throw new Error("Unknown prehash type");
  }
}
