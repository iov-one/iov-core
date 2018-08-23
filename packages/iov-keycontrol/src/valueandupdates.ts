import { Listener, MemoryStream, Producer } from "xstream";

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

// allows pre-producing values before anyone is listening
export class DefaultValueProducer<T> implements Producer<T> {
  public get value(): T {
    return this.internalValue;
  }

  // tslint:disable-next-line:readonly-keyword
  private internalValue: T;
  // tslint:disable-next-line:readonly-keyword
  private listener: Listener<T> | undefined;

  constructor(value: T) {
    this.internalValue = value;
  }

  public update(value: T): void {
    // tslint:disable-next-line:no-object-mutation
    this.internalValue = value;
    if (this.listener) {
      this.listener.next(value);
    }
  }

  public start(listener: Listener<T>): void {
    // tslint:disable-next-line:no-object-mutation
    this.listener = listener;
    listener.next(this.internalValue);
  }

  public stop(): void {
    // tslint:disable-next-line:no-object-mutation
    this.listener = undefined;
  }
}
