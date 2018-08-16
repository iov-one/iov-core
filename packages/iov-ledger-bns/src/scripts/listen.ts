// tslint:disable:no-console
import TransportNodeHid, { DescriptorEvent } from "@ledgerhq/hw-transport-node-hid";
import { Device } from "node-hid";

// tslint:disable-next-line:readonly-array
const events: Array<DescriptorEvent<string>> = [];

const listener = {
  next: (e: DescriptorEvent<string>) => events.push(e),
  error: console.log,
  complete: () => console.log("Listener finished"),
};

TransportNodeHid.listen(listener);

// const pprint = (e: any) => console.log(JSON.stringify(e, null, 2));

console.log("Press space to see events, any key to exit");
(process.stdin.setRawMode as any)(true);
process.stdin.resume();
process.stdin.on("data", e => {
  showAll(events);
  if (e[0] !== 0x20) {
    process.exit(0);
  }
});

const showAll = (evts: ReadonlyArray<DescriptorEvent<string>>) => console.log(evts.map(desc));

const format = (e: DescriptorEvent<string>): string => prefix(e.type) + genericDev(e.device);

const prefix = (typ: string): string => (typ === "add" ? ">> Enter " : "<< Exit ");

const genericDev = (d: Device): string =>
  JSON.stringify({
    interface: d.interface,
    usage: d.usage,
    usage_page: d.usagePage,
  });

const desc = (e: DescriptorEvent<string>): string => {
  // const dev = e.device;
  // if (!dev.usagePage) {
  //   return "** Connect **";
  // }
  // if (dev.usagePage === 64 || dev.usage === 17481) {
  //   return prefix(e.type) + "App";
  // }
  // if (dev.usage === 11825) {
  //   return "** IOV App? " + dev.usagePage;
  // }
  // if (dev.usage === 12336) {
  //   return "** Main Menu " + dev.usagePage;
  // }
  return format(e);
};

/*
Run 1:

*start in iov app:
'>> Enter {"interface":0,"usage":12336,"usage_page":12082}',
* leave iov app -> main menu:
'<< Exit {"interface":0,"usage":11825,"usage_page":14905}',
'>> Enter {"interface":0,"usage":11825,"usage_page":14905}',
* leave main menu -> iov app:
'<< Exit {"interface":0,"usage":11825,"usage_page":14905}',
'>> Enter {"interface":0,"usage":12336,"usage_page":12080}',
* leave iov app -> main menu:
'<< Exit {"interface":0,"usage":12336,"usage_page":12080}',
'>> Enter {"interface":0,"usage":12336,"usage_page":12082}',
* main menu -> settings:
* setting -> main menu:

Run 2:
* start main menu:
'>> Enter {"interface":0,"usage":11825,"usage_page":14905}',
* -> settings -> main menu:
* -> iov app
'<< Exit {"interface":0,"usage":11825,"usage_page":14905}',
'>> Enter {"interface":0,"usage":13104,"usage_page":12335}',
* leave iov app
'<< Exit {"interface":0,"usage":13104,"usage_page":12335}',
'>> Enter {"interface":0,"usage":12081,"usage_page":11825}',
* to eth app
'<< Exit {"interface":0,"usage":12081,"usage_page":11825}',
'>> Enter {"interface":0,"usage":12336,"usage_page":12082}',
* leave eth app
'<< Exit {"interface":0,"usage":12336,"usage_page":12082}',
'>> Enter {"interface":0,"usage":12336,"usage_page":12082}' ]

It seems that one cannot tell much, except a change happened.
On "enter" events, one could query the app for status

And then just check if the app is on

*/
