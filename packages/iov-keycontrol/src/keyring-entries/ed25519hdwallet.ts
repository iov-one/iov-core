import { Slip10Curve } from "@iov/crypto";

import { WalletImplementationIdString } from "../keyring";
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

  public readonly implementationId = "ed25519-hd" as WalletImplementationIdString;

  public clone(): Ed25519HdWallet {
    return new Ed25519HdWallet(this.serialize());
  }
}
