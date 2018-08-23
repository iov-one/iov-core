import { pendingWithoutLedger } from "./common.spec";
import { LedgerState, StateTracker } from "./statetracker";

describe("StateTracker", () => {
  it("can be constructed", () => {
    const tracker = new StateTracker();
    expect(tracker).toBeTruthy();
  });

  it("has initial state disconnected as long as not started", () => {
    const tracker = new StateTracker();
    expect(tracker.state.value).toEqual(LedgerState.Disconnected);
  });

  it("has running state false when created", () => {
    const tracker = new StateTracker();
    expect(tracker.running).toEqual(false);
  });

  it("has running state true when started", () => {
    const tracker = new StateTracker();
    expect(tracker.running).toEqual(false);
    tracker.start();
    expect(tracker.running).toEqual(true);
  });

  it("has running state false when stopped", () => {
    const tracker = new StateTracker();
    expect(tracker.running).toEqual(false);
    tracker.start();
    expect(tracker.running).toEqual(true);
    tracker.stop();
    expect(tracker.running).toEqual(false);
  });

  it("changes state to app open", done => {
    pendingWithoutLedger();

    const tracker = new StateTracker();
    expect(tracker.state.value).toEqual(LedgerState.Disconnected);
    tracker.state.updates.subscribe({
      next: value => {
        if (value === LedgerState.IovAppOpen) {
          tracker.stop();
          done();
        }
      },
      error: fail,
      complete: fail,
    });
    tracker.start();
  });
});
