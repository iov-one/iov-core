import { Amount, FullSignature, PubkeyBundle, SignedTransaction, UnsignedTransaction } from "@iov/bcp";
import * as codecImpl from "./generated/codecimpl";
import { Participant, PrivkeyBundle } from "./types";
/**
 * The message part of a bnsd.Tx
 *
 * @see https://htmlpreview.github.io/?https://github.com/iov-one/weave/blob/v0.24.0/docs/proto/index.html#bnsd.Tx
 */
export declare type BnsdTxMsg = Omit<codecImpl.bnsd.ITx, "fees" | "signatures" | "multisig">;
export declare function encodePubkey(pubkey: PubkeyBundle): codecImpl.crypto.IPublicKey;
export declare function encodePrivkey(privkey: PrivkeyBundle): codecImpl.crypto.IPrivateKey;
export declare function encodeAmount(amount: Amount): codecImpl.coin.ICoin;
export declare function encodeFullSignature(fullSignature: FullSignature): codecImpl.sigs.IStdSignature;
export declare function encodeParticipants(
  participants: readonly Participant[],
): codecImpl.multisig.IParticipant[];
export declare function encodeNumericId(id: number): Uint8Array;
export declare function buildMsg(tx: UnsignedTransaction, strictMode?: boolean): BnsdTxMsg;
export declare function buildUnsignedTx(tx: UnsignedTransaction): codecImpl.bnsd.ITx;
export declare function buildSignedTx(tx: SignedTransaction): codecImpl.bnsd.ITx;
