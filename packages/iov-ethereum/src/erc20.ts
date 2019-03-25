import BN = require("bn.js");

import { Address } from "@iov/bcp";
import { Keccak256 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

import { Abi } from "./abi";

export interface EthereumRpcClient {
  readonly ethCall: (to: Address, data: Uint8Array) => Promise<Uint8Array>;
}

function calcMethodId(signature: string): Uint8Array {
  const firstFourBytes = new Keccak256(Encoding.toAscii(signature)).digest().slice(0, 4);
  return firstFourBytes;
}

export interface Erc20Options {
  readonly contractAddress: Address;
  /** Override on-chain symbol. Use this of contract does not define value on-chain */
  readonly symbol?: string;
  /** Override on-chain name. Use this of contract does not define value on-chain */
  readonly name?: string;
  /** Override on-chain decimals. Use this of contract does not define value on-chain */
  readonly decimals?: number;
}

export class Erc20 {
  private readonly client: EthereumRpcClient;
  private readonly options: Erc20Options;

  constructor(client: EthereumRpcClient, options: Erc20Options) {
    this.client = client;
    this.options = options;
  }

  public async totalSupply(): Promise<BN> {
    const data = calcMethodId("totalSupply()");
    const result = await this.client.ethCall(this.options.contractAddress, data);
    return new BN(result);
  }

  public async balanceOf(address: Address): Promise<BN> {
    const methodId = calcMethodId("balanceOf(address)");

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
      const data = calcMethodId("name()");
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
      const data = calcMethodId("symbol()");
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
      const data = calcMethodId("decimals()");
      const result = await this.client.ethCall(this.options.contractAddress, data);
      return new BN(result).toNumber();
    }
  }
}
