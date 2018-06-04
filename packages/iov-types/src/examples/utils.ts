export const convertHexStringToUint8Array = (str: string): Uint8Array => {
  const buffer = Buffer.from(str, "hex");
  return Uint8Array.from(buffer);
};
