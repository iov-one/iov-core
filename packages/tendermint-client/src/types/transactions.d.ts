// TODO: Is this defined better somewhere else?
declare const TransactionSymbol: unique symbol;
type Transaction = typeof TransactionSymbol;
export type TransactionBytes = Uint8Array & Transaction;
export type TransactionString = string & Transaction;

declare const TransactionIDSymbol: unique symbol;
type TransactionID = typeof TransactionIDSymbol;
export type TransactionIDBytes = Uint8Array & TransactionID;
export type TransactionIDString = string & TransactionID;

declare const TxQuerySymbol: unique symbol;
type TxQuery = typeof TxQuerySymbol;
export type TxQueryString = string & TxQuery;

export type Identifier = (tx: Transaction) => TransactionIDBytes;

export const enum TransactionStateType {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  UNCONFIRMED = "UNCONFIRMED",
  CONFIRMED = "CONFIRMED",
}

// TransactionStatePending signfies it is in the mempool, but hasn't
// made it in a block yet.
export interface TransactionStatePending {
  type: TransactionStateType.PENDING;
  transactionId: TransactionIDBytes;
}

export interface TransactionStateRejected {
  type: TransactionStateType.REJECTED;
  transactionId: TransactionIDBytes;
  error: any;
}

// TransactionStateUnconfirmed is here for completeness,
// But tendermint will never return it,
// We should move the tx stuff elsewhere in any case,
// to standardize across multiple chains
export interface TransactionStateUnconfirmed {
  type: TransactionStateType.UNCONFIRMED;
  transactionId: TransactionIDBytes;
  // confidence ranges from 0 to 1 where 1 is confirmed
  // this can be used to show progress
  confidence: number;
  height: number;
  data?: Uint8Array;
  // TODO: tags?
}

export interface TransactionStateConfirmed {
  type: TransactionStateType.CONFIRMED;
  transactionId: TransactionIDBytes;
  height: number;
  data?: Uint8Array;
  // TODO: tags?
}

export type TransactionStateProcessed =
  | TransactionStateUnconfirmed
  | TransactionStateConfirmed;

// TransactionState is the current state of the transaction
export type TransactionState =
  | TransactionStatePending
  | TransactionStateRejected
  | TransactionStateProcessed;
