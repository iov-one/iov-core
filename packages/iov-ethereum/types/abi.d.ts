import { Address, SwapProcessState } from "@iov/bcp";
export interface HeadTail {
  /** An array of start positions within the original data */
  readonly head: readonly number[];
  /** Arguments split by positions as defined by head */
  readonly tail: readonly Uint8Array[];
}
export declare enum SwapContractEvent {
  Opened = 0,
  Claimed = 1,
  Aborted = 2,
}
export declare enum SwapContractMethod {
  Open = 0,
  Claim = 1,
  Abort = 2,
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
  static decodeSwapProcessState(data: Uint8Array): SwapProcessState;
  static decodeEventSignature(data: Uint8Array): SwapContractEvent;
  static decodeMethodId(data: Uint8Array): SwapContractMethod;
  private static readonly eventSignatures;
  private static readonly methodIds;
  private static padTo32;
}
