import { Listener, MemoryStream, Producer } from "xstream";
/**
 * A read only wrapper around DefaultValueProducer that allows
 * to synchonously get the current value using the .value property
 * and listen to to updates by suscribing to the .updates stream
 */
export declare class ValueAndUpdates<T> {
    readonly updates: MemoryStream<T>;
    readonly value: T;
    private readonly producer;
    constructor(producer: DefaultValueProducer<T>);
    waitFor(value: T): Promise<void>;
}
export declare class DefaultValueProducer<T> implements Producer<T> {
    readonly value: T;
    private internalValue;
    private listener;
    constructor(value: T);
    update(value: T): void;
    start(listener: Listener<T>): void;
    stop(): void;
}
