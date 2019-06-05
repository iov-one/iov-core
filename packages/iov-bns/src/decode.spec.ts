import {
  Address,
  Algorithm,
  ChainId,
  Nonce,
  PublicKeyBytes,
  TokenTicker,
  UnsignedTransaction,
} from "@iov/bcp";
import { Bech32, Encoding } from "@iov/encoding";

import { decodeAmount, decodeNonce, decodeToken, decodeUsernameNft, parseMsg, parseTx } from "./decode";
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
} from "./testdata.spec";
import {
  decodePrivkey,
  decodePubkey,
  isAddAddressToUsernameTx,
  isCreateMultisignatureTx,
  isRegisterUsernameTx,
  isRemoveAddressFromUsernameTx,
  isUpdateMultisignatureTx,
  Keyed,
  Participant,
} from "./types";

const { fromHex, toUtf8 } = Encoding;

describe("Decode", () => {
  it("decodes username NFT", () => {
    const nft: codecImpl.username.IUsernameToken = {
      base: {
        id: toUtf8("alice"),
        owner: fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472"),
      },
      details: {
        addresses: [
          {
            blockchainId: toUtf8("wonderland"),
            address: "12345W",
          },
        ],
      },
    };
    const decoded = decodeUsernameNft(nft, "bns-testchain" as ChainId);
    expect(decoded.id).toEqual("alice");
    expect(decoded.owner).toEqual(Bech32.encode("tiov", fromHex("0e95c039ef14ee329d0e09d84f909cf9eb5ef472")));
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
    expect(nonce).toEqual(7 as Nonce);
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
      fractionalDigits: 9,
    });
  });

  describe("decodeAmount", () => {
    it("can decode amount 3.123456789 ASH", () => {
      const backendAmount: codecImpl.coin.ICoin = {
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
      const backendAmount: codecImpl.coin.ICoin = {
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

    it("can decode max amount 999999999999999.999999999 ASH", () => {
      // https://github.com/iov-one/weave/blob/v0.9.3/x/codec.proto#L15
      const backendAmount: codecImpl.coin.ICoin = {
        whole: 10 ** 15 - 1,
        fractional: 10 ** 9 - 1,
        ticker: "ASH",
      };
      const decoded = decodeAmount(backendAmount);
      expect(decoded).toEqual({
        quantity: "999999999999999999999999",
        fractionalDigits: 9,
        tokenTicker: "ASH" as TokenTicker,
      });
    });

    it("is compatible to test data", () => {
      const decoded = codecImpl.coin.Coin.decode(coinBin);
      const amount = decodeAmount(decoded);
      expect(amount).toEqual(coinJson);
    });

    it("throws for decoding negative amount", () => {
      // ICoin allows negative values, which are now supported client-side
      {
        // -3.0 ASH
        const backendAmount: codecImpl.coin.ICoin = {
          whole: -3,
          fractional: 0,
          ticker: "ASH",
        };
        expect(() => decodeAmount(backendAmount)).toThrowError(/`whole` must not be negative/i);
      }
      {
        // -0.123456789 ASH
        const backendAmount: codecImpl.coin.ICoin = {
          whole: 0,
          fractional: -123456789,
          ticker: "ASH",
        };
        expect(() => decodeAmount(backendAmount)).toThrowError(/`fractional` must not be negative/i);
      }
    });
  });

  describe("transactions", () => {
    it("decode invalid transaction fails", () => {
      /* tslint:disable-next-line:no-bitwise */
      const badBin = signedTxBin.map((x: number, i: number) => (i % 5 ? x ^ 0x01 : x));
      expect(() => codecImpl.app.Tx.decode(badBin)).toThrowError();
    });

    // unsigned tx will fail as parsing requires a sig to extract signer
    it("decode unsigned transaction fails", () => {
      const decoded = codecImpl.app.Tx.decode(sendTxBin);
      expect(() => parseTx(decoded, chainId)).toThrowError(/missing first signature/);
    });

    it("decode signed transaction", () => {
      const decoded = codecImpl.app.Tx.decode(signedTxBin);
      const tx = parseTx(decoded, chainId);
      expect(tx.transaction).toEqual(sendTxJson);
    });
  });

  describe("parseMsg", () => {
    const defaultBaseTx: UnsignedTransaction = {
      kind: "", // this should be overriden by parseMsg
      creator: {
        chainId: "bns-chain" as ChainId,
        pubkey: {
          algo: Algorithm.Ed25519,
          data: Encoding.fromHex("aabbccdd") as PublicKeyBytes,
        },
      },
    };

    it("works for AddAddressToUsername", () => {
      const transactionMessage: codecImpl.app.ITx = {
        addUsernameAddressNftMsg: {
          usernameId: toUtf8("alice"),
          blockchainId: toUtf8("wonderland"),
          address: "0xAABB001122DD",
        },
      };
      const parsed = parseMsg(defaultBaseTx, transactionMessage);
      if (!isAddAddressToUsernameTx(parsed)) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed.username).toEqual("alice");
      expect(parsed.payload.chainId).toEqual("wonderland");
      expect(parsed.payload.address).toEqual("0xAABB001122DD");
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
                blockchainId: Encoding.toAscii("chain1"),
                address: "23456782367823X",
              },
              {
                blockchainId: Encoding.toAscii("chain2"),
                address: "0x001100aabbccddffeeddaa8899776655",
              },
            ],
          },
        },
      };
      const parsed = parseMsg(defaultBaseTx, transactionMessage);
      if (!isRegisterUsernameTx(parsed)) {
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
          usernameId: toUtf8("alice"),
          address: "0xAABB001122DD",
          blockchainId: toUtf8("wonderland"),
        },
      };
      const parsed = parseMsg(defaultBaseTx, transactionMessage);
      if (!isRemoveAddressFromUsernameTx(parsed)) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed.username).toEqual("alice");
      expect(parsed.payload.chainId).toEqual("wonderland");
      expect(parsed.payload.address).toEqual("0xAABB001122DD");
    });

    it("works for CreateMultisignature", () => {
      // tslint:disable-next-line:readonly-array
      const iParticipants: codecImpl.multisig.IParticipant[] = [
        {
          signature: fromHex("1234567890123456789012345678901234567890"),
          weight: 4,
        },
        {
          signature: fromHex("abcdef0123abcdef0123abcdef0123abcdef0123"),
          weight: 1,
        },
        {
          signature: fromHex("9999999999999999999999999999999999999999"),
          weight: 1,
        },
      ];
      const participants: readonly Participant[] = [
        {
          address: "tiov1zg69v7yszg69v7yszg69v7yszg69v7ysy7xxgy" as Address,
          weight: 4,
        },
        {
          address: "tiov140x77qfr40x77qfr40x77qfr40x77qfrj4zpp5" as Address,
          weight: 1,
        },
        {
          address: "tiov1nxvenxvenxvenxvenxvenxvenxvenxverxe7mm" as Address,
          weight: 1,
        },
      ];
      const transactionMessage: codecImpl.app.ITx = {
        createContractMsg: {
          participants: iParticipants,
          activationThreshold: 2,
          adminThreshold: 3,
        },
      };
      const parsed = parseMsg(defaultBaseTx, transactionMessage);
      if (!isCreateMultisignatureTx(parsed)) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed.participants).toEqual(participants);
      expect(parsed.activationThreshold).toEqual(2);
      expect(parsed.adminThreshold).toEqual(3);
    });

    it("works for UpdateMultisignature", () => {
      // tslint:disable-next-line:readonly-array
      const iParticipants: codecImpl.multisig.IParticipant[] = [
        {
          signature: fromHex("1234567890123456789012345678901234567890"),
          weight: 4,
        },
        {
          signature: fromHex("abcdef0123abcdef0123abcdef0123abcdef0123"),
          weight: 1,
        },
        {
          signature: fromHex("9999999999999999999999999999999999999999"),
          weight: 1,
        },
      ];
      const participants: readonly Participant[] = [
        {
          address: "tiov1zg69v7yszg69v7yszg69v7yszg69v7ysy7xxgy" as Address,
          weight: 4,
        },
        {
          address: "tiov140x77qfr40x77qfr40x77qfr40x77qfrj4zpp5" as Address,
          weight: 1,
        },
        {
          address: "tiov1nxvenxvenxvenxvenxvenxvenxvenxverxe7mm" as Address,
          weight: 1,
        },
      ];
      const transactionMessage: codecImpl.app.ITx = {
        updateContractMsg: {
          contractId: fromHex("0123456789"),
          participants: iParticipants,
          activationThreshold: 2,
          adminThreshold: 3,
        },
      };
      const parsed = parseMsg(defaultBaseTx, transactionMessage);
      if (!isUpdateMultisignatureTx(parsed)) {
        throw new Error("unexpected transaction kind");
      }
      expect(parsed.contractId).toEqual(fromHex("0123456789"));
      expect(parsed.participants).toEqual(participants);
      expect(parsed.activationThreshold).toEqual(2);
      expect(parsed.adminThreshold).toEqual(3);
    });
  });
});
