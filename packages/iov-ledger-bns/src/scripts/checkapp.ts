// tslint:disable:no-console
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import { Device } from "node-hid";

import { DefaultValueProducer, ValueAndUpdates } from "@iov/keycontrol";

import { appVersion } from "../app";
import { connectToFirstLedger } from "../exchange";

/**
 * "A Descriptor is a parametric type that is up to be determined for the
 * implementation. it can be for instance an ID, an file path, a URL,..."
 *
 * @see http://ledgerhq.github.io/ledgerjs/docs/#transport
 */
type Descriptor = any;

/**
 * @see http://ledgerhq.github.io/ledgerjs/docs/#descriptorevent
 */
interface DescriptorEvent {
  readonly type: "add" | "remove";
  readonly descriptor: Descriptor;
  readonly device: Device;
}

enum LedgerState {
  Disconnected,
  Connected,
  IovAppOpen,
}

async function checkAppVersion(): Promise<LedgerState> {
  try {
    const transport = connectToFirstLedger();
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

async function isConnected(): Promise<boolean> {
  try {
    connectToFirstLedger();
    return true;
  } catch (e) {
    console.log("Error connecting to ledger: " + e);
    return false;
  }
}

console.log("Press ^C to exit");

const stateProducer = new DefaultValueProducer(LedgerState.Disconnected);
const state = new ValueAndUpdates(stateProducer);
state.updates.subscribe({
  next: value => {
    switch (value) {
      case LedgerState.Disconnected:
        console.log("Ledger disconnected");
        break;
      case LedgerState.Connected:
        console.log("Ledger connected");
        break;
      case LedgerState.IovAppOpen:
        console.log("IOV app open");
        break;
    }
  },
  error: console.error,
});

/**
 * write out when we enter and leave the app
 */
async function handleEvent(e: DescriptorEvent): Promise<void> {
  // console.log(e);

  switch (e.type) {
    case "add":
      // on add, check to see if we entered the app
      stateProducer.update(await checkAppVersion());
      break;
    case "remove":
      stateProducer.update((await isConnected()) ? LedgerState.Connected : LedgerState.Disconnected);
      break;
  }
}

// listen for all changed
TransportNodeHid.listen({
  next: handleEvent,
  error: console.log,
  complete: () => {
    console.log("Listener finished");
    process.exit(0);
  },
});
