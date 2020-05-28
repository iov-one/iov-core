// Make sure this file is not imported from index.d.ts to avoid a dependency on @types/bn.js
import { Address } from "@iov/bcp";
import { fromUtf8 } from "@iov/encoding";
import BN from "bn.js";

import { Abi } from "./abi";
import { Erc20Options } from "./erc20";

export interface EthereumRpcClient {
  readonly ethCall: (to: Address, data: Uint8Array) => Promise<Uint8Array>;
}

/** Class to query read-only information from an ERC20 contract. */
export class Erc20Reader {
  private readonly client: EthereumRpcClient;
  private readonly options: Erc20Options;

  public constructor(client: EthereumRpcClient, options: Erc20Options) {
    this.client = client;
    this.options = options;
  }

  public async totalSupply(): Promise<BN> {
    const data = Abi.calculateMethodId("totalSupply()");
    const result = await this.client.ethCall(this.options.contractAddress, data);
    return new BN(result);
  }

  public async balanceOf(address: Address): Promise<BN> {
    const methodId = Abi.calculateMethodId("balanceOf(address)");

    const data = new Uint8Array([...methodId, ...Abi.encodeAddress(address)]);
    const result = await this.client.ethCall(this.options.contractAddress, data);
    return new BN(result);
  }

  /**
   * Returns symbol value from options or from chain.
   *
   * On-chain values will be cached internally, i.e. it is cheap to use this getter
   * as long as the class instance is long living.
   */
  public async name(): Promise<string> {
    if (this.options.name) {
      return this.options.name;
    } else {
      // TODO: cache this call
      const data = Abi.calculateMethodId("name()");
      const result = await this.client.ethCall(this.options.contractAddress, data);
      const [nameBinary] = Abi.decodeHeadTail(result).tail;
      return fromUtf8(Abi.decodeVariableLength(nameBinary));
    }
  }

  /**
   * Returns symbol value from options or from chain.
   *
   * On-chain values will be cached internally, i.e. it is cheap to use this getter
   * as long as the class instance is long living.
   */
  public async symbol(): Promise<string> {
    if (this.options.symbol) {
      return this.options.symbol;
    } else {
      // TODO: cache this call
      const data = Abi.calculateMethodId("symbol()");
      const result = await this.client.ethCall(this.options.contractAddress, data);
      const [symbolBinary] = Abi.decodeHeadTail(result).tail;
      return fromUtf8(Abi.decodeVariableLength(symbolBinary));
    }
  }

  /**
   * Returns decimals value from options or from chain.
   *
   * On-chain values will be cached internally, i.e. it is cheap to use this getter
   * as long as the class instance is long living.
   */
  public async decimals(): Promise<number> {
    if (this.options.decimals) {
      return this.options.decimals;
    } else {
      // TODO: cache this call
      const data = Abi.calculateMethodId("decimals()");
      const result = await this.client.ethCall(this.options.contractAddress, data);
      return new BN(result).toNumber();
    }
  }
}
