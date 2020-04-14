import { Address } from "@iov/bcp";
export interface HeadTail {
  /** An array of start positions within the original data */
  readonly head: readonly number[];
  /** Arguments split by positions as defined by head */
  readonly tail: readonly Uint8Array[];
}
export declare class Abi {
  static calculateMethodHash(signature: string): Uint8Array;
  static calculateMethodId(signature: string): Uint8Array;
  static encodeAddress(address: Address): Uint8Array;
  static encodeUint256(value: string): Uint8Array;
  static decodeAddress(binary: Uint8Array): Address;
  static decodeUint256(binary: Uint8Array): string;
  /**
   * Decode head-tail encoded data as described in
   * https://medium.com/@hayeah/how-to-decipher-a-smart-contract-method-call-8ee980311603
   */
  static decodeHeadTail(data: Uint8Array): HeadTail;
  static decodeVariableLength(data: Uint8Array): Uint8Array;
  private static padTo32;
}
