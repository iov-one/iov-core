import { Algorithm, ChainId, PostableBytes, PublicKeyBytes, SignatureBytes } from "@iov/base-types";
import { Amount, SignedTransaction, TransactionKind } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

import { constants } from "./constants";

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
  public static parseBytesTx(bytes: PostableBytes, chainId: ChainId): SignedTransaction {
    const json = JSON.parse(Encoding.fromUtf8(bytes));
    const signature = new Uint8Array([]) as SignatureBytes;
    return {
      transaction: {
        chainId: chainId,
        fee: {
          quantity: json.gasUsed,
          fractionalDigits: constants.primaryTokenFractionalDigits,
          tokenTicker: constants.primaryTokenTicker,
        },
        signer: {
          algo: Algorithm.Secp256k1,
          data: json.from,
        },
        kind: TransactionKind.Send,
        amount: {
          quantity: json.value,
          fractionalDigits: constants.primaryTokenFractionalDigits,
          tokenTicker: constants.primaryTokenTicker,
        },
        recipient: json.to,
        memo: json.input,
      },
      primarySignature: {
        nonce: json.nonce,
        // fake pubkey, we cannot know this
        pubkey: {
          algo: Algorithm.Secp256k1,
          data: new Uint8Array([]) as PublicKeyBytes,
        },
        signature: signature,
      },
      otherSignatures: [],
    };
  }
}
