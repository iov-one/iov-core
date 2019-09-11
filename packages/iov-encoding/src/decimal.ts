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

    const parts = input.split(".");
    if (parts.length > 2) throw new Error("More than one separator found");

    const whole = parts[0] || "";
    const fractional = (parts[1] || "").replace(/0+$/, "");

    if (fractional.length > fractionalDigits) {
      throw new Error("Got more fractional digits than supported");
    }

    const quantity = `${whole}${fractional.padEnd(fractionalDigits, "0")}`;

    return new Decimal(quantity, fractionalDigits);
  }

  private readonly quantity: BN;
  private readonly fractionalDigits: number;

  private constructor(quantity: string, fractionalDigits: number) {
    this.quantity = new BN(quantity);
    this.fractionalDigits = fractionalDigits;
  }

  public getQuantity(): string {
    return this.quantity.toString();
  }
}
