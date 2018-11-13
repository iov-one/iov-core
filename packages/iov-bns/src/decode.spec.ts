import { Address, BaseTx, TransactionKind } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { Algorithm, ChainId, PublicKeyBytes } from "@iov/tendermint-types";

import { decodeAmount, parseMsg, parseTx } from "./decode";
import * as codecImpl from "./generated/codecimpl";
import {
  chainId,
  coinBin,
  coinJson,
  privBin,
  privJson,
  pubBin,
  pubJson,
  sendTxBin,
  sendTxJson,
  signedTxBin,
} from "./testdata";
import { decodePrivkey, decodePubkey } from "./types";

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

  it("has working decodeAmount", () => {
    const decoded = codecImpl.x.Coin.decode(coinBin);
    const amount = decodeAmount(decoded);
    expect(amount).toEqual(coinJson);
  });

  describe("transactions", () => {
    it("decode invalid transaction fails", () => {
      /* tslint:disable-next-line:no-bitwise */
      const badBin = signedTxBin.map((x: number, i: number) => (i % 5 ? x ^ 0x01 : x));
      expect(codecImpl.app.Tx.decode.bind(null, badBin)).toThrowError();
    });

    // unsigned tx will fail as parsing requires a sig to extract signer
    it("decode unsigned transaction fails", () => {
      const decoded = codecImpl.app.Tx.decode(sendTxBin);
      expect(parseTx.bind(null, decoded, chainId)).toThrowError(/missing first signature/);
    });

    it("decode signed transaction", () => {
      const decoded = codecImpl.app.Tx.decode(signedTxBin);
      const tx = parseTx(decoded, chainId);
      expect(tx.transaction).toEqual(sendTxJson);
    });
  });

  describe("parseMsg", () => {
    const defaultBaseTx: BaseTx = {
      chainId: "bns-chain" as ChainId,
      signer: {
        algo: Algorithm.Ed25519,
        data: Encoding.fromHex("aabbccdd") as PublicKeyBytes,
      },
    };

    it("works for RegisterUsername", () => {
      const transactionMessage: codecImpl.app.ITx = {
        issueUsernameNftMsg: {
          id: Encoding.toAscii("Bob"),
          owner: Encoding.fromHex("0011223344556677889900112233445566778899"),
          approvals: [],
          details: {
            addresses: [
              {
                chainID: Encoding.toAscii("chain1"),
                address: Encoding.toAscii("23456782367823X"),
              },
              {
                chainID: Encoding.toAscii("chain2"),
                address: Encoding.toAscii("0x001100aabbccddffeeddaa8899776655"),
              },
            ],
          },
        },
      };
      const parsed = parseMsg(defaultBaseTx, transactionMessage);
      if (parsed.kind !== TransactionKind.RegisterUsername) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed.username).toEqual("Bob");
      expect(parsed.addresses.size).toEqual(2);
      expect(parsed.addresses.get("chain1" as ChainId)).toEqual("23456782367823X" as Address);
      expect(parsed.addresses.get("chain2" as ChainId)).toEqual(
        "0x001100aabbccddffeeddaa8899776655" as Address,
      );
    });
  });
});
