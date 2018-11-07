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
}
