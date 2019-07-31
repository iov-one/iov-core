import { WalletImplementationIdString } from "../wallet";
import { Slip10Wallet } from "./slip10wallet";
export declare class Ed25519HdWallet extends Slip10Wallet {
  static fromEntropy(bip39Entropy: Uint8Array): Ed25519HdWallet;
  static fromMnemonic(mnemonicString: string): Ed25519HdWallet;
  readonly implementationId: WalletImplementationIdString;
  clone(): Ed25519HdWallet;
}
