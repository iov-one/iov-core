import { Address, Algorithm, PublicKeyBundle } from "@iov/bcp-types";
import { Keccak256 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

const { toAscii, toHex } = Encoding;

export function isValidAddress(address: string): boolean {
  if (address.match(/^0x[a-fA-F0-9]+$/) && address.length === 42) {
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
  return false;
}

export function toChecksumAddress(address: string): Address {
  // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md
  const addressLower = address.toLowerCase().replace("0x", "") as Address;
  const addressHash = toHex(new Keccak256(toAscii(addressLower)).digest());
  let checksumAddress = "0x";
  for (let i = 0; i < 40; i++) {
    checksumAddress += parseInt(addressHash[i], 16) > 7 ? addressLower[i].toUpperCase() : addressLower[i];
  }
  return checksumAddress as Address;
}

export function keyToAddress(pubkey: PublicKeyBundle): Address {
  if (pubkey.algo !== Algorithm.Secp256k1 || pubkey.data.length !== 65 || pubkey.data[0] !== 0x04) {
    throw new Error(`Invalid pubkey data input: ${pubkey}`);
  }
  const hash = toHex(new Keccak256(pubkey.data.slice(1)).digest());
  const lastFortyChars = hash.slice(-40);
  const addressString = toChecksumAddress("0x" + lastFortyChars);
  return addressString as Address;
}
