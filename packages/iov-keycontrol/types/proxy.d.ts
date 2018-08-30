import { Algorithm } from "@iov/tendermint-types";
import { Stream } from "xstream";
import { Client, Connection, Handler, Server } from "./connection";
import { KeyringEntryImplementationIdString } from "./keyring";
import { Event } from "./messages";
import { ValueAndUpdates } from "./valueandupdates";
export interface KeyringEntry {
    readonly setLabel: (label: string | undefined) => Promise<void>;
    readonly getLabel: () => ValueAndUpdates<string | undefined>;
    readonly implementationId: KeyringEntryImplementationIdString;
    readonly supportedAlgorithms: ReadonlyArray<Algorithm>;
}
export declare enum Method {
    Init = "init",
    SetLabel = "setLabel",
    GetLabelUpdate = "getLabelUpdate",
    ImplementationId = "implementationId",
    SupportedAlgorithms = "supportedAlgorithms"
}
export interface LabelParams {
    readonly label: string | undefined;
}
export interface InitResponse {
    readonly implementationId: KeyringEntryImplementationIdString;
    readonly supportedAlgorithms: ReadonlyArray<Algorithm>;
}
export declare class KeyringProxyClient {
    static connect(connection: Connection): Promise<KeyringProxyClient>;
    private static init;
    readonly implementationId: KeyringEntryImplementationIdString;
    readonly supportedAlgorithms: ReadonlyArray<Algorithm>;
    private readonly client;
    constructor(client: Client, implementationId: KeyringEntryImplementationIdString, supportedAlgorithms: ReadonlyArray<Algorithm>);
    setLabel(label: string | undefined): Promise<void>;
}
export declare class KeyringProxyHandler implements Handler {
    private readonly keyring;
    constructor(keyring: KeyringEntry);
    handleRequest(method: string, params: any): Promise<any>;
    handleSubscribe(query: string): Stream<Event>;
}
export declare const serveProxy: (connection: Connection, keyring: KeyringEntry) => Server;
