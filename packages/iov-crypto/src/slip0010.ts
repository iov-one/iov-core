import BN = require("bn.js");

import { Encoding } from "./encoding";
import { Hmac } from "./hmac";
import { Sha512 } from "./sha";

export interface Slip0010Result {
  readonly chainCode: Uint8Array;
  readonly privkey: Uint8Array;
}

export enum Slip0010Curve {
  Secp256k1 = "Bitcoin seed",
  Ed25519 = "ed25519 seed",
}

export class Slip0010 {
  public static derivePath(
    curve: Slip0010Curve,
    seed: Uint8Array,
    path: ReadonlyArray<number>,
  ): Slip0010Result {
    // tslint:disable-next-line:no-let
    let result = this.master(curve, seed);
    for (const rawIndex of path) {
      result = this.child(curve, result.privkey, result.chainCode, rawIndex);
    }
    return result;
  }

  public static rawIndexFromHardened(hardenedIndex: number): number {
    return hardenedIndex + 2 ** 31;
  }

  public static rawIndexFromNormal(normalIndex: number): number {
    return normalIndex;
  }

  private static master(curve: Slip0010Curve, seed: Uint8Array): Slip0010Result {
    const i = new Hmac(Sha512, Encoding.asAscii(curve)).update(seed).digest();
    const il = i.slice(0, 32);
    const ir = i.slice(32, 64);

    if (curve !== Slip0010Curve.Ed25519 && (this.isZero(il) || this.isGteN(curve, il))) {
      return this.master(curve, i);
    }

    return {
      chainCode: ir,
      privkey: il,
    };
  }

  private static child(
    curve: Slip0010Curve,
    parentPrivkey: Uint8Array,
    parentChainCode: Uint8Array,
    rawIndex: number,
  ): Slip0010Result {
    if (rawIndex < 0 || rawIndex > 4294967295) {
      throw new Error("index not in uint32 range: " + rawIndex.toString());
    }

    // tslint:disable-next-line:no-let
    let i: Uint8Array;
    if (rawIndex >= 2 ** 31) {
      // child is a hardened key
      const payload = new Uint8Array([0x00, ...parentPrivkey, ...new BN(rawIndex).toArray("be", 4)]);
      i = new Hmac(Sha512, parentChainCode).update(payload).digest();
    } else {
      // child is a normal key
      if (curve === Slip0010Curve.Ed25519) {
        throw new Error("Normal keys are not allowed with ed25519");
      } else {
        throw new Error("Non-ed25519 normal key derivation not yet implemented");
      }
    }

    return this.childImpl(curve, parentPrivkey, parentChainCode, rawIndex, i);
  }

  private static childImpl(
    curve: Slip0010Curve,
    parentPrivkey: Uint8Array,
    parentChainCode: Uint8Array,
    rawIndex: number,
    i: Uint8Array,
  ): Slip0010Result {
    // step 2 (of the Private parent key → private child key algorithm)

    const il = i.slice(0, 32);
    const ir = i.slice(32, 64);

    // step 3
    const returnChainCode = ir;

    // step 4
    if (curve === Slip0010Curve.Ed25519) {
      return {
        chainCode: returnChainCode,
        privkey: il,
      };
    }

    // step 5
    const n = this.n(curve);
    const returnChildKeyAsNumber = new BN(il).add(new BN(parentPrivkey)).mod(n);
    const returnChildKey = returnChildKeyAsNumber.toArrayLike(Uint8Array, "be", 32);

    // step 6
    if (this.isGteN(curve, il) || this.isZero(returnChildKey)) {
      const newI = new Hmac(Sha512, parentChainCode)
        .update(new Uint8Array([0x01, ...ir, ...new BN(rawIndex).toArray("be", 4)]))
        .digest();
      return this.childImpl(curve, parentPrivkey, parentChainCode, rawIndex, newI);
    }

    // step 7
    return {
      chainCode: returnChainCode,
      privkey: returnChildKey,
    };
  }

  private static isZero(privkey: Uint8Array): boolean {
    return privkey.every(byte => byte === 0);
  }

  private static isGteN(curve: Slip0010Curve, privkey: Uint8Array): boolean {
    const keyAsNumber = new BN(privkey);
    return keyAsNumber.gte(this.n(curve));
  }

  private static n(curve: Slip0010Curve): BN {
    switch (curve) {
      case Slip0010Curve.Secp256k1:
        return new BN("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16);
      default:
        throw new Error("curve not supported");
    }
  }
}
