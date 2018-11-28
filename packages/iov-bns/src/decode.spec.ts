import { Algorithm, ChainId, PublicKeyBytes } from "@iov/base-types";
import { Address, BaseTx, Nonce, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Encoding, Int53 } from "@iov/encoding";

import {
  decodeAmount,
  decodeBlockchainNft,
  decodeNonce,
  decodeToken,
  decodeUsernameNft,
  parseMsg,
  parseTx,
} from "./decode";
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
import { decodePrivkey, decodePubkey, Keyed } from "./types";

const { fromHex, toUtf8 } = Encoding;

describe("Decode", () => {
  it("decodes blokchain NFT", () => {
    const nft: codecImpl.blockchain.IBlockchainToken = {
      base: {
        id: toUtf8("alice"),
        owner: fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472"),
      },
      details: {
        chain: {
          chainID: "wonderland",
          networkID: "7rg047g4h",
          production: false,
          enabled: true,
          mainTickerID: toUtf8("WONDER"),
          name: "Wonderland",
        },
        iov: {
          codec: "wonderland_rules",
          codecConfig: `{ rules: ["make peace not war"] }`,
        },
      },
    };
    const decoded = decodeBlockchainNft(nft);
    expect(decoded.id).toEqual("alice");
    expect(decoded.owner).toEqual(fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472"));
    expect(decoded.chain).toEqual({
      chainId: "wonderland" as ChainId,
      networkId: "7rg047g4h",
      production: false,
      enabled: true,
      mainTickerId: "WONDER" as TokenTicker,
      name: "Wonderland",
    });
    expect(decoded.codecName).toEqual("wonderland_rules");
    expect(decoded.codecConfig).toEqual(`{ rules: ["make peace not war"] }`);
  });

  it("decodes username NFT", () => {
    const nft: codecImpl.username.IUsernameToken = {
      base: {
        id: toUtf8("alice"),
        owner: fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472"),
      },
      details: {
        addresses: [
          {
            chainID: toUtf8("wonderland"),
            address: toUtf8("12345W"),
          },
        ],
      },
    };
    const decoded = decodeUsernameNft(nft);
    expect(decoded.id).toEqual("alice");
    expect(decoded.owner).toEqual(fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472"));
    expect(decoded.addresses.length).toEqual(1);
    expect(decoded.addresses[0]).toEqual({
      chainId: "wonderland" as ChainId,
      address: "12345W" as Address,
    });
  });

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

  it("has working decodeNonce", () => {
    const user: codecImpl.sigs.IUserData & Keyed = {
      _id: fromHex("1234ABCD0000AA0000FFFF0000AA00001234ABCD"),
      pubkey: {
        ed25519: fromHex("aabbccdd"),
      },
      sequence: 7,
    };
    const nonce = decodeNonce(user);
    expect(nonce).toEqual({
      address: "tiov1zg62hngqqz4qqq8lluqqp2sqqqfrf27dzrrmea" as Address,
      pubkey: {
        algo: Algorithm.Ed25519,
        data: fromHex("aabbccdd") as PublicKeyBytes,
      },
      nonce: new Int53(7) as Nonce,
    });
  });

  it("has working decodeToken", () => {
    const token: codecImpl.namecoin.IToken & Keyed = {
      _id: toUtf8("TRASH"),
      name: "Trash",
      sigFigs: 22, // Will be ignored. It is always 9.
    };
    const ticker = decodeToken(token);
    expect(ticker).toEqual({
      tokenTicker: "TRASH" as TokenTicker,
      tokenName: "Trash",
    });
  });

  describe("decodeAmount", () => {
    it("can decode amount 3.123456789 ASH", () => {
      const backendAmount: codecImpl.x.ICoin = {
        whole: 3,
        fractional: 123456789,
        ticker: "ASH",
      };
      const decoded = decodeAmount(backendAmount);
      expect(decoded).toEqual({
        quantity: "3123456789",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      });
    });

    it("can decode amount 0.000000001 ASH", () => {
      const backendAmount: codecImpl.x.ICoin = {
        whole: 0,
        fractional: 1,
        ticker: "ASH",
      };
      const decoded = decodeAmount(backendAmount);
      expect(decoded).toEqual({
        quantity: "1",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      });
    });

    it("is compatible to test data", () => {
      const decoded = codecImpl.x.Coin.decode(coinBin);
      const amount = decodeAmount(decoded);
      expect(amount).toEqual(coinJson);
    });
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

    it("works for AddAddressToUsername", () => {
      const transactionMessage: codecImpl.app.ITx = {
        addUsernameAddressNftMsg: {
          id: toUtf8("alice"),
          chainID: toUtf8("wonderland"),
          address: toUtf8("0xAABB001122DD"),
        },
      };
      const parsed = parseMsg(defaultBaseTx, transactionMessage);
      if (parsed.kind !== TransactionKind.AddAddressToUsername) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed.username).toEqual("alice");
      expect(parsed.payload.chainId).toEqual("wonderland");
      expect(parsed.payload.address).toEqual("0xAABB001122DD");
    });

    it("works for RegisterBlockchain", () => {
      const transactionMessage: codecImpl.app.ITx = {
        issueBlockchainNftMsg: {
          id: Encoding.toAscii("wonderland"),
          owner: Encoding.fromHex("0011223344556677889900112233445566778899"),
          approvals: undefined,
          details: {
            chain: {
              chainID: "wonderland",
              networkID: "7rg047g4h",
              production: false,
              enabled: true,
              mainTickerID: toUtf8("WONDER"),
              name: "Wonderland",
            },
            iov: {
              codec: "wonderland_rules",
              codecConfig: `{ rules: ["make peace not war"] }`,
            },
          },
        },
      };
      const parsed = parseMsg(defaultBaseTx, transactionMessage);
      if (parsed.kind !== TransactionKind.RegisterBlockchain) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed.chain).toEqual({
        chainId: "wonderland" as ChainId,
        networkId: "7rg047g4h",
        production: false,
        enabled: true,
        mainTickerId: "WONDER" as TokenTicker,
        name: "Wonderland",
      });
      expect(parsed.codecName).toEqual("wonderland_rules");
      expect(parsed.codecConfig).toEqual(`{ rules: ["make peace not war"] }`);
    });

    it("works for RegisterUsername", () => {
      const transactionMessage: codecImpl.app.ITx = {
        issueUsernameNftMsg: {
          id: Encoding.toAscii("bobby"),
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
      expect(parsed.username).toEqual("bobby");
      expect(parsed.addresses.length).toEqual(2);
      expect(parsed.addresses[0]).toEqual({
        chainId: "chain1" as ChainId,
        address: "23456782367823X" as Address,
      });
      expect(parsed.addresses[1]).toEqual({
        chainId: "chain2" as ChainId,
        address: "0x001100aabbccddffeeddaa8899776655" as Address,
      });
    });

    it("works for RemoveAddressFromUsername", () => {
      const transactionMessage: codecImpl.app.ITx = {
        removeUsernameAddressMsg: {
          id: toUtf8("alice"),
          address: toUtf8("0xAABB001122DD"),
          chainID: toUtf8("wonderland"),
        },
      };
      const parsed = parseMsg(defaultBaseTx, transactionMessage);
      if (parsed.kind !== TransactionKind.RemoveAddressFromUsername) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed.username).toEqual("alice");
      expect(parsed.payload.chainId).toEqual("wonderland");
      expect(parsed.payload.address).toEqual("0xAABB001122DD");
    });
  });
});
