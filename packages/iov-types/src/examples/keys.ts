import {
  AddressString,
  MnemonicString,
  PrivateKeyBuffer,
  PrivateKeyString,
  PublicKeyBuffer,
  PublicKeyString,
  SeedBuffer,
  SeedString
} from "../types/keys";

export const addressString: AddressString = "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2" as AddressString;

export const mnemonicString: MnemonicString =
  "lake famous pass outer smoke horse suspect obey subject step spirit bless evoke amazing seat" as MnemonicString;

export const privateKeyString: PrivateKeyString = "e9873d79c6d87dc0fb6a5778633389f4453213303da61f20bd67fc233aa33262" as PrivateKeyString;
export const privateKeyBuffer: PrivateKeyBuffer = new Uint8Array([
  ...Buffer.from(privateKeyString, "hex")
]) as PrivateKeyBuffer;

export const publicKeyString: PublicKeyString =
  "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString;
export const publicKeyBuffer: PublicKeyBuffer = new Uint8Array([...Buffer.from(
  publicKeyString,
  "hex"
)]) as PublicKeyBuffer;

export const seedString: SeedString = "000102030405060708090a0b0c0d0e0f" as SeedString;
export const seedBuffer: SeedBuffer = new Uint8Array([...Buffer.from(
  seedString,
  "hex"
)]) as SeedBuffer;
