import {
  ClientNameString,
  ClientTokenString,
  NonceBuffer,
  PrivateKeyString,
  PublicKeyString,
  SeedString,
  Transaction,
  TTLBuffer
} from "@iov/types";
import { PasswordString, UsernameString } from "./accounts";
import {
  AddAccount,
  CreateUser,
  ExportUser,
  GrantStoreAccess,
  ImportPrivateKey,
  PrivateAction,
  RestoreUser,
  SetActiveKey,
  SignTransaction,
  UnlockUser
} from "./actions_private";
import { KeybaseState } from "./states";

// tslint:disable-next-line:no-class
export default class KeybasePrivate {
  // tslint:disable-next-line:readonly-keyword
  public state: KeybaseState;

  public readonly addAccount: (options?: {}) => AddAccount;
  public readonly createUser: (
    username: UsernameString,
    password: PasswordString,
    options?: {}
  ) => CreateUser;
  public readonly exportUser: (
    username: UsernameString,
    password: PasswordString,
    options?: {}
  ) => ExportUser;
  public readonly grantStoreAccess: (
    publicKey: PublicKeyString,
    origin: ClientNameString,
    token: ClientTokenString
  ) => GrantStoreAccess;
  public readonly importPrivateKey: (
    username: UsernameString,
    privateKey: PrivateKeyString
  ) => ImportPrivateKey;
  public readonly restoreUser: (
    username: UsernameString,
    password: PasswordString,
    seed: SeedString
  ) => RestoreUser;
  public readonly setActiveKey: (index: number) => SetActiveKey;
  public readonly signTransaction: (
    publicKey: PublicKeyString,
    transaction: Transaction,
    nonce: NonceBuffer | null,
    ttl: TTLBuffer | null
  ) => SignTransaction;
  public readonly unlockUser: (
    username: UsernameString,
    password: PasswordString
  ) => UnlockUser;

  private readonly dispatch: (action: PrivateAction) => PrivateAction;
}
