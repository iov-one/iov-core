import { DefaultValueProducer, ValueAndUpdates } from "@iov/stream";
import TransportNodeHid, { DescriptorEvent, Subscription } from "@ledgerhq/hw-transport-node-hid";

import { appVersion } from "./app";
import { connectToFirstLedger, LedgerErrorResponse } from "./exchange";

export enum LedgerState {
  Disconnected,
  Connected,
  IovAppOpen,
}

export class StateTracker {
  private static async checkConectedAndAppOpen(): Promise<LedgerState> {
    let transport: TransportNodeHid | undefined;
    try {
      transport = await connectToFirstLedger();
    } catch (_) {
      // console.log("Error connecting to ledger: " + err);
      return LedgerState.Disconnected;
    }

    try {
      // use appVersion() as a status check: if it works, we are in the app
      // otherwise no
      await appVersion(transport);
      return LedgerState.IovAppOpen;
    } catch (error) {
      if (error instanceof LedgerErrorResponse && error.code === 0x6e00) {
        // not in app
        return LedgerState.Connected;
      } else {
        throw error;
      }
    }
  }

  public readonly state: ValueAndUpdates<LedgerState>;

  public get running(): boolean {
    return this.listeningSubscription !== undefined;
  }

  private readonly stateProducer: DefaultValueProducer<LedgerState>;
  // tslint:disable-next-line:readonly-keyword
  private listeningSubscription: Subscription | undefined;

  constructor() {
    this.stateProducer = new DefaultValueProducer(LedgerState.Disconnected);
    this.state = new ValueAndUpdates(this.stateProducer);
  }

  public start(): void {
    // tslint:disable-next-line:no-object-mutation
    this.listeningSubscription = TransportNodeHid.listen({
      next: e => this.handleEvent(e),
      error: e => {
        throw e;
      },
      complete: () => {
        throw new Error("TransportNodeHid.listen completed. What does that mean?");
      },
    });
  }

  public stop(): void {
    if (this.listeningSubscription) {
      this.listeningSubscription.unsubscribe();
      // tslint:disable-next-line:no-object-mutation
      this.listeningSubscription = undefined;
    }
    this.stateProducer.update(LedgerState.Disconnected);
  }

  /**
   * write out when we enter and leave the app
   */
  private async handleEvent(_: DescriptorEvent<string>): Promise<void> {
    this.stateProducer.update(await StateTracker.checkConectedAndAppOpen());
  }
}
