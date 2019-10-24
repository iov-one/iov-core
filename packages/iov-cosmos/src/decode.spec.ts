/* eslint-disable @typescript-eslint/camelcase */
import { Address, Algorithm, ChainId, Nonce, TokenTicker } from "@iov/bcp";
import { Encoding } from "@iov/encoding";
import amino from "@tendermint/amino-js";

import {
  decodeAmount,
  decodeFullSignature,
  decodePubkey,
  decodeSignature,
  parseCreator,
  parseFee,
  parseMsg,
  parseTx,
} from "./decode";
import { signedTxJson } from "./testdata.spec";
import data from "./testdata/cosmoshub.json";

const { fromBase64 } = Encoding;

describe("decode", () => {
  const defaultPubkey = {
    algo: Algorithm.Secp256k1,
    data: fromBase64("AtQaCqFnshaZQp6rIkvAPyzThvCvXSDO+9AzbxVErqJP"),
  };
  const defaultSignature = fromBase64(
    "1nUcIH0CLT0/nQ0mBTDrT6kMG20NY/PsH7P2gc4bpYNGLEYjBmdWevXUJouSE/9A/60QG9cYeqyTe5kFDeIPxQ==",
  );
  const defaultNonce = 99 as Nonce;
  const defaultFullSignature = {
    nonce: defaultNonce,
    pubkey: defaultPubkey,
    signature: defaultSignature,
  };
  const defaultAmount = {
    fractionalDigits: 9,
    quantity: "11657995",
    tokenTicker: "uatom" as TokenTicker,
  };
  const defaultSendTransaction = {
    kind: "bcp/send" as const,
    sender: "cosmos1h806c7khnvmjlywdrkdgk2vrayy2mmvf9rxk2r" as Address,
    recipient: "cosmos1z7g5w84ynmjyg0kqpahdjqpj7yq34v3suckp0e" as Address,
    amount: defaultAmount,
  };
  const defaultFee = {
    tokens: {
      tokenTicker: "uatom" as TokenTicker,
      quantity: "5000",
      fractionalDigits: 9,
    },
    gasLimit: "200000",
  };
  const defaultChainId = "cosmoshub-2" as ChainId;
  const defaultCreator = {
    pubkey: defaultPubkey,
    chainId: defaultChainId,
  };

  describe("decodePubkey", () => {
    it("works", () => {
      const pubkey = {
        type: "tendermint/PubKeySecp256k1",
        value: "AtQaCqFnshaZQp6rIkvAPyzThvCvXSDO+9AzbxVErqJP",
      };
      expect(decodePubkey(pubkey)).toEqual(defaultPubkey);
    });
  });

  describe("decodeSignature", () => {
    it("works", () => {
      const signature =
        "1nUcIH0CLT0/nQ0mBTDrT6kMG20NY/PsH7P2gc4bpYNGLEYjBmdWevXUJouSE/9A/60QG9cYeqyTe5kFDeIPxQ==";
      expect(decodeSignature(signature)).toEqual(defaultSignature);
    });
  });

  describe("decodeFullSignature", () => {
    it("works", () => {
      const fullSignature = {
        pub_key: {
          type: "tendermint/PubKeySecp256k1",
          value: "AtQaCqFnshaZQp6rIkvAPyzThvCvXSDO+9AzbxVErqJP",
        },
        signature: "1nUcIH0CLT0/nQ0mBTDrT6kMG20NY/PsH7P2gc4bpYNGLEYjBmdWevXUJouSE/9A/60QG9cYeqyTe5kFDeIPxQ==",
      };
      expect(decodeFullSignature(fullSignature, defaultNonce)).toEqual(defaultFullSignature);
    });
  });

  describe("decodeAmount", () => {
    it("works", () => {
      const amount: readonly amino.Coin[] = [
        {
          denom: "uatom",
          amount: "11657995",
        },
      ];
      expect(decodeAmount(amount)).toEqual(defaultAmount);
    });
  });

  describe("parseMsg", () => {
    it("works", () => {
      const msg: readonly amino.Msg[] = [
        {
          type: "cosmos-sdk/MsgSend",
          value: {
            from_address: "cosmos1h806c7khnvmjlywdrkdgk2vrayy2mmvf9rxk2r",
            to_address: "cosmos1z7g5w84ynmjyg0kqpahdjqpj7yq34v3suckp0e",
            amount: [
              {
                denom: "uatom",
                amount: "11657995",
              },
            ],
          },
        },
      ];
      expect(parseMsg(msg)).toEqual(defaultSendTransaction);
    });
  });

  describe("parseFee", () => {
    it("works", () => {
      const fee = {
        amount: [
          {
            denom: "uatom",
            amount: "5000",
          },
        ],
        gas: "200000",
      };
      expect(parseFee(fee)).toEqual(defaultFee);
    });
  });

  describe("parseCreator", () => {
    it("works", () => {
      const signature = {
        pub_key: {
          type: "tendermint/PubKeySecp256k1",
          value: "AtQaCqFnshaZQp6rIkvAPyzThvCvXSDO+9AzbxVErqJP",
        },
        signature: "1nUcIH0CLT0/nQ0mBTDrT6kMG20NY/PsH7P2gc4bpYNGLEYjBmdWevXUJouSE/9A/60QG9cYeqyTe5kFDeIPxQ==",
      };
      expect(parseCreator(signature, defaultChainId)).toEqual(defaultCreator);
    });
  });

  describe("parseTx", () => {
    it("works", () => {
      expect(parseTx(data.tx, defaultChainId)).toEqual(signedTxJson);
    });
  });
});
