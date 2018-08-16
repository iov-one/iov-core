// tslint:disable:no-console
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import { Device } from "node-hid";

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
      const version = await appVersion(transport);
      console.log(`>>> Entered app (version ${version})`);
      return LedgerState.IovAppOpen;
    } catch (_) {
      // not in app
      return LedgerState.Connected;
    }
  } catch (err) {
    console.log("Error connecting to ledger: " + err);
    return LedgerState.Disconnected;
  }
}

// tslint:disable:no-let
let state: LedgerState | undefined;

/**
 * write out when we enter and leave the app
 */
async function handleEvent(e: DescriptorEvent): Promise<void> {
  // console.log(e);

  switch (e.type) {
    case "add":
      // on add, check to see if we entered the app
      state = await checkAppVersion();
      break;
    case "remove":
      state = LedgerState.Connected;
      console.log("<<< Left app", state);
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

console.log("Press ^C to exit");
