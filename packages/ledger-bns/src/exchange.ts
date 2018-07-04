import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import { Device, devices, HID } from "node-hid";
// import AppEthOuter from '@ledgerhq/hw-app-eth';

// const AppEth = AppEthOuter.default;

const LedgerDebug = false;
const LedgerTimeout = 0;

// Transport is an alias for TransportNodeHid until we have some types....
export type Transport = any;

// there are more automatic ways to detect the right device also
const isDeviceLedgerNanoS = (dev: Device) => dev.manufacturer === "Ledger" && dev.product === "Nano S";

export const getFirstLedgerNanoS = (): Device | undefined =>
  devices()
    .filter(d => isDeviceLedgerNanoS(d) && d.path)
    .shift();

export const connectToFirstLedger = (): Transport => {
  const ledger = getFirstLedgerNanoS();
  if (!ledger || !ledger.path) {
    throw new Error("No ledger connected");
  }
  const hid = new HID(ledger.path);
  const transport = new TransportNodeHid(hid, true, LedgerTimeout, LedgerDebug);
  return transport as Transport;
};

// checkAndRemoveStatus ensures the last two bytes are 0x9000
// and returns the response with status code removed,
// or throws an error if not the case
export const checkAndRemoveStatus = (resp: Uint8Array): Uint8Array => {
  checkStatus(resp);
  return resp.slice(0, resp.length - 2);
};

// checkStatus will verify the buffer ends with 0x9000 or throw an error
const checkStatus = (resp: Uint8Array): void => {
  const cut = resp.length - 2;
  if (cut < 0) {
    throw new Error("response less than 2 bytes");
  }
  const status = resp[cut] * 256 + resp[cut + 1];
  if (status !== 0x9000) {
    throw new Error("response with error code: 0x" + status.toString(16));
  }
};

// sendChunks will break the message into multiple chunks as needed
// to fit into the 255 byte packet limit. It will send one chunk if
// the payload is empty.
//
// It will fail on the first error status response.
// If there all messages are status 0x9000, it returns the
// response to the last chunk.
export const sendChunks = async (
  transport: Transport,
  appCode: number,
  cmd: number,
  payload: Uint8Array,
): Promise<Uint8Array> => {
  // tslint:disable-next-line:no-let
  let offset = 0;
  // loop over the non-end chunks
  while (offset + 255 < payload.length) {
    const chunk = payload.slice(offset, offset + 255);
    offset += 255;
    // flag 0x00 specifies "more", 0x80 "last chunk"
    const apdu = Buffer.concat([Buffer.from([appCode, cmd, 0x0, 0, chunk.length]), chunk]);
    const status = await transport.exchange(apdu);
    checkStatus(status);
  }
  const last = payload.slice(offset, offset + 255);
  // flag 0x00 specifies "more", 0x80 "last chunk"
  const msg = Buffer.concat([Buffer.from([appCode, cmd, 0x80, 0, last.length]), last]);
  const response = await transport.exchange(msg);
  return checkAndRemoveStatus(response);
};
