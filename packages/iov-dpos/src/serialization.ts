import Long from "long";
import { ReadonlyDate } from "readonly-date";

import { Uint64 } from "@iov/encoding";

export class Serialization {
  public static toTimestamp(date: ReadonlyDate): number {
    const unixTimestamp = Math.floor(date.getTime() / 1000);

    const epoch = Date.UTC(2016, 4, 24, 17, 0, 0, 0) / 1000;
    const timestamp = unixTimestamp - epoch;

    // Timestamp must be in the signed int32 range (to be stored in a Postgres
    // integer column and to be serializeable as 4 bytes) but has no further
    // plausibility restrictions.
    // https://github.com/LiskHQ/lisk/blob/v1.0.3/logic/transaction.js#L674

    if (timestamp < -2147483648 || timestamp > 2147483647) {
      throw new Error("Timestemp not in int32 range");
    }

    return timestamp;
  }

  public static amountFromComponents(whole: number, fractional: number): Uint64 {
    // Do math on a Long (signed 64 bit integer). The max possible value is ~700 times
    // the current Lisk/RISE supply: (2**63-1) / (130_000_000 * 100_000_000) = 709.49
    const amount = Long.fromNumber(whole)
      .multiply(100000000)
      .add(fractional)
      .toBytesBE();
    return Uint64.fromBytesBigEndian(amount);
  }
}
