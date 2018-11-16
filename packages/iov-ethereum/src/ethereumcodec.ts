import { Algorithm, ChainId, PostableBytes, PublicKeyBundle } from "@iov/base-types";
import {
  Address,
  Nonce,
  PrehashType,
  SignableBytes,
  SignedTransaction,
  SigningJob,
  TransactionIdBytes,
  TransactionKind,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { Keccak256 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

import { encodeQuantity, encodeQuantityString, hexPadToEven, stringDataToHex } from "./utils";

// import { constants } from "./constants";
import { isValidAddress } from "./derivation";
import { Serialization } from "./serialization";

const { fromHex, toAscii, toHex } = Encoding;

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
    return {
      bytes: Serialization.serializeTransaction(unsigned, nonce) as SignableBytes,
      prehashType: PrehashType.Keccak256,
    };
  },
  bytesToPost: (signed: SignedTransaction): PostableBytes => {
    switch (signed.transaction.kind) {
      case TransactionKind.Send:
        let gasPriceHex = "0x";
        let gasLimitHex = "0x";
        let dataHex = "0x";
        let nonceHex = "0x";

        const valueHex = encodeQuantityString(
          Serialization.amountFromComponents(
            signed.transaction.amount.whole,
            signed.transaction.amount.fractional,
          ),
        );
        if (signed.primarySignature.nonce.toNumber() > 0) {
          nonceHex = encodeQuantity(signed.primarySignature.nonce.toNumber());
        }
        if (signed.transaction.gasPrice) {
          gasPriceHex = encodeQuantityString(
            Serialization.amountFromComponents(
              signed.transaction.gasPrice.whole,
              signed.transaction.gasPrice.fractional,
            ),
          );
        }
        if (signed.transaction.gasLimit) {
          gasLimitHex = encodeQuantityString(
            Serialization.amountFromComponents(
              signed.transaction.gasLimit.whole,
              signed.transaction.gasLimit.fractional,
            ),
          );
        }
        if (signed.transaction.memo) {
          dataHex = stringDataToHex(signed.transaction.memo);
        }
        if (!isValidAddress(signed.transaction.recipient)) {
          throw new Error("Invalid recipient address");
        }
        const sig = signed.primarySignature.signature;
        // FIXME: r and s are not working: invalid signature
        const r = sig.slice(0, 32);
        const s = sig.slice(32, 64);
        // TODO: find the right way to do this
        let v = Number(sig.slice(64, 65)) - 254 + 27;
        const chainId = Number(signed.transaction.chainId);
        if (chainId > 0) {
          v += chainId * 2 + 8;
        }
        const chainIdHex = encodeQuantity(v);
        const postableTx = new Uint8Array(
          Encoding.toRlp([
            Buffer.from(fromHex(hexPadToEven(nonceHex))),
            Buffer.from(fromHex(hexPadToEven(gasPriceHex))),
            Buffer.from(fromHex(hexPadToEven(gasLimitHex))),
            Buffer.from(fromHex(hexPadToEven(signed.transaction.recipient))),
            Buffer.from(fromHex(hexPadToEven(valueHex))),
            Buffer.from(fromHex(hexPadToEven(dataHex))),
            Buffer.from(fromHex(hexPadToEven(chainIdHex))),
            Buffer.from(r),
            Buffer.from(s),
          ]),
        );
        return postableTx as PostableBytes;
      default:
        throw new Error("Unsupported kind of transaction");
    }
  },
  identifier: (signed: SignedTransaction): TransactionIdBytes => {
    throw new Error(`Not implemented tx: ${signed}`);
  },
  parseBytes: (bytes: PostableBytes, chainId: ChainId): SignedTransaction => {
    throw new Error(`Not implemented bytes: ${bytes}, chainId: ${chainId}`);
  },
  keyToAddress: (pubkey: PublicKeyBundle): Address => {
    if (pubkey.algo !== Algorithm.Secp256k1 || pubkey.data.length !== 65 || pubkey.data[0] !== 0x04) {
      throw new Error(`Invalid pubkey data input: ${pubkey}`);
    }
    const hash = toHex(new Keccak256(pubkey.data.slice(1)).digest());
    const lastFortyChars = hash.slice(-40);
    const addressString = toChecksumAddress("0x" + lastFortyChars);
    return addressString as Address;
  },
  isValidAddress: isValidAddress,
};
