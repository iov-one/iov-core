import BN = require("bn.js");

import { Hmac } from "./hmac";
import { Sha512 } from "./sha";

const toNums = (str: string) => str.split("").map((x: string) => x.charCodeAt(0));
const encodeAsAscii = (str: string) => Uint8Array.from(toNums(str));

export interface MasterResult {
  readonly chainCode: Uint8Array;
  readonly privkey: Uint8Array;
}

export enum Slip0010Curves {
  Ed25519 = "ed25519 seed",
}

export class Slip0010 {
  public static master(curve: Slip0010Curves, seed: Uint8Array): MasterResult {
    const i = new Hmac(Sha512, encodeAsAscii(curve)).update(seed).digest();
    const il = i.slice(0, 32);
    const ir = i.slice(32, 64);

    if (curve !== Slip0010Curves.Ed25519) {
      // TODO: implement step 5 of https://github.com/satoshilabs/slips/blob/master/slip-0010.md#master-key-generation
      throw new Error("Curve not yet supported");
    }

    return {
      chainCode: ir,
      privkey: il,
    };
  }

  // index is a big integer in uint32 range (4 bytes)
  public static childPrivkey(
    curve: Slip0010Curves,
    parentPrivkey: Uint8Array,
    parentChainCode: Uint8Array,
    index: any,
  ): MasterResult {
    // tslint:disable-next-line:no-let
    let i: Uint8Array;
    if (index.gte(2 ** 31)) {
      // child is a hardened key
      const payload = new Uint8Array([0x00, ...parentPrivkey, ...index.toArray("be", 4)]);
      i = new Hmac(Sha512, parentChainCode).update(payload).digest();
    } else {
      // child is a normal key
      if (curve === Slip0010Curves.Ed25519) {
        throw new Error("Normal keys are not allowed with ed25519");
      } else {
        throw new Error("Non-ed25519 normal key derivation not yet implemented");
      }
    }

    const il = i.slice(0, 32);
    const ir = i.slice(32, 64);

    if (curve === Slip0010Curves.Ed25519) {
      return {
        chainCode: ir,
        privkey: il,
      };
    } else {
      throw new Error("curve support not implemented");
    }
  }

  public static hardenedKeyIndex(i: number): any {
    return new BN(i).add(new BN(2 ** 31));
  }

  public static normalKeyIndex(i: number): any {
    return new BN(i);
  }
}
