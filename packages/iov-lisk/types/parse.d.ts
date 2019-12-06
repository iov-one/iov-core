import { Nonce } from "@iov/bcp";
import { ReadonlyDate } from "readonly-date";
export declare class Parse {
  /** validates string to be a non-negative integer and cuts leading zeros */
  static parseQuantity(quantity: string): string;
  static fromTimestamp(timestamp: number): ReadonlyDate;
  /**
   * Convert a point in time to a nonce used in the Lisk/RISE codec.
   *
   * The nonce stores a UNIX timestamp as integer in seconds resolution.
   * Since we use a Long variable, we are not affected by the year 2038 problem.
   * The full range of possible Lisk/RISE timestamps (epoch in 2016 +/- 68 years)
   * is covered since we allow negative nonce values.
   *
   * @param date the JavaScript date and time object
   */
  static timeToNonce(date: ReadonlyDate): Nonce;
}
