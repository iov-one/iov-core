/// <reference types="ledgerhq__hw-transport-node-hid" />
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import { Device } from "node-hid";
export declare function getFirstLedgerNanoS(): Device | undefined;
/**
 * Tries to find a Ledger Nano S and connects to it.
 *
 * Each step is retried up to 14 times and the max sleep time per step is
 * (10+20+30+...+120+130)ms. I.e. the worst case runtime of this function is
 * about 2 seconds.
 */
export declare function connectToFirstLedger(): Promise<TransportNodeHid>;
export declare function checkAndRemoveStatus(resp: Uint8Array): Uint8Array;
export declare class LedgerErrorResponse extends Error {
    readonly code: number;
    constructor(code: number);
}
export declare function sendChunks(transport: TransportNodeHid, appCode: number, cmd: number, payload: Uint8Array): Promise<Uint8Array>;
