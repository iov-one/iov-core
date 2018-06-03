import { ClientNameString, ClientTokenString, NonceBuffer, PrivateKeyString, PublicKeyString, SeedString, Transaction, TTLBuffer } from "@iov/types";
import { Observable } from "xstream";
import { Account, PasswordString, UsernameString } from "./accounts";

export interface KeybasePrivate {
  readonly addAccount: (options?: {}) => true,
  readonly createUser: (username: UsernameString, password: PasswordString, options?: {}) => true,
  readonly exportUser: (username: UsernameString, password: PasswordString, options?: {}) => true,
  readonly grantStoreAccess: (publicKey: PublicKeyString, origin: ClientNameString, token: ClientTokenString) => true,
  readonly importPrivateKey: (username: UsernameString, privateKey: PrivateKeyString) => true,
  readonly restoreUser: (username: UsernameString, password: PasswordString, seed: SeedString) => true,
  readonly setActiveKey: (index: number) => true,
  readonly signTransaction: (publicKey: PublicKeyString, transaction: Transaction, nonce: NonceBuffer | null, ttl: TTLBuffer | null) => true,
  readonly unlockUser: (username: UsernameString, password: PasswordString) => true,
}

export interface KeybasePublic {
  readonly requestAPIAccess: (options?: {}) => true;
  readonly requestSignTransaction: (transaction: Transaction) => true;

  readonly getAccountsObservable: () => Observable<Account>;
  readonly getTransactionsObservable: () => Observable<Transaction>;
}
