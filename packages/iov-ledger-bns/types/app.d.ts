/// <reference types="ledgerhq__hw-transport-node-hid" />
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
export declare const getPublicKey: (transport: TransportNodeHid) => Promise<Uint8Array>;
export declare const getPublicKeyWithIndex: (transport: TransportNodeHid, i: number) => Promise<Uint8Array>;
export declare const signTransaction: (transport: TransportNodeHid, transaction: Uint8Array) => Promise<Uint8Array>;
export declare const signTransactionWithIndex: (transport: TransportNodeHid, transaction: Uint8Array, i: number) => Promise<Uint8Array>;
export declare const appVersion: (transport: TransportNodeHid) => Promise<number>;
