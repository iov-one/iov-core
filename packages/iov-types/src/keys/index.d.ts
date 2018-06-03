declare const AddressSymbol: unique symbol;
type Address = typeof AddressSymbol;
export type AddressString = Address & string;

declare const MnemonicSymbol: unique symbol;
type Mnemonic = typeof MnemonicSymbol;
export type MnemonicString = Mnemonic & string;

declare const PrivateKeySymbol: unique symbol;
type PrivateKey = typeof PrivateKeySymbol;
export type PrivateKeyBuffer = PrivateKey & Uint8Array;
export type PrivateKeyString = PrivateKey & string;

declare const PublicKeySymbol: unique symbol;
type PublicKey = typeof PublicKeySymbol;
export type PublicKeyBuffer = PublicKey & Uint8Array;
export type PublicKeyString = PublicKey & string;

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
