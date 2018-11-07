import { ReadonlyDate } from "readonly-date";

import { Address, Nonce, SendTx, SignedTransaction, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Encoding, Int53 } from "@iov/encoding";
import { Algorithm, ChainId, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";

import { transactionId } from "./serialization";

const { fromAscii, fromHex } = Encoding;

// use nethash as chain ID
const liskTestnet = "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba" as ChainId;
const liskEpochAsUnixTimestamp = 1464109200;
const emptyNonce = new Int53(0) as Nonce;

describe("transactionId", () => {
  const defaultCreationDate = new ReadonlyDate((865708731 + liskEpochAsUnixTimestamp) * 1000);

  it("can calculate ID of type 0 without memo", () => {
    const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

    const tx: SendTx = {
      chainId: liskTestnet as ChainId,
      signer: {
        algo: Algorithm.Ed25519,
        data: pubkey as PublicKeyBytes,
      },
      kind: TransactionKind.Send,
      amount: {
        whole: 1,
        fractional: 23456789,
        tokenTicker: "LSK" as TokenTicker,
      },
      recipient: "10010344879730196491L" as Address,
    };

    const signed: SignedTransaction = {
      transaction: tx,
      primarySignature: {
        nonce: emptyNonce,
        publicKey: {
          algo: Algorithm.Ed25519,
          data: pubkey as PublicKeyBytes,
        },
        signature: fromHex("26272829") as SignatureBytes,
      },
      otherSignatures: [],
    };

    const binaryId = transactionId(signed.transaction, defaultCreationDate, signed.primarySignature);
    expect(fromAscii(binaryId)).toEqual("15806479375328957764");
  });
});
