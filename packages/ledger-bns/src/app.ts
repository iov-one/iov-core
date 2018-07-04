import { Transport } from "./exchange";

export const getPublicKey = async (transport: Transport): Promise<Uint8Array> => {
  const req = Buffer.from([128, 4, 0, 0, 0]);
  const pubkey: Buffer = await transport.exchange(req);
  // tslint:disable:no-console
  const cutoff = pubkey.length - 2;
  if (cutoff < 0) {
    throw new Error("getPublicKey response less than 2 bytes");
  }
  if (pubkey[cutoff] !== 0x90 || pubkey[cutoff + 1] !== 0) {
    throw new Error("getPublicKey didn't return success code 9000");
  }
  return pubkey.slice(0, cutoff);
};
