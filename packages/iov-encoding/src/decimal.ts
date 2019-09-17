import BN from "bn.js";

/**
 * A type for arbitrary precision, non-negative decimals.
 *
 * Instances of this class are immutable.
 */
export class Decimal {
  public static fromUserInput(input: string, fractionalDigits: number): Decimal {
    if (!Number.isInteger(fractionalDigits)) throw new Error("Fractional digits is not an integer");
    if (fractionalDigits < 0) throw new Error("Fractional digits must not be negative");

    for (let index = 0; index < input.length; index++) {
      if (!input[index].match(/^[0-9.]$/)) {
        throw new Error(`Invalid character at position ${index + 1}`);
      }
    }

    let whole: string;
    let fractional: string;

    if (input.search(/\./) === -1) {
      // integer format, no separator
      whole = input;
      fractional = "";
    } else {
      const parts = input.split(".");
      switch (parts.length) {
        case 0:
        case 1:
          throw new Error("Less than two elements in split result. This must not happen here.");
        case 2:
          if (!parts[1]) throw new Error("Fractional part missing");
          whole = parts[0];
          fractional = parts[1].replace(/0+$/, "");
          break;
        default:
          throw new Error("More than one separator found");
      }
    }

    if (fractional.length > fractionalDigits) {
      throw new Error("Got more fractional digits than supported");
    }

    const quantity = `${whole}${fractional.padEnd(fractionalDigits, "0")}`;

    return new Decimal(quantity, fractionalDigits);
  }

  public static fromAtomics(atomics: string, fractionalDigits: number): Decimal {
    if (!Number.isInteger(fractionalDigits)) throw new Error("Fractional digits is not an integer");
    if (fractionalDigits < 0) throw new Error("Fractional digits must not be negative");
    return new Decimal(atomics, fractionalDigits);
  }

  public get atomics(): string {
    return this.data.atomics.toString();
  }

  private readonly data: {
    readonly atomics: BN;
    readonly fractionalDigits: number;
  };

  private constructor(atomics: string, fractionalDigits: number) {
    this.data = {
      atomics: new BN(atomics),
      fractionalDigits: fractionalDigits,
    };
  }

  public toString(): string {
    const factor = new BN(10).pow(new BN(this.data.fractionalDigits));
    const whole = this.data.atomics.div(factor);
    const fractional = this.data.atomics.mod(factor);

    if (fractional.isZero()) {
      return whole.toString();
    } else {
      const fullFractionalPart = fractional.toString().padStart(this.data.fractionalDigits, "0");
      const trimmedFractionalPart = fullFractionalPart.replace(/0+$/, "");
      return `${whole.toString()}.${trimmedFractionalPart}`;
    }
  }
}
