import { Slip10Curve, Slip10RawIndex } from "@iov/crypto";

import { KeyringEntryImplementationIdString, LocalIdentity } from "../keyring";
import { Slip10Wallet } from "./slip10wallet";

export class Ed25519HdWallet extends Slip10Wallet {
  public static fromEntropy(bip39Entropy: Uint8Array): Ed25519HdWallet {
    return super.fromEntropyWithCurve(Slip10Curve.Ed25519, bip39Entropy, Ed25519HdWallet) as Ed25519HdWallet;
  }

  public static fromMnemonic(mnemonicString: string): Ed25519HdWallet {
    return super.fromMnemonicWithCurve(
      Slip10Curve.Ed25519,
      mnemonicString,
      Ed25519HdWallet,
    ) as Ed25519HdWallet;
  }

  public readonly implementationId = "ed25519-hd" as KeyringEntryImplementationIdString;

  public createIdentity(path?: ReadonlyArray<Slip10RawIndex>): Promise<LocalIdentity> {
    if (path === undefined) {
      throw new Error("Ed25519HdWallet.createIdentity requires a `path` argument");
    }
    return super.createIdentityWithPath(path);
  }

  public clone(): Ed25519HdWallet {
    return new Ed25519HdWallet(this.serialize());
  }
}
