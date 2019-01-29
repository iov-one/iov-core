import { Slip10RawIndex } from "@iov/crypto";

export class HdPaths {
  /**
   * IOV's SimpleAddress derivation path
   *
   * @see https://github.com/iov-one/iov-core/blob/v0.6.1/docs/KeyBase.md#simple-addresses
   */
  public static simpleAddress(index: number): ReadonlyArray<Slip10RawIndex> {
    const iovPurpose = 4804438;
    return [Slip10RawIndex.hardened(iovPurpose), Slip10RawIndex.hardened(index)];
  }

  /**
   * Only use this for the real BIP-0044 with
   * - 5 component path (m / purpose' / coin_type' / account' / change / address_index)
   * - no ed25519 support (due to the use of unhardened path components)
   *
   * Don't be misled by people calling their path BIP44 in cases where it is not.
   */
  public static bip44(
    coinType: number,
    account: number,
    change: number,
    address: number,
  ): ReadonlyArray<Slip10RawIndex> {
    const bip44Purpose = 44;
    return [
      Slip10RawIndex.hardened(bip44Purpose),
      Slip10RawIndex.hardened(coinType),
      Slip10RawIndex.hardened(account),
      Slip10RawIndex.normal(change),
      Slip10RawIndex.normal(address),
    ];
  }

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
  public static bip44Like(coinType: number, account: number): ReadonlyArray<Slip10RawIndex> {
    return [Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(coinType), Slip10RawIndex.hardened(account)];
  }

  /**
   * An IOV HD path in the form m/44'/234'/a'
   *
   * @param account The account index statring at 0
   */
  public static iov(account: number): ReadonlyArray<Slip10RawIndex> {
    // coin type 234 is registered for IOV at
    // https://github.com/satoshilabs/slips/blob/master/slip-0044.md
    return HdPaths.bip44Like(234, account);
  }

  /**
   * The default Ethereum derivation path
   *
   * This is compatible to MetaMask and Trezor.
   *
   * What MetaMask calls the account is a BIP44 address index: m/44'/60'/0'/0/<account>
   * (see https://github.com/MetaMask/eth-hd-keyring/blob/018a11a3a2/index.js#L8)
   */
  public static ethereum(account: number): ReadonlyArray<Slip10RawIndex> {
    return HdPaths.bip44(60, 0, 0, account);
  }

  /**
   * The default MetaMask derivation path
   *
   * @deprecated use HdPaths.ethereum
   */
  public static metamaskHdKeyTree(account: number): ReadonlyArray<Slip10RawIndex> {
    return HdPaths.ethereum(account);
  }
}
