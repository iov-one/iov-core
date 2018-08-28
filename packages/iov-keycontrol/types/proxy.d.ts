/// <reference types="node" />
import { Algorithm } from "@iov/tendermint-types";
import { EventEmitter } from "events";
import { KeyringEntryImplementationIdString } from "./keyring";
import { ValueAndUpdates } from "./valueandupdates";
export interface KeyringEntry {
    readonly setLabel: (label: string | undefined) => Promise<void>;
    readonly getLabel: () => ValueAndUpdates<string | undefined>;
    readonly implementationId: KeyringEntryImplementationIdString;
    readonly supportedAlgorithms: ReadonlyArray<Algorithm>;
}
export declare enum Method {
    SetLabel = "setLabel",
    GetLabelUpdate = "getLabelUpdate",
    ImplementationId = "implementationId",
    SupportedAlgorithms = "supportedAlgorithms"
}
export interface Connection extends EventEmitter {
    readonly send: (msg: Message) => void;
}
export interface Message {
    readonly id: string;
    readonly method: Method;
    readonly params: any;
}
export interface LabelParams {
    readonly label: string | undefined;
}
export declare type Connector = () => Connection;
export declare class KeyringProxyClient {
    static connect(connector: Connector): Promise<KeyringProxyClient>;
    private static setupConnection;
    readonly implementationId: KeyringEntryImplementationIdString;
    readonly supportedAlgorithms: ReadonlyArray<Algorithm>;
    private readonly connection;
    constructor(connection: Connection, implementationId: KeyringEntryImplementationIdString, supportedAlgorithms: ReadonlyArray<Algorithm>);
    setLabel(label: string | undefined): Promise<void>;
}
export declare class KeyringProxyServer {
    static listen(): void;
    private readonly connection;
    private readonly keyring;
    constructor(connection: Connection, keyring: KeyringEntry);
    private handleMessage;
}
