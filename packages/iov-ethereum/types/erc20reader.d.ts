import { Address } from "@iov/bcp";
import BN from "bn.js";
import { Erc20Options } from "./erc20";
export interface EthereumRpcClient {
  readonly ethCall: (to: Address, data: Uint8Array) => Promise<Uint8Array>;
}
/** Class to query read-only information from an ERC20 contract. */
export declare class Erc20Reader {
  private readonly client;
  private readonly options;
  constructor(client: EthereumRpcClient, options: Erc20Options);
  totalSupply(): Promise<BN>;
  balanceOf(address: Address): Promise<BN>;
  /**
   * Returns symbol value from options or from chain.
   *
   * On-chain values will be cached internally, i.e. it is cheap to use this getter
   * as long as the class instance is long living.
   */
  name(): Promise<string>;
  /**
   * Returns symbol value from options or from chain.
   *
   * On-chain values will be cached internally, i.e. it is cheap to use this getter
   * as long as the class instance is long living.
   */
  symbol(): Promise<string>;
  /**
   * Returns decimals value from options or from chain.
   *
   * On-chain values will be cached internally, i.e. it is cheap to use this getter
   * as long as the class instance is long living.
   */
  decimals(): Promise<number>;
}
