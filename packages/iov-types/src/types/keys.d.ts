declare const Address: unique symbol;
export type AddressString = typeof Address & string;

declare const Mnemonic: unique symbol;
export type MnemonicString = typeof Mnemonic & string;

declare const PrivateKey: unique symbol;
export type PrivateKeyBuffer = typeof PrivateKey & Uint8Array;
export type PrivateKeyString = typeof PrivateKey & string;

declare const PublicKey: unique symbol;
export type PublicKeyBuffer = typeof PublicKey & Uint8Array;
export type PublicKeyString = typeof PublicKey & string;

export interface KeyPairBuffer {
  readonly private: PrivateKeyBuffer;
  readonly public: PublicKeyBuffer;
}

export interface KeyPairString {
  readonly private: PrivateKeyString;
  readonly public: PublicKeyString;
}

declare const Seed: unique symbol;
export type SeedBuffer = typeof Seed & Uint8Array;
export type SeedString = typeof Seed & string;
