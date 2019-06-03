import { ChainId, Nonce } from "@iov/bcp";
export declare function decodeHexQuantity(hexString: string): number;
export declare function decodeHexQuantityString(hexString: string): string;
export declare function decodeHexQuantityNonce(hexString: string): Nonce;
/**
 * Takes a hex representation optionally prefixed with 0x and returns an Ethereum-friendly
 * representation with a prefix.
 */
export declare function toEthereumHex(input: string | Uint8Array): string;
export declare function encodeQuantity(value: number): string;
export declare function encodeQuantityString(value: string): string;
/**
 * Takes a hex representation optionally prefixed with 0x and returns a normalized
 * representation: unprefixed, padded to even characters count, lower case.
 */
export declare function normalizeHex(input: string): string;
export declare function toBcpChainId(numericChainId: number): ChainId;
export declare function fromBcpChainId(chainId: ChainId): number;
