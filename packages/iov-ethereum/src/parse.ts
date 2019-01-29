import {
  Algorithm,
  Amount,
  ChainId,
  Nonce,
  PublicKeyBytes,
  SendTransaction,
  SignatureBytes,
  SignedTransaction,
} from "@iov/bcp-types";
import { Encoding, Int53 } from "@iov/encoding";

import { constants } from "./constants";
import { toChecksumAddress } from "./derivation";
import { normalizeHex } from "./utils";

export class Parse {
  public static ethereumAmount(total: string): Amount {
    if (!total.match(/^[0-9]+$/)) {
      throw new Error("Invalid string format");
    }

    // cut leading zeros
    const quantity = total.replace(/^0*/, "") || "0";

    const fractionalDigits = constants.primaryTokenFractionalDigits;
    return {
      quantity: quantity,
      fractionalDigits: fractionalDigits,
      tokenTicker: constants.primaryTokenTicker,
    };
  }
}

export class Scraper {
  public static parseBytesTx(json: any, chainId: ChainId): SignedTransaction {
    const unsigned: SendTransaction = {
      kind: "bcp/send",
      creator: {
        chainId: chainId,
        pubkey: {
          algo: Algorithm.Secp256k1,
          // we only have the address available, not the pubkey
          data: new Uint8Array([]) as PublicKeyBytes,
        },
      },
      fee: {
        quantity: json.gasUsed,
        fractionalDigits: constants.primaryTokenFractionalDigits,
        tokenTicker: constants.primaryTokenTicker,
      },
      amount: {
        quantity: json.value,
        fractionalDigits: constants.primaryTokenFractionalDigits,
        tokenTicker: constants.primaryTokenTicker,
      },
      recipient: toChecksumAddress(json.to),
      memo: Encoding.fromUtf8(Encoding.fromHex(normalizeHex(json.input))),
    };

    return {
      transaction: unsigned,
      primarySignature: {
        nonce: Int53.fromString(json.nonce) as Nonce,
        // fake pubkey and signature, we cannot know this
        pubkey: {
          algo: Algorithm.Secp256k1,
          data: new Uint8Array([]) as PublicKeyBytes,
        },
        signature: new Uint8Array([]) as SignatureBytes,
      },
      otherSignatures: [],
    };
  }
}
