import { MemoryStream } from "xstream";

import { DefaultValueProducer } from "./utils";

/**
 * A read only wrapper around DefaultValueProducer that allows
 * to synchonously get the current value using the .value property
 * and listen to to updates by suscribing to the .updates stream
 */
export class ValueAndUpdates<T> {
  public readonly updates: MemoryStream<T>;

  public get value(): T {
    return this.producer.value;
  }

  private readonly producer: DefaultValueProducer<T>;

  constructor(producer: DefaultValueProducer<T>) {
    this.producer = producer;
    this.updates = MemoryStream.createWithMemory(this.producer);
  }
}
