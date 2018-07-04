// tslint:disable:no-string-literal

import HID from "node-hid";
// import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
// import AppEthOuter from '@ledgerhq/hw-app-eth';

// const AppEth = AppEthOuter.default;

// there are more automatic ways to detect the right device also
function isDeviceLedgerNanoS(device: any): string {
  const manufacturer: string = device["manufacturer"];
  const product: string = device["product"];
  const path: string = device["path"];
  if (manufacturer === "Ledger" && product === "Nano S") {
    return path;
  }
  return "";
}

export function getPathForFirstLedgerNanoS(): string | null {
  const devices: ReadonlyArray<any> = HID.devices();

  for (const device of devices) {
    const path = isDeviceLedgerNanoS(device);
    if (path) {
      return path;
    }
  }
  return null;
}
