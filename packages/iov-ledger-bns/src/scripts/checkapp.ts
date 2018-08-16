// tslint:disable:no-console
import TransportNodeHid, { DescriptorEvent } from "@ledgerhq/hw-transport-node-hid";

import { DefaultValueProducer, ValueAndUpdates } from "@iov/keycontrol";

import { appVersion } from "../app";
import { connectToFirstLedger } from "../exchange";

function timestampedLog(data: any): void {
  console.log(`[${new Date(Date.now()).toISOString()}] ${data}`);
}

enum LedgerState {
  Disconnected,
  Connected,
  IovAppOpen,
}

async function checkAppVersion(): Promise<LedgerState> {
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

async function isConnected(): Promise<boolean> {
  try {
    await connectToFirstLedger();
    return true;
  } catch (e) {
    timestampedLog(`Error connecting to ledger: ${e}`);
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
        timestampedLog(`Ledger disconnected`);
        break;
      case LedgerState.Connected:
        timestampedLog(`Ledger connected`);
        break;
      case LedgerState.IovAppOpen:
        timestampedLog(`IOV app open`);
        break;
    }
  },
  error: console.error,
});

/**
 * write out when we enter and leave the app
 */
async function handleEvent(e: DescriptorEvent<string>): Promise<void> {
  timestampedLog(`Received event: ${e.type}`);

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
