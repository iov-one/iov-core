import { ChainId } from "@iov/bcp";
/**
 * Conversion between native chain IDs and CAIP-5 format
 *
 * @see https://github.com/ChainAgnostic/CAIPs/pull/9
 */
export declare class Caip5 {
  static encode(native: string): ChainId;
  static decode(chainId: ChainId): string;
}
