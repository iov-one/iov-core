import { ClientNameString, ClientTokenString, NonceBuffer, PrivateKeyString, PublicKeyString, SeedString, Transaction, TTLBuffer } from "@iov/types";
import { Observable } from "xstream";
import { Account, PasswordString, UsernameString } from "./accounts";
import {AddAccount, CreateUser, ExportUser, GrantStoreAccess, ImportPrivateKey, RestoreUser, SetActiveKey, SignTransaction, UnlockUser} from './actions_private'
import {RequestAPIAccess, RequestSignTransaction} from './actions_public'

export interface KeybasePrivate {
  readonly addAccount: (options?: {}) => AddAccount,
  readonly createUser: (username: UsernameString, password: PasswordString, options?: {}) => CreateUser,
  readonly exportUser: (username: UsernameString, password: PasswordString, options?: {}) => ExportUser,
  readonly grantStoreAccess: (publicKey: PublicKeyString, origin: ClientNameString, token: ClientTokenString) => GrantStoreAccess,
  readonly importPrivateKey: (username: UsernameString, privateKey: PrivateKeyString) => ImportPrivateKey,
  readonly restoreUser: (username: UsernameString, password: PasswordString, seed: SeedString) => RestoreUser,
  readonly setActiveKey: (index: number) => SetActiveKey,
  readonly signTransaction: (publicKey: PublicKeyString, transaction: Transaction, nonce: NonceBuffer | null, ttl: TTLBuffer | null) => SignTransaction,
  readonly unlockUser: (username: UsernameString, password: PasswordString) => UnlockUser,
}

export interface KeybasePublic {
  readonly requestAPIAccess: (options?: {}) => RequestAPIAccess;
  readonly requestSignTransaction: (transaction: Transaction) => RequestSignTransaction;

  readonly getAccountsObservable: () => Observable<Account>;
  readonly getTransactionsObservable: () => Observable<Transaction>;
}
