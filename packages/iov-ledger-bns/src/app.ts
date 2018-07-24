import { Uint32 } from "@iov/encoding";

import { sendChunks, Transport } from "./exchange";

const appCode = 128;
const cmdSign = 2;
const cmdSignWithPath = 3;
const cmdPubkey = 4;
const cmdPubkeyWithPath = 5;
const cmdAppVersion = 0xca;

export const getPublicKey = (transport: Transport): Promise<Uint8Array> =>
  sendChunks(transport, appCode, cmdPubkey, new Uint8Array([]));

export const getPublicKeyWithPath = (transport: Transport, path: number): Promise<Uint8Array> =>
  sendChunks(transport, appCode, cmdPubkeyWithPath, encodeUint32(path));

export const signTransaction = (transport: Transport, transaction: Uint8Array): Promise<Uint8Array> =>
  sendChunks(transport, appCode, cmdSign, transaction);

export const signTransactionWithPath = (
  transport: Transport,
  transaction: Uint8Array,
  path: number,
): Promise<Uint8Array> => {
  const data = new Uint8Array([...encodeUint32(path), ...transaction]);
  return sendChunks(transport, appCode, cmdSignWithPath, data);
};

export const appVersion = async (transport: Transport): Promise<number> => {
  const res = await sendChunks(transport, appCode, cmdAppVersion, new Uint8Array([]));
  if (res[0] !== 0 || res[1] !== 0xca || res[2] !== 0xfe || res[3] !== 0) {
    throw new Error("Expected 0x00CAFE00 prefix for status");
  }
  return decodeUint32(res.slice(4, 8));
};

const decodeUint32 = (data: Uint8Array): number => Uint32.fromBigEndianBytes(data).asNumber();

const encodeUint32 = (num: number): Uint8Array => new Uint8Array(new Uint32(num).toBytesBigEndian());
