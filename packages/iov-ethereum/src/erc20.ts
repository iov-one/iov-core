import { Address, Amount, TokenTicker, UnsignedTransaction } from "@iov/bcp";

export interface Erc20ApproveTransaction extends UnsignedTransaction {
  readonly kind: "erc20/approve";
  readonly spender: Address;
  readonly amount: Amount;
}

export function isErc20ApproveTransaction(
  transaction: UnsignedTransaction,
): transaction is Erc20ApproveTransaction {
  return (transaction as Erc20ApproveTransaction).kind === "erc20/approve";
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

export type Erc20TokensMap = ReadonlyMap<TokenTicker, Erc20Options>;
