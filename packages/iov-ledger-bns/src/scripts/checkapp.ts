// tslint:disable:no-console
import { LedgerState, StateTracker } from "../statetracker";

function timestampedLog(data: any): void {
  console.log(`[${new Date(Date.now()).toISOString()}] ${data}`);
}

console.log("Press ^C to exit");

const tracker = new StateTracker();
tracker.state.updates.subscribe({
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
tracker.start();
