import { ReadonlyDate } from "readonly-date";
import { Nonce } from "@iov/bcp-types";
export declare class Parse {
    static fromLiskTimestamp(liskTimestamp: number): ReadonlyDate;
    /**
     * Convert a point in time to a nonce used in the Lisk codec.
     *
     * The nonce stores a UNIX timestamp as integer in seconds resolution.
     * Since we use a Long variable, we are not affected by the year 2038 problem.
     * The full range of possible Lisk timestamps (epoch in 2016 +/- 68 years)
     * is covered since we allow negative nonce values.
     *
     * @param date the JavaScript date and time object
     */
    static timeToNonce(date: ReadonlyDate): Nonce;
}
