import { MemoryStream } from "xstream";

import { DefaultValueProducer } from "./defaultvalueproducer";

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

  public waitFor(value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const subscription = this.updates.subscribe({
        next: newValue => {
          if (newValue === value) {
            resolve();

            // MemoryStream.subscribe() calls next with the last value.
            // Make async to ensure the subscription exists
            setTimeout(() => subscription.unsubscribe(), 0);
          }
        },
        complete: () => {
          subscription.unsubscribe();
          reject("Update stream completed without expected value");
        },
      });
    });
  }
}
