import { Device } from "node-hid";
export declare const getFirstLedgerNanoS: () => Device | undefined;
export declare const connectToFirstLedger: () => any;
export declare const getPublicKey: (transport: any) => Promise<Uint8Array>;
