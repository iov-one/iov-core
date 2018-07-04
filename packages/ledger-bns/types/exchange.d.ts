import { Device } from "node-hid";
export declare type Transport = any;
export declare const getFirstLedgerNanoS: () => Device | undefined;
export declare const connectToFirstLedger: () => any;
export declare const checkAndRemoveStatus: (resp: Uint8Array) => Uint8Array;
export declare const sendChunks: (transport: any, appCode: number, cmd: number, payload: Uint8Array) => Promise<Uint8Array>;
