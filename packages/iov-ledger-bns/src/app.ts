import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";

import { Slip10RawIndex } from "@iov/crypto";
import { Uint32 } from "@iov/encoding";

import { sendChunks } from "./exchange";

const appCode = 128;
const cmdSignWithPath = 3;
const cmdPubkeyWithPath = 5;
const cmdAppVersion = 0xca;

export function getPublicKeyWithIndex(transport: TransportNodeHid, i: number): Promise<Uint8Array> {
  const pathComponent = Slip10RawIndex.hardened(i).asNumber();
  return sendChunks(transport, appCode, cmdPubkeyWithPath, encodeUint32(pathComponent));
}

export function signTransactionWithIndex(
  transport: TransportNodeHid,
  transaction: Uint8Array,
  i: number,
): Promise<Uint8Array> {
  const pathComponent = Slip10RawIndex.hardened(i).asNumber();
  const data = new Uint8Array([...encodeUint32(pathComponent), ...transaction]);
  return sendChunks(transport, appCode, cmdSignWithPath, data);
}

export async function appVersion(transport: TransportNodeHid): Promise<number> {
  const response = await sendChunks(transport, appCode, cmdAppVersion, new Uint8Array([]));
  const prefix = response.slice(0, 4);
  if (prefix[0] !== 0 || prefix[1] !== 0xca || prefix[2] !== 0xfe || prefix[3] !== 0) {
    throw new Error(
      `Expected 0x00CAFE00 response prefix but got ${response.length} bytes response with different prefix`,
    );
  }
  return decodeUint32(response.slice(4, 8));
}

function decodeUint32(data: Uint8Array): number {
  return Uint32.fromBigEndianBytes(data).asNumber();
}

function encodeUint32(num: number): Uint8Array {
  return new Uint8Array(new Uint32(num).toBytesBigEndian());
}
