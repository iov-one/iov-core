import { MemoryStream } from "xstream";
import { DefaultValueProducer } from "./defaultvalueproducer";
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
