import { ReadonlyDate } from "readonly-date";
import { Nonce, TokenTicker } from "@iov/bcp-types";
export interface AmountFields {
    readonly whole: number;
    readonly fractional: number;
    readonly tokenTicker: TokenTicker;
}
export declare class Parse {
    static liskAmount(str: string): AmountFields;
    static fromLiskTimestamp(liskTimestamp: number): ReadonlyDate;
    static timeToNonce(date: ReadonlyDate): Nonce;
}
