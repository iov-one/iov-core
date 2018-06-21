import { Hmac } from "./hmac";
import { Sha512 } from "./sha";

const toNums = (str: string) => str.split("").map((x: string) => x.charCodeAt(0));
const encodeAsAscii = (str: string) => Uint8Array.from(toNums(str));

export enum Slip0010Curves {
  Ed25519 = "ed25519 seed",
}

export class Slip0010 {
  public static masterKey(curve: Slip0010Curves, seed: Uint8Array): Uint8Array {
    const i = new Hmac(Sha512, encodeAsAscii(curve)).update(seed).digest();
    const il = i.slice(0, 32);
    // const ir = i.slice(32, 64);

    if (curve !== Slip0010Curves.Ed25519) {
      // TODO: implement step 5 of https://github.com/satoshilabs/slips/blob/master/slip-0010.md#master-key-generation
      throw new Error("Curve not yet supported");
    }

    return il;
  }
}
