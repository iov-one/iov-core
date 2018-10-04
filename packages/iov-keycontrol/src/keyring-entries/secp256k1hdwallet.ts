import { Slip10Curve, Slip10RawIndex } from "@iov/crypto";

import { KeyringEntryImplementationIdString, LocalIdentity } from "../keyring";
import { Slip10KeyringEntry } from "./slip10";

export class Secp256k1HdWallet extends Slip10KeyringEntry {
  public static fromEntropy(bip39Entropy: Uint8Array): Secp256k1HdWallet {
    return super.fromEntropyWithCurve(
      Slip10Curve.Secp256k1,
      bip39Entropy,
      Secp256k1HdWallet,
    ) as Secp256k1HdWallet;
  }

  public static fromMnemonic(mnemonicString: string): Secp256k1HdWallet {
    return super.fromMnemonicWithCurve(
      Slip10Curve.Secp256k1,
      mnemonicString,
      Secp256k1HdWallet,
    ) as Secp256k1HdWallet;
  }

  public readonly implementationId = "secp256k1-hd" as KeyringEntryImplementationIdString;

  public createIdentity(path?: ReadonlyArray<Slip10RawIndex>): Promise<LocalIdentity> {
    if (path === undefined) {
      throw new Error("Secp256k1HdWallet.createIdentity requires a `path` argument");
    }
    return super.createIdentityWithPath(path);
  }

  public clone(): Secp256k1HdWallet {
    return new Secp256k1HdWallet(this.serialize());
  }
}
