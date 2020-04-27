import { Address, Amount, BlockHeightTimeout, Hash, TokenTicker } from "@iov/bcp";
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
export declare enum EscrowState {
  NON_EXISTENT = 0,
  OPEN = 1,
  CLAIMED = 2,
  ABORTED = 3,
}
export interface Escrow {
  readonly sender: Address;
  readonly recipient: Address;
  readonly arbiter: Address;
  readonly hash: Hash;
  readonly timeout: BlockHeightTimeout;
  readonly amount: Amount;
  readonly state: EscrowState;
}
