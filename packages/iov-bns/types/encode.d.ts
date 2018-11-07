import { FungibleToken, SignedTransaction, UnsignedTransaction } from "@iov/bcp-types";
import { PrivateKeyBundle, PublicKeyBundle } from "@iov/tendermint-types";
import * as codecImpl from "./codecimpl";
export declare function encodePubkey(publicKey: PublicKeyBundle): codecImpl.crypto.IPublicKey;
export declare function encodePrivkey(privateKey: PrivateKeyBundle): codecImpl.crypto.IPrivateKey;
export declare function encodeToken(token: FungibleToken): codecImpl.x.Coin;
export declare const buildSignedTx: (tx: SignedTransaction<UnsignedTransaction>) => codecImpl.app.ITx;
export declare const buildUnsignedTx: (tx: UnsignedTransaction) => codecImpl.app.ITx;
export declare const buildMsg: (tx: UnsignedTransaction) => codecImpl.app.ITx;
