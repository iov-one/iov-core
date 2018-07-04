import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import { Device, devices, HID } from "node-hid";
// import AppEthOuter from '@ledgerhq/hw-app-eth';

// const AppEth = AppEthOuter.default;

const LedgerDebug = true;
const LedgerTimeout = 0;

// Transport is an alias for TransportNodeHid until we have some types....
type Transport = any;

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
  const transport: Transport = new TransportNodeHid(hid, true, LedgerTimeout, LedgerDebug);
  return transport;
};

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

// signTransaction(transport, msgToSign).then(result => {
//   verifyResult(result);
// }, error => {
