import { Slip10Curve } from "@iov/crypto";

import { KeyringEntryImplementationIdString } from "../keyring";
import { Slip10Wallet } from "./slip10wallet";

export class Secp256k1HdWallet extends Slip10Wallet {
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

  public clone(): Secp256k1HdWallet {
    return new Secp256k1HdWallet(this.serialize());
  }
}
