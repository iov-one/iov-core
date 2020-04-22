import { Address, TokenTicker } from "@iov/bcp";

export enum SmartContractType {
  EscrowSmartContract,
}

export enum SmartContractTokenType {
  ERC20 = "erc20",
  ETHER = "ether",
}

export interface SmartContractConfig {
  readonly address: Address;
  readonly type: SmartContractType;
  readonly fractionalDigits: number;
  readonly tokenTicker: TokenTicker;
  readonly tokenType: SmartContractTokenType;
}
