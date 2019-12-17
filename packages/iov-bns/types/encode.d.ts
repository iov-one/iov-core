import { FullSignature, PubkeyBundle, SignedTransaction, UnsignedTransaction } from "@iov/bcp";
import * as codecImpl from "./generated/codecimpl";
import { PrivkeyBundle } from "./types";
export declare function encodePubkey(pubkey: PubkeyBundle): codecImpl.crypto.IPublicKey;
export declare function encodePrivkey(privkey: PrivkeyBundle): codecImpl.crypto.IPrivateKey;
export declare function encodeFullSignature(fullSignature: FullSignature): codecImpl.sigs.IStdSignature;
export declare function buildUnsignedTx(tx: UnsignedTransaction): codecImpl.bnsd.ITx;
export declare function buildSignedTx(tx: SignedTransaction): codecImpl.bnsd.ITx;
