import { Stream } from "xstream";
import { KeyAction } from "./actions";
import { KeyEvent } from "./events";

// KeyControllerActor wraps the KeyController into an Actor interface
// This is mainly to explore ideas.
//
// Actors can receive messages and they can send messages.
// The sender cannot make a correlation between request and response
// they are just sequences of events, changes of state.
// This seems like an interesting model for loosely coupling
// independent state machines.
export interface KeyControllerActor {
  // dispatch can be registered as a subscribe to a stream of actions
  // (or multiple streams).
  // Actions are queued before handling them one by one.
  readonly dispatch: (action: KeyAction) => void;

  // listen returns the output stream of events.
  // When dispatched actions are processed, they may
  // send KeyEvents to the output stream
  readonly listen: () => Stream<KeyEvent>;
}
