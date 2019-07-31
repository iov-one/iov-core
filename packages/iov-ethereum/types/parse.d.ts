import { Amount, TransactionId } from "@iov/bcp";
export declare class Parse {
  static ethereumAmount(total: string): Amount;
  static transactionId(hash: string): TransactionId;
}
