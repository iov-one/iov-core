import { Address, PublicKeyBundle } from "@iov/bcp-types";
export declare function isValidAddress(address: string): boolean;
/**
 * Converts Ethereum adddress to checksummed address according to EIP-55.
 *
 * Input address must be valid, i.e. either all lower case or correctly checksummed.
 */
export declare function toChecksummedAddress(address: string): Address;
export declare function pubkeyToAddress(pubkey: PublicKeyBundle): Address;
