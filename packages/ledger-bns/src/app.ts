import { sendChunks, Transport } from "./exchange";

const appCode = 128;
const cmdSign = 2;
const cmdPubkey = 4;

export const getPublicKey = (transport: Transport): Promise<Uint8Array> =>
  sendChunks(transport, appCode, cmdPubkey, new Uint8Array([]));

export const signTransaction = (transport: Transport, transaction: Uint8Array): Promise<Uint8Array> =>
  sendChunks(transport, appCode, cmdSign, transaction);
