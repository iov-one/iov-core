import { Slip10RawIndex } from "@iov/crypto";
export declare class HdPaths {
  /**
   * Only use this for the real BIP-0044 with
   * - 5 component path (m / purpose' / coin_type' / account' / change / address_index)
   * - no ed25519 support (due to the use of unhardened path components)
   *
   * Don't be misled by people calling their path BIP44 in cases where it is not.
   */
  static bip44(coinType: number, account: number, change: number, address: number): readonly Slip10RawIndex[];
  /**
   * BIP44-like HD paths for account based coins
   *
   * This is following Trezor's recommendation that
   * > If the coin is UTXO-based the path should have all five parts,
   * > precisely as defined in BIP-32. If it is account-based we follow
   * > Stellar's SEP-0005 - paths have only three parts 44'/c'/a'.
   *
   * Example paths to use this for
   *
   *     m/44'/234'/a'   IOV
   *     m/44'/134'/a'   Lisk
   *     m/44'/1120'/a'  RISE
   *     m/44'/148'/a'   Stellar
   *
   * This is called "BIP44-like" because it follows the idea of BIP44 but is not
   * compatible to the 5 component BIP44 standard.
   */
  static bip44Like(coinType: number, account: number): readonly Slip10RawIndex[];
  /**
   * An IOV HD path in the form m/44'/234'/a'
   *
   * @param account The account index `a` starting at 0
   */
  static iov(account: number): readonly Slip10RawIndex[];
  /**
   * An IOV faucet HD path in the form m/1229936198'/coinType'/instanceIndex'/accountIndex'
   *
   * @see https://github.com/iov-one/iov-faucet/tree/v0.8.1#faucet-hd-wallet
   *
   * @param coinType A SLIP-0044 coin. Defaults to 1 (i.e. "Testnet (all coins)") when unset.
   * @param instanceIndex 0-based index of the faucet instance. Defaults to 0 when unset.
   * @param accountIndex 0-based index of the account. Account 0 is the token holder and accounts >= 1 are the distributor accounts. Defaults to 0 when unset.
   */
  static iovFaucet(
    coinType?: number,
    instanceIndex?: number,
    accountIndex?: number,
  ): readonly Slip10RawIndex[];
  /**
   * The default Ethereum derivation path
   *
   * This is compatible to MetaMask and Trezor.
   *
   * What MetaMask calls the account is a BIP44 address index: m/44'/60'/0'/0/a
   * (see https://github.com/MetaMask/eth-hd-keyring/blob/018a11a3a2/index.js#L8)
   *
   * @param account The account index `a` starting at 0
   */
  static ethereum(account: number): readonly Slip10RawIndex[];
  static cosmos(account: number): readonly Slip10RawIndex[];
  private static readonly purposes;
  /**
   * Coin types as registered at
   * https://github.com/satoshilabs/slips/blob/master/slip-0044.md
   */
  private static readonly coinTypes;
}
