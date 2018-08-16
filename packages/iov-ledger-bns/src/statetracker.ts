import { DefaultValueProducer, ValueAndUpdates } from "@iov/keycontrol";
import TransportNodeHid, { DescriptorEvent } from "@ledgerhq/hw-transport-node-hid";

import { appVersion } from "./app";
import { connectToFirstLedger } from "./exchange";

export enum LedgerState {
  Disconnected,
  Connected,
  IovAppOpen,
}

export class StateTracker {
  public readonly state: ValueAndUpdates<LedgerState>;

  private readonly stateProducer: DefaultValueProducer<LedgerState>;

  constructor() {
    this.stateProducer = new DefaultValueProducer(LedgerState.Disconnected);
    this.state = new ValueAndUpdates(this.stateProducer);
  }

  public start(): void {
    TransportNodeHid.listen({
      next: e => this.handleEvent(e),
      error: e => {
        throw e;
      },
      complete: () => {
        throw new Error("TransportNodeHid.listen completed. What does that mean?");
      },
    });
  }

  /**
   * write out when we enter and leave the app
   */
  private async handleEvent(e: DescriptorEvent<string>): Promise<void> {
    switch (e.type) {
      case "add":
        // on add, check to see if we entered the app
        this.stateProducer.update(await this.checkConectedAndAppOpen());
        break;
      case "remove":
        this.stateProducer.update(
          (await this.isConnected()) ? LedgerState.Connected : LedgerState.Disconnected,
        );
        break;
    }
  }

  private async isConnected(): Promise<boolean> {
    try {
      await connectToFirstLedger();
      return true;
    } catch (e) {
      return false;
    }
  }

  private async checkConectedAndAppOpen(): Promise<LedgerState> {
    try {
      const transport = await connectToFirstLedger();
      // use the function as a status check... if it works, we are in the app
      // otherwise no
      try {
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
}
