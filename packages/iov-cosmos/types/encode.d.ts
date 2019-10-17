import { Amount, Fee, FullSignature, PubkeyBundle, SignedTransaction, UnsignedTransaction } from "@iov/bcp";
import amino from "@tendermint/amino-js";
export declare function encodePubkey(pubkey: PubkeyBundle): amino.PubKey;
export declare function encodeAmount(amount: Amount): readonly amino.Coin[];
export declare function encodeFee(fee: Fee): amino.StdFee;
export declare function encodeFullSignature(fullSignature: FullSignature): amino.StdSignature;
export declare function buildUnsignedTx(tx: UnsignedTransaction): amino.Tx;
export declare function buildSignedTx(tx: SignedTransaction): amino.Tx;
