import { ChainId, FullSignature, Nonce, PubkeyBundle, SignatureBytes, SignedTransaction } from "@iov/bcp";
import * as Long from "long";
import * as codecImpl from "./generated/codecimpl";
import { PrivkeyBundle } from "./types";
export declare function decodeNonce(sequence: Long | number | null | undefined): Nonce;
export declare function decodeUserData(
  userData: codecImpl.sigs.IUserData,
): {
  readonly nonce: Nonce;
};
export declare function decodePubkey(publicKey: codecImpl.crypto.IPublicKey): PubkeyBundle;
export declare function decodePrivkey(privateKey: codecImpl.crypto.IPrivateKey): PrivkeyBundle;
export declare function decodeSignature(signature: codecImpl.crypto.ISignature): SignatureBytes;
export declare function decodeFullSig(sig: codecImpl.sigs.IStdSignature): FullSignature;
export declare function parseTx(tx: codecImpl.bnsd.ITx, chainId: ChainId): SignedTransaction;
