import { Stream } from "xstream";

type Event = any;

interface Eventd {
  readonly subscriptions: Map<string, Stream<Event>>;
}