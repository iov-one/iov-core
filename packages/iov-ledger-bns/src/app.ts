import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";

import { Slip0010RawIndex } from "@iov/crypto";
import { Uint32 } from "@iov/encoding";

import { sendChunks } from "./exchange";

const appCode = 128;
const cmdSign = 2;
const cmdSignWithPath = 3;
const cmdPubkey = 4;
const cmdPubkeyWithPath = 5;
const cmdAppVersion = 0xca;

export const getPublicKey = (transport: TransportNodeHid): Promise<Uint8Array> =>
  sendChunks(transport, appCode, cmdPubkey, new Uint8Array([]));

export const getPublicKeyWithIndex = (transport: TransportNodeHid, i: number): Promise<Uint8Array> => {
  const pathComponent = Slip0010RawIndex.hardened(i).asNumber();
  return sendChunks(transport, appCode, cmdPubkeyWithPath, encodeUint32(pathComponent));
};

export const signTransaction = (transport: TransportNodeHid, transaction: Uint8Array): Promise<Uint8Array> =>
  sendChunks(transport, appCode, cmdSign, transaction);

export const signTransactionWithIndex = (
  transport: TransportNodeHid,
  transaction: Uint8Array,
  i: number,
): Promise<Uint8Array> => {
  const pathComponent = Slip0010RawIndex.hardened(i).asNumber();
  const data = new Uint8Array([...encodeUint32(pathComponent), ...transaction]);
  return sendChunks(transport, appCode, cmdSignWithPath, data);
};

export const appVersion = async (transport: TransportNodeHid): Promise<number> => {
  const response = await sendChunks(transport, appCode, cmdAppVersion, new Uint8Array([]));
  const prefix = response.slice(0, 4);
  if (prefix[0] !== 0 || prefix[1] !== 0xca || prefix[2] !== 0xfe || prefix[3] !== 0) {
    throw new Error(
      `Expected 0x00CAFE00 response prefix but got ${response.length} bytes response with different prefix`,
    );
  }
  return decodeUint32(response.slice(4, 8));
};

const decodeUint32 = (data: Uint8Array): number => Uint32.fromBigEndianBytes(data).asNumber();

const encodeUint32 = (num: number): Uint8Array => new Uint8Array(new Uint32(num).toBytesBigEndian());
