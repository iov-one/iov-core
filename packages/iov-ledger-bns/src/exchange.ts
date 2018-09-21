import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import { Device, devices } from "node-hid";

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retry<ResultType>(
  subject: () => ResultType | undefined | Promise<ResultType | undefined>,
  retriesLeft: number,
  retryNumber: number = 1,
): Promise<ResultType | undefined> {
  if (retriesLeft <= 0) {
    return undefined;
  }

  const result = await subject();
  if (result !== undefined) {
    return result;
  } else {
    if (retriesLeft === 1) {
      // this was the last chance. Break early to avoid extra sleep
      return result;
    }

    await sleep(retryNumber * 10); // 10ms, 20ms, 30ms, 40ms, ...
    return retry(subject, retriesLeft - 1, retryNumber + 1);
  }
}

// there are more automatic ways to detect the right device also
function isDeviceLedgerNanoS(dev: Device): boolean {
  return dev.manufacturer === "Ledger" && dev.product === "Nano S";
}

export function getFirstLedgerNanoS(): Device | undefined {
  return devices()
    .filter(d => isDeviceLedgerNanoS(d) && d.path)
    .find(() => true);
}

/**
 * Tries to find a Ledger Nano S and connects to it.
 *
 * Each step is retried up to 14 times and the max sleep time per step is
 * (10+20+30+...+120+130)ms. I.e. the worst case runtime of this function is
 * about 2 seconds.
 */
export async function connectToFirstLedger(): Promise<TransportNodeHid> {
  const ledger = await retry(getFirstLedgerNanoS, 14);
  if (!ledger || !ledger.path) {
    throw new Error("No Ledger Nano S found in devices list");
  }

  const devicePath = ledger.path;
  let lastTransportOpenError: any;

  const transport = await retry(async (): Promise<TransportNodeHid | undefined> => {
    try {
      return await TransportNodeHid.open(devicePath);
    } catch (e) {
      lastTransportOpenError = e;
      return undefined;
    }
  }, 14);

  if (transport === undefined) {
    throw lastTransportOpenError;
  }

  return transport;
}

// checkAndRemoveStatus ensures the last two bytes are 0x9000
// and returns the response with status code removed,
// or throws an error if not the case
export function checkAndRemoveStatus(resp: Uint8Array): Uint8Array {
  checkStatus(resp);
  return resp.slice(0, resp.length - 2);
}

export class LedgerErrorResponse extends Error {
  constructor(public readonly code: number) {
    super("response with error code: 0x" + code.toString(16));
  }
}

// checkStatus will verify the buffer ends with 0x9000 or throw an error
function checkStatus(resp: Uint8Array): void {
  const cut = resp.length - 2;
  if (cut < 0) {
    throw new Error("response less than 2 bytes");
  }
  const status = resp[cut] * 256 + resp[cut + 1];
  if (status !== 0x9000) {
    throw new LedgerErrorResponse(status);
  }
}

// sendChunks will break the message into multiple chunks as needed
// to fit into the 255 byte packet limit. It will send one chunk if
// the payload is empty.
//
// It will fail on the first error status response.
// If there all messages are status 0x9000, it returns the
// response to the last chunk.
export async function sendChunks(
  transport: TransportNodeHid,
  appCode: number,
  cmd: number,
  payload: Uint8Array,
): Promise<Uint8Array> {
  let offset = 0;
  // loop over the non-end chunks
  while (offset + 255 < payload.length) {
    const chunk = payload.slice(offset, offset + 255);
    offset += 255;
    // flag 0x00 specifies "more", 0x80 "last chunk"
    const apdu = Buffer.concat([Buffer.from([appCode, cmd, 0x0, 0, chunk.length]), chunk]);
    const status = await transport.exchange(apdu);
    checkStatus(status);
  }
  const last = payload.slice(offset, offset + 255);
  // flag 0x00 specifies "more", 0x80 "last chunk"
  const msg = Buffer.concat([Buffer.from([appCode, cmd, 0x80, 0, last.length]), last]);

  const response = new Uint8Array(await transport.exchange(msg));

  return checkAndRemoveStatus(response);
}
