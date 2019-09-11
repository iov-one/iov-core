/**
 * A type for arbitrary precision, non-negative decimals.
 *
 * Instances of this class are immutable.
 */
export declare class Decimal {
  static fromUserInput(input: string, fractionalDigits: number): Decimal;
  private readonly quantity;
  private readonly fractionalDigits;
  private constructor();
  getQuantity(): string;
}
