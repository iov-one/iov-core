import { Address, PublicKeyBundle } from "@iov/bcp";
export declare function isValidAddress(address: string): boolean;
/**
 * Converts Ethereum address to checksummed address according to EIP-55.
 *
 * Input address must be valid, i.e. either all lower case or correctly checksummed.
 *
 * @link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md
 */
export declare function toChecksummedAddress(address: string | Uint8Array): Address;
export declare function pubkeyToAddress(pubkey: PublicKeyBundle): Address;
