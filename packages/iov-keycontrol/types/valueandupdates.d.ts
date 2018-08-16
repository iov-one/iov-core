import { Listener, MemoryStream, Producer } from "xstream";
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
