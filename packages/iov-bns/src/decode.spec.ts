import { Address, isSendTransaction, Nonce, TokenTicker } from "@iov/bcp";
import { fromHex } from "@iov/encoding";

import { decodePrivkey, decodePubkey, decodeSignedTx, decodeUserData } from "./decode";
import * as codecImpl from "./generated/codecimpl";
import {
  chainId,
  privBin,
  privJson,
  pubBin,
  pubJson,
  sendTxBin,
  sendTxJson,
  signedTxBin,
} from "./testdata.spec";
import { isMultisignatureTx } from "./types";

describe("Decode", () => {
  it("decode pubkey", () => {
    const decoded = codecImpl.crypto.PublicKey.decode(pubBin);
    const pubkey = decodePubkey(decoded);
    expect(pubkey).toEqual(pubJson);
  });

  it("decode privkey", () => {
    const decoded = codecImpl.crypto.PrivateKey.decode(privBin);
    const privkey = decodePrivkey(decoded);
    expect(privkey).toEqual(privJson);
  });

  describe("decodeUserData", () => {
    it("works", () => {
      const userData: codecImpl.sigs.IUserData = {
        pubkey: {
          ed25519: fromHex("aabbccdd"),
        },
        sequence: 7,
      };
      const decoded = decodeUserData(userData);
      expect(decoded).toEqual({
        nonce: 7 as Nonce,
      });
    });
  });

  describe("transactions", () => {
    it("decode invalid transaction fails", () => {
      /* tslint:disable-next-line:no-bitwise */
      const badBin = signedTxBin.map((x: number, i: number) => (i % 5 ? x ^ 0x01 : x));
      expect(() => codecImpl.bnsd.Tx.decode(badBin)).toThrowError();
    });

    // unsigned tx will fail as parsing requires a sig to extract signer
    it("decode unsigned transaction fails", () => {
      const decoded = codecImpl.bnsd.Tx.decode(sendTxBin);
      expect(() => decodeSignedTx(decoded, chainId)).toThrowError(/transaction has no signatures/i);
    });

    it("decode signed transaction", () => {
      const decoded = codecImpl.bnsd.Tx.decode(signedTxBin);
      const tx = decodeSignedTx(decoded, chainId);
      expect(tx.transaction).toEqual(sendTxJson);
    });

    it("decode multisig transaction", () => {
      const decoded: codecImpl.bnsd.ITx = {
        signatures: [
          {
            sequence: 0,
            pubkey: {
              ed25519: fromHex("c9df7bcba2238bedcc681e8b17bb21c1625d21d285b70c20cf53fdd473db9dfb"),
            },
            signature: {
              ed25519: fromHex(
                "7e899078b35b2d301893b82b0d840f4e1ceb715a86f4d28b2e88312ed605fea83d6b37f7ced4c8023a0d41f79ac9d5556df72c5ec58e26d7db4a6f8c6a537d0a",
              ),
            },
          },
        ],
        multisig: [fromHex("0000665544332211")],
        cashSendMsg: {
          metadata: { schema: 1 },
          source: fromHex("6e1114f57410d8e7bcd910a568c9196efc1479e4"),
          destination: fromHex("b1ca7e78f74423ae01da3b51e676934d9105f282"),
          amount: { whole: 1, fractional: 1, ticker: "CASH" },
        },
      };
      const tx = decodeSignedTx(decoded, chainId);
      if (!isSendTransaction(tx.transaction) || !isMultisignatureTx(tx.transaction)) {
        throw new Error("Expected multisignature send tx");
      }
      expect(tx.transaction).toEqual({
        kind: "bcp/send",
        chainId: chainId,
        amount: {
          quantity: "1000000001",
          fractionalDigits: 9,
          tokenTicker: "CASH" as TokenTicker,
        },
        sender: "tiov1dcg3fat5zrvw00xezzjk3jgedm7pg70y222af3" as Address,
        recipient: "tiov1k898u78hgs36uqw68dg7va5nfkgstu5z0fhz3f" as Address,
        memo: undefined,
        multisig: [112516402455057],
      });
    });
  });
});
