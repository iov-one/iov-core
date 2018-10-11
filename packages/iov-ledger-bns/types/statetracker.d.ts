import { ValueAndUpdates } from "@iov/stream";
export declare enum LedgerState {
    Disconnected = 0,
    Connected = 1,
    IovAppOpen = 2
}
export declare class StateTracker {
    private static checkConectedAndAppOpen;
    readonly state: ValueAndUpdates<LedgerState>;
    readonly running: boolean;
    private readonly stateProducer;
    private listeningSubscription;
    constructor();
    start(): void;
    stop(): void;
    /**
     * write out when we enter and leave the app
     */
    private handleEvent;
}
