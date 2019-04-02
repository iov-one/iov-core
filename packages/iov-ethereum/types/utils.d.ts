import { ChainId, Nonce } from "@iov/bcp";
export declare function decodeHexQuantity(hexString: string): number;
export declare function decodeHexQuantityString(hexString: string): string;
export declare function decodeHexQuantityNonce(hexString: string): Nonce;
export declare function encodeQuantity(value: number): string;
export declare function encodeQuantityString(value: string): string;
/**
 * Takes a hex representation optionally prefixed with 0x and returns a normalized
 * representation: unprefixed, padded to even characters count, lower case.
 */
export declare function normalizeHex(input: string): string;
export declare function toBcpChainId(numericChainId: number): ChainId;
export declare function fromBcpChainId(chainId: ChainId): number;
/**
 * A function to determine if a transaction is interpreted as ERC20 transfer.
 * We can not know for sure if it was a ERC20 call without knowledge of the recipient type,
 * which is not available at the codec level.
 */
export declare function shouldBeInterpretedAsErc20Transfer(input: Uint8Array, ethQuantity: string): boolean;
