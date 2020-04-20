import { Address, TokenTicker } from "@iov/bcp";
export declare enum SmartContractType {
  EscrowSmartContract = 0,
}
export declare enum SmartContractTokenType {
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
