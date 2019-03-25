import BN = require("bn.js");

import { Address } from "@iov/bcp";
import { Keccak256 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { decodeHeadTail, decodeVariableLength } from "./encoding";

export interface EthereumRpcClient {
  readonly ethCall: (to: Address, data: Uint8Array) => Promise<Uint8Array>;
}

function calcMethodId(signature: string): Uint8Array {
  const firstFourBytes = new Keccak256(Encoding.toAscii(signature)).digest().slice(0, 4);
  return firstFourBytes;
}

function encodeAddress(address: Address): Uint8Array {
  const padding = new Array(12).fill(0);
  const addressBytes = Encoding.fromHex(address.slice(2)); // 20 bytes
  return new Uint8Array([...padding, ...addressBytes]);
}

function encodeNumber(num: BN | number): Uint8Array {
  const value = num.toString(16);
  const valueBytes = Encoding.fromHex(value);
  const padding = new Array(32 - valueBytes.length).fill(0);
  return new Uint8Array([...padding, ...valueBytes]);
}

export class Erc20 {
  private readonly client: EthereumRpcClient;
  private readonly contractAddress: Address;

  constructor(client: EthereumRpcClient, contractAddress: Address) {
    this.client = client;
    this.contractAddress = contractAddress;
  }

  public async totalSupply(): Promise<BN> {
    const data = calcMethodId("totalSupply()");
    const result = await this.client.ethCall(this.contractAddress, data);
    return new BN(result);
  }

  public async approve(address: Address, value: BN): Promise<BN> {
    const signature = "approve(address,uint256)";
    const methodId = calcMethodId(signature);

    const data = new Uint8Array([...methodId, ...encodeAddress(address), ...encodeNumber(value)]);
    const result = await this.client.ethCall(this.contractAddress, data);
    console.log(result);
    return new BN(0);
  }

  /** optional, returns undefined if call does not exist */
  public async name(): Promise<string | undefined> {
    const data = calcMethodId("name()");
    const result = await this.client.ethCall(this.contractAddress, data);

    const [nameBinary] = decodeHeadTail(result).tail;
    return Encoding.fromUtf8(decodeVariableLength(nameBinary));
  }

  /** optional, returns undefined if call does not exist */
  public async symbol(): Promise<string | undefined> {
    const data = calcMethodId("symbol()");
    const result = await this.client.ethCall(this.contractAddress, data);
    const [symbolBinary] = decodeHeadTail(result).tail;
    return Encoding.fromUtf8(decodeVariableLength(symbolBinary));
  }

  /** optional, returns undefined if call does not exist */
  public async decimals(): Promise<BN | undefined> {
    const data = calcMethodId("decimals()");
    const result = await this.client.ethCall(this.contractAddress, data);
    return new BN(result);
  }
}
