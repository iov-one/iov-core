import { Device } from "node-hid";
export declare type Transport = any;
export declare function getFirstLedgerNanoS(): Device | undefined;
export declare function connectToFirstLedger(): Transport;
export declare function checkAndRemoveStatus(resp: Uint8Array): Uint8Array;
export declare function sendChunks(transport: Transport, appCode: number, cmd: number, payload: Uint8Array): Promise<Uint8Array>;
