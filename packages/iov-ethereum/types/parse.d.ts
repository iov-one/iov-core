import { TokenTicker } from "@iov/bcp-types";
export interface AmountFields {
    readonly whole: number;
    readonly fractional: number;
    readonly tokenTicker: TokenTicker;
}
export declare class Parse {
    static ethereumAmount(total: string): AmountFields;
}
