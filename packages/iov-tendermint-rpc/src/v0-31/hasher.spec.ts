import { Encoding } from "@iov/encoding";

import { TxBytes } from "../types";

import { hashTx } from "./hasher";

describe("Hasher", () => {
  it("creates transaction hash equal to local test", () => {
    // This was taken from a result from /tx_search of some random test transaction
    // curl "http://localhost:11127/tx_search?query=\"tx.hash='5CB2CF94A1097A4BC19258BC2353C3E76102B6D528458BE45C855DC5563C1DB2'\""
    const txId = Encoding.fromHex("5CB2CF94A1097A4BC19258BC2353C3E76102B6D528458BE45C855DC5563C1DB2");
    const txData = Encoding.fromBase64("YUpxZDY2NURaUDMxPWd2TzBPdnNrVWFWYg==") as TxBytes;
    expect(hashTx(txData)).toEqual(txId);
  });
});
