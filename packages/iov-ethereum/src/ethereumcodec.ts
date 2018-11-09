// import createKeccakHash from "keccak";

import {
  Address,
  Nonce,
  SignedTransaction,
  SigningJob,
  TransactionIdBytes,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { Keccak256 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { ChainId, PostableBytes, PublicKeyBundle } from "@iov/tendermint-types";

const { toAscii, toHex } = Encoding;

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

export const ethereumCodec: TxCodec = {
  bytesToSign: (unsigned: UnsignedTransaction, nonce: Nonce): SigningJob => {
    throw new Error(`Not implemented utx: ${unsigned}, nonce: ${nonce}`);
  },
  bytesToPost: (signed: SignedTransaction): PostableBytes => {
    throw new Error(`Not implemented tx: ${signed}`);
  },
  identifier: (signed: SignedTransaction): TransactionIdBytes => {
    throw new Error(`Not implemented tx: ${signed}`);
  },
  parseBytes: (bytes: PostableBytes, chainId: ChainId): SignedTransaction => {
    throw new Error(`Not implemented bytes: ${bytes}, chainId: ${chainId}`);
  },
  keyToAddress: (pubkey: PublicKeyBundle): Address => {
    const hash = toHex(new Keccak256(pubkey.data).digest());
    const lastFortyChars = hash.slice(-40);
    const addressString = toChecksumAddress("0x" + lastFortyChars);
    return addressString as Address;
  },
  isValidAddress: (address: string): boolean => {
    throw new Error(`Not implemented ${address}`);
  },
};
