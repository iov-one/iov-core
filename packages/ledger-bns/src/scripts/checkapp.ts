// tslint:disable:no-console
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import { Device } from "node-hid";

import { getPublicKey } from "../app";
import { connectToFirstLedger } from "../exchange";

interface Event {
  readonly type: "add" | "remove";
  readonly descriptor: string;
  readonly device: Device;
}

const listener = {
  next: (e: Event) => checkEvent(e),
  error: console.log,
  complete: () => {
    console.log("Listener finished");
    process.exit(0);
  },
};

// tslint:disable:no-let
let inApp = false;

// checkEvent will write out when we enter and leave the app
const checkEvent = (e: Event) => {
  // on remove mark that we left the app when we did
  if (e.type !== "add") {
    if (inApp) {
      inApp = false;
      console.log("<<< Left app");
    }
    return;
  }

  // on add, check to see if we entered the app
  const transport = connectToFirstLedger();
  // use the function as a status check... if it works, we are in the app
  // otherwise no
  getPublicKey(transport)
    .then(() => {
      inApp = true;
      console.log(">>> Entered app");
    })
    .catch(() => 0);
};

// listen for all changed
TransportNodeHid.listen(listener);

console.log("Press any key to exit");
(process.stdin.setRawMode as any)(true);
process.stdin.resume();
process.stdin.on("data", () => process.exit(0));
