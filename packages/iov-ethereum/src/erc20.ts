import BN = require("bn.js");

import { Address } from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import { Abi } from "./abi";

export interface EthereumRpcClient {
  readonly ethCall: (to: Address, data: Uint8Array) => Promise<Uint8Array>;
}

export interface Erc20Options {
  readonly contractAddress: Address;
  /** The token ticker. Overrides the on-chain value. */
  readonly symbol: string;
  /** The number of fractional digits. Overrides the on-chain value. */
  readonly decimals: number;
  /** Override on-chain name. Use this if contract does not define value on-chain. */
  readonly name?: string;
}

export class Erc20 {
  private readonly client: EthereumRpcClient;
  private readonly options: Erc20Options;

  constructor(client: EthereumRpcClient, options: Erc20Options) {
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
      return Encoding.fromUtf8(Abi.decodeVariableLength(nameBinary));
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
      return Encoding.fromUtf8(Abi.decodeVariableLength(symbolBinary));
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
