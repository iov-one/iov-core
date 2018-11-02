import Long from "long";

export interface Amount {
  readonly whole: number;
  readonly fractional: number;
}

export class Parse {
  public static parseAmount(str: string): Amount {
    const amount = Long.fromString(str, true, 10);
    return {
      whole: amount.divide(100000000).toNumber(),
      fractional: amount.modulo(100000000).toNumber(),
    };
  }
}
