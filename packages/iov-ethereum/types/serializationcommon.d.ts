import { Address, Amount, Nonce } from "@iov/bcp";
import { Erc20TokensMap } from "./erc20";
export declare const ZERO_ETH_QUANTITY = "0";
export declare enum SwapIdPrefix {
  Ether = "ether",
  Erc20 = "erc20",
}
export interface UnsignedSerializationOptions {
  readonly chainIdHex: string;
  readonly gasPriceHex: string;
  readonly gasLimitHex: string;
  readonly nonce: Nonce;
  readonly erc20Tokens: Erc20TokensMap;
  readonly atomicSwapContractAddress?: Address;
  readonly customSmartContractAddress?: Address;
}
export interface SignedSerializationOptions {
  readonly v: string;
  readonly r: Uint8Array;
  readonly s: Uint8Array;
  readonly gasPriceHex: string;
  readonly gasLimitHex: string;
  readonly nonce: Nonce;
  readonly erc20Tokens: Erc20TokensMap;
  readonly atomicSwapContractAddress?: Address;
  readonly customSmartContractAddress?: Address;
}
export interface GenericTransactionSerializerParameters {
  readonly nonce: Nonce;
  readonly gasPriceHex: string;
  readonly gasLimitHex: string;
  readonly recipient: Address;
  readonly value: string;
  readonly data: Uint8Array;
  readonly v: string;
  readonly r?: Uint8Array;
  readonly s?: Uint8Array;
}
export declare class SerializationCommon {
  static checkEtherAmount(amounts: readonly Amount[]): void;
  static checkErc20Amount(amounts: readonly Amount[], erc20Tokens: Erc20TokensMap): void;
}
