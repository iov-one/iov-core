import { ReadonlyDate } from "readonly-date";
import { Uint64 } from "@iov/encoding";
export declare class Serialization {
    static toTimestamp(date: ReadonlyDate): number;
    static amountFromComponents(whole: number, fractional: number): Uint64;
}
