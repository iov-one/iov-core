/// <reference types="ledgerhq__hw-transport-node-hid" />
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
export declare function getPublicKey(transport: TransportNodeHid): Promise<Uint8Array>;
export declare function getPublicKeyWithIndex(transport: TransportNodeHid, i: number): Promise<Uint8Array>;
export declare function signTransaction(transport: TransportNodeHid, transaction: Uint8Array): Promise<Uint8Array>;
export declare function signTransactionWithIndex(transport: TransportNodeHid, transaction: Uint8Array, i: number): Promise<Uint8Array>;
export declare function appVersion(transport: TransportNodeHid): Promise<number>;
