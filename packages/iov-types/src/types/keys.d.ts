declare const AddressSymbol: unique symbol;
type Address = typeof AddressSymbol;
export type AddressString = Address & string;

declare const MnemonicSymbol: unique symbol;
type Mnemonic = typeof MnemonicSymbol;
export type MnemonicString = Mnemonic & string;

export const enum Algorithm {
  ED25519 = "ed25519",
  SECP256K1 = "secp256k1"
}

declare const PrivateKeySymbol: unique symbol;
type PrivateKeyType = typeof PrivateKeySymbol;
export type PrivateKeyBuffer = PrivateKeyType & Uint8Array;
export type PrivateKeyString = PrivateKeyType & string;
export interface PrivateKey {
  algo: Algorithm;
  data: PrivateKeyString;
}

declare const PublicKeySymbol: unique symbol;
type PublicKeyType = typeof PublicKeySymbol;
export type PublicKeyBuffer = PublicKeyType & Uint8Array;
export type PublicKeyString = PublicKeyType & string;
export interface PublicKey {
  algo: Algorithm;
  data: PublicKeyString;
}

declare const SignatureSymbol: unique symbol;
type Signature = typeof SignatureSymbol;
export type SignatureBuffer = Signature & Uint8Array;
export type SignatureString = Signature & string;

export interface KeyPairBuffer {
  readonly private: PrivateKeyBuffer;
  readonly public: PublicKeyBuffer;
}

export interface KeyPairString {
  readonly private: PrivateKeyString;
  readonly public: PublicKeyString;
}

declare const SeedSymbol: unique symbol;
type Seed = typeof SeedSymbol;
export type SeedBuffer = Seed & Uint8Array;
export type SeedString = Seed & string;
