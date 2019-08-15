import { ChainId, Identity } from "@iov/bcp";
import { Ed25519Keypair, Slip10RawIndex } from "@iov/crypto";
import { As } from "type-tagger";
import {
  ReadonlyWallet,
  Wallet,
  WalletId,
  WalletImplementationIdString,
  WalletSerializationString,
} from "./wallet";
export declare type KeyringSerializationString = string & As<"keyring-serialization">;
/**
 * Read-only information about one wallet in a keyring
 */
export interface WalletInfo {
  readonly id: WalletId;
  readonly label: string | undefined;
}
export declare type WalletDeserializer = (data: WalletSerializationString) => Wallet;
/**
 * A collection of wallets
 */
export declare class Keyring {
  static registerWalletType(
    implementationId: WalletImplementationIdString,
    deserializer: WalletDeserializer,
  ): void;
  private static readonly deserializationRegistry;
  private static deserializeWallet;
  private readonly wallets;
  constructor(data?: KeyringSerializationString);
  /**
   * Stores a copy of the given wallet in the Keyring.
   *
   * Outside changes of the wallet do not affect the Keyring. Use keyring's
   * setWalletLabel, createIdentity, setIdentityLabel to mutate wallets in the keyring.
   */
  add(wallet: ReadonlyWallet): WalletInfo;
  /**
   * Returns an array with immutable references.
   */
  getWallets(): readonly ReadonlyWallet[];
  /**
   * Finds a wallet and returns an immutable reference.
   *
   * @returns a wallet if ID is found, undefined otherwise
   */
  getWallet(id: WalletId): ReadonlyWallet | undefined;
  /**
   * Finds a wallet for a given identity and returns an immutable reference.
   *
   * @returns a wallet if ID is found, undefined otherwise
   */
  getWalletByIdentity(identity: Identity): ReadonlyWallet | undefined;
  /** Sets the label of the wallet with the given ID in the primary keyring  */
  setWalletLabel(walletId: WalletId, label: string | undefined): void;
  /**
   * Creates an identity in the wallet with the given ID in the primary keyring
   *
   * The identity is bound to one chain ID to encourage using different
   * keypairs on different chains.
   */
  createIdentity(
    walletId: WalletId,
    chainId: ChainId,
    options: Ed25519Keypair | readonly Slip10RawIndex[] | number,
  ): Promise<Identity>;
  /**
   * All identities of all wallets
   */
  getAllIdentities(): readonly Identity[];
  /** Assigns a label to one of the identities in the wallet with the given ID in the primary keyring */
  setIdentityLabel(identity: Identity, label: string | undefined): void;
  serialize(): KeyringSerializationString;
  clone(): Keyring;
  /**
   * Finds a wallet and returns a mutable reference. Thus e.g.
   * .getMutableWallet(xyz).createIdentity(...) will change the keyring.
   *
   * @returns a wallet if ID is found, undefined otherwise
   */
  private getMutableWallet;
  /**
   * Finds a wallet for a given identity and returns a mutable reference. Thus e.g.
   * .getWalletByIdentity(xyz).createIdentity(...) will change the keyring.
   *
   * @returns a wallet if ID is found, undefined otherwise
   */
  private getMutableWalletByIdentity;
  /**
   * Throws if any of the new identities already exists in this keyring.
   */
  private ensureNoIdentityCollision;
}
