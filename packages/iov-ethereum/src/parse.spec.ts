import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  isSendTransaction,
  PublicKeyBytes,
  TokenTicker,
} from "@iov/bcp-types";

import { Parse, Scraper } from "./parse";

describe("Parse", () => {
  it("can parse zero amount", () => {
    const expected: Amount = {
      quantity: "0",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    };
    expect(Parse.ethereumAmount("0")).toEqual(expected);
    expect(Parse.ethereumAmount("00")).toEqual(expected);
    expect(Parse.ethereumAmount("000000000")).toEqual(expected);
  });

  it("can parse 1 ETH", () => {
    const expected: Amount = {
      quantity: "1000000000000000000",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    };
    expect(Parse.ethereumAmount("1000000000000000000")).toEqual(expected);
    expect(Parse.ethereumAmount("001000000000000000000")).toEqual(expected);
    expect(Parse.ethereumAmount("0000000001000000000000000000")).toEqual(expected);
  });

  it("can parse 10 million ETH", () => {
    const expected: Amount = {
      quantity: "10000000000000000000000000",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    };
    expect(Parse.ethereumAmount("10000000000000000000000000")).toEqual(expected);
  });

  it("can parse 100 million ETH", () => {
    const expected: Amount = {
      quantity: "100000000000000000000000000",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    };
    expect(Parse.ethereumAmount("100000000000000000000000000")).toEqual(expected);
  });

  it("can parse 1.23 ETH", () => {
    const expected: Amount = {
      quantity: "1230000000000000000",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    };
    expect(Parse.ethereumAmount("1230000000000000000")).toEqual(expected);
  });

  it("can parse 1.0023 ETH", () => {
    const expected: Amount = {
      quantity: "1002300000000000000",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    };
    expect(Parse.ethereumAmount("1002300000000000000")).toEqual(expected);
  });

  it("can parse 1.234567890123456789 ETH", () => {
    const expected: Amount = {
      quantity: "1234567890123456789",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    };
    expect(Parse.ethereumAmount("1234567890123456789")).toEqual(expected);
  });
});

describe("Scraper", () => {
  it("has working parseBytesTx()", () => {
    const chainId = "ethereum-eip155-4" as ChainId;
    const rawScraperResult = {
      blockNumber: "3660778",
      timeStamp: "1547040580",
      hash: "0xc9e539ccf0f4dd4bf68ec49895f79de7b6a39d7b5988bf78a972c0e3bee64978",
      nonce: "87",
      blockHash: "0x525cf45fd9313bdd27a877b4e7059419f09b5b34d62484ba5e3ec2cc5f0678c8",
      transactionIndex: "12",
      from: "0x0a65766695a712af41b5cfecaad217b1a11cb22a",
      to: "0x9411f2e6752f526f7bbbf66ae4d1900793af9930",
      value: "5445500",
      gas: "141000",
      gasPrice: "1000000000",
      isError: "0",
      txreceipt_status: "1",
      input: "0x6c697374656e54782829207465737420302e3136303632313235363237303537333738",
      contractAddress: "",
      cumulativeGasUsed: "4637784",
      gasUsed: "23380",
      confirmations: "1",
    };

    const signed = Scraper.parseBytesTx(rawScraperResult, chainId);
    expect(signed.primarySignature.nonce.toNumber()).toEqual(87);
    expect(signed.primarySignature.pubkey.algo).toEqual(Algorithm.Secp256k1);
    expect(signed.primarySignature.pubkey.data).toEqual(new Uint8Array([])); // not available
    expect(signed.primarySignature.signature).toEqual(new Uint8Array([])); // not available

    const unsigned = signed.transaction;
    if (!isSendTransaction(unsigned)) {
      throw new Error("Unexpected transaction type");
    }
    expect(unsigned).toEqual({
      kind: "bcp/send",
      chainId: "ethereum-eip155-4" as ChainId,
      fee: {
        quantity: "23380",
        fractionalDigits: 18,
        tokenTicker: "ETH" as TokenTicker,
      },
      signer: {
        algo: Algorithm.Secp256k1,
        data: new Uint8Array([]) as PublicKeyBytes, // unknown
      },
      amount: {
        quantity: "5445500",
        fractionalDigits: 18,
        tokenTicker: "ETH" as TokenTicker,
      },
      recipient: "0x9411f2e6752f526f7bbBf66ae4d1900793af9930" as Address,
      memo: "listenTx() test 0.16062125627057378",
    });
  });
});
