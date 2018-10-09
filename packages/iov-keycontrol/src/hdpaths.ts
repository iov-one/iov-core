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
}
