// how to do this???
// import {PrivateKeyBuffer} from 'iov-types/types/keys';
import { crypto } from "../types/proto.js";

type PublicKeyBuffer = Uint8Array;

// show basic encode // load
const pub = crypto.PublicKey.create({
  ed25519: Buffer.from("123456789012345678901234567890qq")
});
const bz: PublicKeyBuffer = crypto.PublicKey.encode(pub).finish();
export const loaded: crypto.PublicKey = crypto.PublicKey.decode(bz);
