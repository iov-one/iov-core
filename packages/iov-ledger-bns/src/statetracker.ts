import { DefaultValueProducer, ValueAndUpdates } from "@iov/keycontrol";
import TransportNodeHid, { DescriptorEvent, Subscription } from "@ledgerhq/hw-transport-node-hid";

import { appVersion } from "./app";
import { connectToFirstLedger } from "./exchange";

export enum LedgerState {
  Disconnected,
  Connected,
  IovAppOpen,
}

export class StateTracker {
  private static async checkConectedAndAppOpen(): Promise<LedgerState> {
    try {
      const transport = await connectToFirstLedger();
      try {
        // use appVersion() as a status check: if it works, we are in the app
        // otherwise no
        await appVersion(transport);
        // console.log(`>>> Entered app (version ${version})`);
        return LedgerState.IovAppOpen;
      } catch (_) {
        // not in app
        return LedgerState.Connected;
      }
    } catch (_) {
      // console.log("Error connecting to ledger: " + err);
      return LedgerState.Disconnected;
    }
  }

  public readonly state: ValueAndUpdates<LedgerState>;

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
  }

  /**
   * write out when we enter and leave the app
   */
  private async handleEvent(_: DescriptorEvent<string>): Promise<void> {
    this.stateProducer.update(await StateTracker.checkConectedAndAppOpen());
  }
}
