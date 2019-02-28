import { Address, PublicKeyBundle } from "@iov/bcp";
export declare function isValidAddress(address: string): boolean;
export declare function toChecksumAddress(address: string): Address;
export declare function pubkeyToAddress(pubkey: PublicKeyBundle): Address;
