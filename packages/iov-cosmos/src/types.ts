import amino from "@tendermint/amino-js";

export interface TxValue {
  readonly msg?: readonly amino.Msg[];
  readonly fee?: amino.StdFee;
  readonly signatures?: readonly amino.StdSignature[];
  readonly memo?: string;
}

// Temporary solution until amino-js provides a fleshed-out type
export type AminoTx = amino.Tx & { readonly value: TxValue };
