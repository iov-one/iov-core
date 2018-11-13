import { Address } from "@iov/bcp-types";
import { Keccak256 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

const { toAscii, toHex } = Encoding;

export function isValidAddress(address: string): boolean {
  // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md
  const addressLower = address.toLowerCase().replace("0x", "") as Address;
  const addressHash = toHex(new Keccak256(toAscii(addressLower)).digest());
  for (let i = 0; i < 40; i++) {
    if (
      (parseInt(addressHash[i], 16) > 7 && addressLower[i].toUpperCase() !== address[i + 2]) ||
      (parseInt(addressHash[i], 16) <= 7 && addressLower[i] !== address[i + 2])
    ) {
      return false;
    }
  }
  return true;
}
