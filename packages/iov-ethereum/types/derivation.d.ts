import { PublicKeyBundle } from "@iov/base-types";
import { Address } from "@iov/bcp-types";
export declare function isValidAddress(address: string): boolean;
export declare function toChecksumAddress(address: string): Address;
export declare function keyToAddress(pubkey: PublicKeyBundle): Address;
