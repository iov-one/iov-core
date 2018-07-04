import { Device, devices } from "node-hid";
// import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
// import AppEthOuter from '@ledgerhq/hw-app-eth';

// const AppEth = AppEthOuter.default;

// there are more automatic ways to detect the right device also
const isDeviceLedgerNanoS = (dev: Device) => dev.manufacturer === "Ledger" && dev.product === "Nano S";

export const getPathForFirstLedgerNanoS = (): Device | undefined =>
  devices()
    .filter(d => isDeviceLedgerNanoS(d) && d.path)
    .shift();
