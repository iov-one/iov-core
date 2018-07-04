import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import { Device, devices, HID } from "node-hid";
// import AppEthOuter from '@ledgerhq/hw-app-eth';

// const AppEth = AppEthOuter.default;

const LedgerDebug = true;
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
