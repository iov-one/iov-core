export function decodeHexQuantity(hexString: string): number {
  if (hexString === "0x0" || hexString === "0x00") {
    return 0;
  } else if (hexString.indexOf("0x") === 0 && hexString.indexOf("0x0") !== 0 && hexString.length > 2) {
    return parseInt(hexString, 16);
  }
  throw new Error("invalid hex quantity input");
}
