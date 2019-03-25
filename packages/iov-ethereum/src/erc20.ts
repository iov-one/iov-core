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
  readonly hasSymbol: boolean;
  readonly hasName: boolean;
  readonly hasDecimals: boolean;
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

  /** optional, returns undefined if call does not exist */
  public async name(): Promise<string | undefined> {
    if (this.options.hasName) {
      const data = calcMethodId("name()");
      const result = await this.client.ethCall(this.options.contractAddress, data);
      const [nameBinary] = Abi.decodeHeadTail(result).tail;
      return Encoding.fromUtf8(Abi.decodeVariableLength(nameBinary));
    } else {
      return undefined;
    }
  }

  /** optional, returns undefined if call does not exist */
  public async symbol(): Promise<string | undefined> {
    if (this.options.hasSymbol) {
      const data = calcMethodId("symbol()");
      const result = await this.client.ethCall(this.options.contractAddress, data);
      const [symbolBinary] = Abi.decodeHeadTail(result).tail;
      return Encoding.fromUtf8(Abi.decodeVariableLength(symbolBinary));
    } else {
      return undefined;
    }
  }

  /** optional, returns undefined if call does not exist */
  public async decimals(): Promise<BN | undefined> {
    if (this.options.hasDecimals) {
      const data = calcMethodId("decimals()");
      const result = await this.client.ethCall(this.options.contractAddress, data);
      return new BN(result);
    } else {
      return undefined;
    }
  }
}
