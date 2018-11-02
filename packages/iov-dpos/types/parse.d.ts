export interface Amount {
    readonly whole: number;
    readonly fractional: number;
}
export declare class Parse {
    static parseAmount(str: string): Amount;
}
