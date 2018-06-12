import {
  AddressString,
  Algorithm,
  KeypairBytes,
  KeypairString,
  MnemonicString,
  PrivateKeyBundle,
  PrivateKeyBytes,
  PrivateKeyString,
  PublicKeyBundle,
  PublicKeyBytes,
  PublicKeyString,
  SeedBytes,
  SeedString,
  SignatureBytes,
  SignatureString,
} from "../types/keys";
import { convertHexStringToUint8Array } from "./utils";

export const addressString: AddressString = "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2" as AddressString;

export const mnemonicString: MnemonicString = "lake famous pass outer smoke horse suspect obey subject step spirit bless evoke amazing seat" as MnemonicString;

export const privateKeyString: PrivateKeyString = "e9873d79c6d87dc0fb6a5778633389f4453213303da61f20bd67fc233aa33262" as PrivateKeyString;
export const privateKeyBytes: PrivateKeyBytes = convertHexStringToUint8Array(
  privateKeyString,
) as PrivateKeyBytes;

export const privateKeyBundle: PrivateKeyBundle = {
  algo: Algorithm.ED25519,
  data: privateKeyBytes,
};

export const publicKeyString: PublicKeyString = "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString;
export const publicKeyBytes: PublicKeyBytes = convertHexStringToUint8Array(
  publicKeyString,
) as PublicKeyBytes;
export const publicKeyBytes2: PublicKeyBytes = convertHexStringToUint8Array(
  "a5bdf5841d9c56d6d975c1ab56ba569c3e367aafa2f9e2ce3dc518eab2594b77",
) as PublicKeyBytes;

export const publicKeyBundle: PublicKeyBundle = {
  algo: Algorithm.ED25519,
  data: publicKeyBytes,
};

export const keypairBytes: KeypairBytes = {
  algo: Algorithm.ED25519,
  private: privateKeyBytes,
  public: publicKeyBytes,
};

export const keypairString: KeypairString = {
  algo: Algorithm.ED25519,
  private: privateKeyString,
  public: publicKeyString,
};

export const seedString: SeedString = "000102030405060708090a0b0c0d0e0f" as SeedString;
export const seedBytes: SeedBytes = convertHexStringToUint8Array(
  seedString,
) as SeedBytes;

export const signatureString: SignatureString = "78a2863ad64a87ae8a2fe83c1afa5bdf5841d9c56d6d975c1ab56ba569c3e367aafa2f9e2ce3dc518eab2594b771a8403cb53f53e486d8511dad8a04887e5b2352" as SignatureString;
export const signatureBytes: SignatureBytes = convertHexStringToUint8Array(
  signatureString,
) as SignatureBytes;
