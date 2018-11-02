import { As } from "type-tagger";
import { Keyring } from "./keyring";
export declare type EncryptedKeyring = Uint8Array & As<"encrypted-keyring">;
export declare class KeyringEncryptor {
    static encrypt(keyring: Keyring, encryptionKey: Uint8Array): Promise<EncryptedKeyring>;
    private static makeXchacha20poly1305IetfNonce;
}
