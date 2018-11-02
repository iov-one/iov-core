import { As } from "type-tagger";
import { KeyringSerializationString } from "./keyring";
export declare type EncryptedKeyring = Uint8Array & As<"encrypted-keyring">;
export declare class KeyringEncryptor {
    static encrypt(keyringSerialization: KeyringSerializationString, encryptionKey: Uint8Array): Promise<EncryptedKeyring>;
    private static makeXchacha20poly1305IetfNonce;
}
