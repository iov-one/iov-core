import { Slip10RawIndex } from "@iov/crypto";

export class HdPaths {
  /**
   * IOV's SimpleAddress derivation path
   *
   * @see https://github.com/iov-one/iov-core/blob/v0.16.0-alpha.3/docs/address-derivation-v1.md#simple-addresses-deprecated
   * @deprecated we use IOV HD paths in the form m/44'/234'/a' now
   */
  public static simpleAddress(index: number): readonly Slip10RawIndex[] {
    return [Slip10RawIndex.hardened(HdPaths.purposes.iov), Slip10RawIndex.hardened(index)];
  }

  /**
   * This function allows custom purposes e.g. for use by the faucet
   */
  public static bip43(...indices: readonly number[]): readonly Slip10RawIndex[] {
    return indices.map(Slip10RawIndex.hardened);
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
  ): readonly Slip10RawIndex[] {
    return [
      Slip10RawIndex.hardened(HdPaths.purposes.bip44),
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
  public static bip44Like(coinType: number, account: number): readonly Slip10RawIndex[] {
    return [
      Slip10RawIndex.hardened(HdPaths.purposes.bip44),
      Slip10RawIndex.hardened(coinType),
      Slip10RawIndex.hardened(account),
    ];
  }

  /**
   * An IOV HD path in the form m/44'/234'/a'
   *
   * @param account The account index `a` starting at 0
   */
  public static iov(account: number): readonly Slip10RawIndex[] {
    return HdPaths.bip44Like(HdPaths.coinTypes.iov, account);
  }

  public static iovFaucet(): readonly Slip10RawIndex[] {
    return HdPaths.bip43(HdPaths.purposes.iovFaucet, HdPaths.coinTypes.testnet, 0, 0);
  }

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
  public static ethereum(account: number): readonly Slip10RawIndex[] {
    return HdPaths.bip44(HdPaths.coinTypes.eth, 0, 0, account);
  }

  private static readonly purposes = {
    bip44: 44,
    iov: 4804438,
    iovFaucet: 1229936198,
  };
  /**
   * Coin types as registered at
   * https://github.com/satoshilabs/slips/blob/master/slip-0044.md
   */
  private static readonly coinTypes = {
    testnet: 1,
    eth: 60,
    iov: 234,
  };
}
