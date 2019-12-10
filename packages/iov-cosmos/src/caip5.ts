import { ChainId } from "@iov/bcp";

/**
 * Conversion between native chain IDs and CAIP-5 format
 *
 * @see https://github.com/ChainAgnostic/CAIPs/pull/9
 */
export class Caip5 {
  public static encode(native: string): ChainId {
    if (!native.match(/^[-a-zA-Z0-9]{3,47}$/)) {
      throw new Error("Given chain ID cannot be CAIP-5 encoded");
    }
    return `cosmos:${native}` as ChainId;
  }

  public static decode(chainId: ChainId): string {
    const match = chainId.match(/^cosmos:([-a-zA-Z0-9]{3,47})$/);
    if (!match) {
      throw new Error("Chain ID not compatible with CAIP-5");
    }
    return match[1];
  }
}
