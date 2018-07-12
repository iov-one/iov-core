declare const AddressSymbol: unique symbol;
type Address = typeof AddressSymbol;
export type AddressString = Address & string;
export type AddressBytes = Address & Uint8Array;

declare const MnemonicSymbol: unique symbol;
type Mnemonic = typeof MnemonicSymbol;
export type MnemonicString = Mnemonic & string;

export const enum Algorithm {
  ED25519 = "ed25519",
  SECP256K1 = "secp256k1",
}

declare const PrivateKeySymbol: unique symbol;
type PrivateKeyType = typeof PrivateKeySymbol;
export type PrivateKeyBytes = PrivateKeyType & Uint8Array;
export type PrivateKeyString = PrivateKeyType & string;
export interface PrivateKeyBundle {
  readonly algo: Algorithm;
  readonly data: PrivateKeyBytes;
}

declare const PublicKeySymbol: unique symbol;
type PublicKeyType = typeof PublicKeySymbol;
export type PublicKeyBytes = PublicKeyType & Uint8Array;
export type PublicKeyString = PublicKeyType & string;
export interface PublicKeyBundle {
  readonly algo: Algorithm;
  readonly data: PublicKeyBytes;
}

declare const SignatureSymbol: unique symbol;
type Signature = typeof SignatureSymbol;
export type SignatureBytes = Signature & Uint8Array;
export type SignatureString = Signature & string;

export interface SignatureBundle {
  readonly algo: Algorithm;
  readonly signature: SignatureBytes;
}

export interface KeypairBytes {
  readonly algo: Algorithm;
  readonly private: PrivateKeyBytes;
  readonly public: PublicKeyBytes;
}

export interface KeypairString {
  readonly algo: Algorithm;
  readonly private: PrivateKeyString;
  readonly public: PublicKeyString;
}

declare const SeedSymbol: unique symbol;
type Seed = typeof SeedSymbol;
export type SeedBytes = Seed & Uint8Array;
export type SeedString = Seed & string;
