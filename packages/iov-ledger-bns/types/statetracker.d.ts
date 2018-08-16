import { ValueAndUpdates } from "@iov/keycontrol";
export declare enum LedgerState {
    Disconnected = 0,
    Connected = 1,
    IovAppOpen = 2
}
export declare class StateTracker {
    private static checkConectedAndAppOpen;
    readonly state: ValueAndUpdates<LedgerState>;
    private readonly stateProducer;
    constructor();
    start(): void;
    private handleEvent;
}
