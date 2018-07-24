import { SignedTransaction, UsernameString } from "@iov/types";
import { PublicIdentity } from "./keyring";
import { UserProfile } from "./userprofile";
export declare const enum KeyEventType {
    ADD_PROFILE = "ADD_PROFILE",
    REMOVE_PROFILE = "REMOVE_PROFILE",
    UNLOCK_PROFILE = "UNLOCK_PROFILE",
    LOCK_PROFILE = "LOCK_PROFILE",
    MODIFY_PROFILE = "MODIFY_PROFILE",
    SIGNED_TRANSACTION = "SIGNED_TRANSACTION",
    VERIFIED_TRANSACTION = "VERIFIED_TRANSACTION"
}
export declare type KeyEvent = AddProfileEvent | RemoveProfileEvent | UnlockProfileEvent | ModifyProfileEvent | LockProfileEvent | VerifiedTransactionEvent;
export interface AddProfileEvent {
    readonly type: KeyEventType.ADD_PROFILE;
    readonly user: UsernameString;
}
export interface RemoveProfileEvent {
    readonly type: KeyEventType.REMOVE_PROFILE;
    readonly user: UsernameString;
}
export interface UnlockProfileEvent {
    readonly type: KeyEventType.UNLOCK_PROFILE;
    readonly profile: UserProfile;
}
export interface ModifyProfileEvent {
    readonly type: KeyEventType.MODIFY_PROFILE;
    readonly user: UsernameString;
    readonly identities: ReadonlyArray<PublicIdentity>;
}
export interface LockProfileEvent {
    readonly type: KeyEventType.LOCK_PROFILE;
    readonly user: UsernameString;
}
export interface VerifiedTransactionEvent {
    readonly type: KeyEventType.VERIFIED_TRANSACTION;
    readonly tx: SignedTransaction;
    readonly valid: boolean;
}
