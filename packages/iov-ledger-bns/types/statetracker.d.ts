import { ValueAndUpdates } from "@iov/keycontrol";
export declare enum LedgerState {
    Disconnected = 0,
    Connected = 1,
    IovAppOpen = 2
}
export declare class StateTracker {
    readonly state: ValueAndUpdates<LedgerState>;
    private readonly stateProducer;
    constructor();
    start(): void;
    private handleEvent;
    private isConnected;
    private checkConectedAndAppOpen;
}
