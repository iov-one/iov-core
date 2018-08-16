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

// tslint:disable:no-let
let inApp = false;

// checkEvent will write out when we enter and leave the app
function checkEvent(e: DescriptorEvent): void {
  // on remove mark that we left the app when we did
  if (e.type !== "add") {
    if (inApp) {
      inApp = false;
      console.log("<<< Left app");
    }
    return;
  }

  process.nextTick(() => {
    // on add, check to see if we entered the app
    try {
      const transport = connectToFirstLedger();
      // use the function as a status check... if it works, we are in the app
      // otherwise no
      appVersion(transport)
        .then((version: number) => {
          inApp = true;
          console.log(`>>> Entered app (version ${version})`);
        })
        .catch(() => 0);
    } catch (err) {
      console.log("Error connecting to ledger: " + err);
    }
  });
}

// listen for all changed
TransportNodeHid.listen({
  next: (e: DescriptorEvent) => checkEvent(e),
  error: console.log,
  complete: () => {
    console.log("Listener finished");
    process.exit(0);
  },
});

console.log("Press any key to exit");
(process.stdin.setRawMode as any)(true);
process.stdin.resume();
process.stdin.on("data", () => process.exit(0));
