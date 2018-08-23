declare module "@ledgerhq/hw-transport-node-hid" {
  import { Device, HID } from "node-hid";

  /**
   * "A Descriptor is a parametric type that is up to be determined for the
   * implementation. It can be for instance an ID, a file path, a URL,..."
   *
   * @see http://ledgerhq.github.io/ledgerjs/docs/#transport
   * @see http://ledgerhq.github.io/ledgerjs/docs/#descriptorevent
   */
  export interface DescriptorEvent<Descriptor> {
    readonly type: "add" | "remove";
    readonly descriptor: Descriptor;
    readonly device: Device;
  }

  export interface Subscription {
    readonly unsubscribe: () => void;
  }

  interface Observer<T> {
    readonly next: (value: T) => void,
    readonly error: (error: any) => void,
    readonly complete: () => void,
  }

  class TransportNodeHid {
    static listen(observer: Observer<DescriptorEvent<string>>): Subscription;
    static open(path: string): Promise<TransportNodeHid>;

    /**
     *
     * @param device
     * @param ledgerTransport probably unused
     * @param timeout probably unused
     */
    constructor(device: HID, ledgerTransport?: boolean, timeout?: number);
    exchange(apdu: Buffer): Promise<Buffer>;
  }

  export default TransportNodeHid;
}
