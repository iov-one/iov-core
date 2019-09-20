/**
 * A type for arbitrary precision, non-negative decimals.
 *
 * Instances of this class are immutable.
 */
export declare class Decimal {
  static fromUserInput(input: string, fractionalDigits: number): Decimal;
  static fromAtomics(atomics: string, fractionalDigits: number): Decimal;
  private static verifyFractionalDigits;
  readonly atomics: string;
  readonly fractionalDigits: number;
  private readonly data;
  private constructor();
  toString(): string;
}
