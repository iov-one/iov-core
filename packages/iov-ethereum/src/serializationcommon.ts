import { Address, Amount, Nonce } from "@iov/bcp";

import { constants } from "./constants";
import { Erc20TokensMap } from "./erc20";

export const ZERO_ETH_QUANTITY = "0";

export enum SwapIdPrefix {
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

export class SerializationCommon {
  public static checkEtherAmount(amounts: readonly Amount[]): void {
    if (amounts.length !== 1) {
      throw new Error("Cannot serialize a swap offer with more than one amount");
    }
    const { tokenTicker } = amounts[0];
    if (tokenTicker !== constants.primaryTokenTicker) {
      throw new Error("Invalid amount: Ether atomic swap must specify amount in ETH");
    }
  }

  public static checkErc20Amount(amounts: readonly Amount[], erc20Tokens: Erc20TokensMap): void {
    if (amounts.length !== 1) {
      throw new Error("Cannot serialize a swap offer with more than one amount");
    }
    const { tokenTicker } = amounts[0];
    if (!erc20Tokens.get(tokenTicker)) {
      throw new Error("Invalid amount: unknown ERC20 token");
    }
  }
}
