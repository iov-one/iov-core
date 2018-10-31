import Long from "long";

export class Derivation {
  public static isValidAddressWithEnding(address: string, ending: string): boolean {
    const tail = address.slice(-ending.length);
    if (tail !== ending) {
      return false;
    }
    const addressString = address.slice(0, -ending.length);
    // parse as unsigned base 10 number and verify re-encoding matches encoding
    // this is no leading zeros, no decimals, within 0 <= addressString <= 2**64-1
    const addressNumber = Long.fromString(addressString, true, 10); // true => unsigned
    return addressNumber.toString(10) === addressString;
  }
}
