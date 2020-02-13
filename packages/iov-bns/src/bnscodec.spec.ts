import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  Fee,
  Identity,
  Nonce,
  PostableBytes,
  PrehashType,
  PubkeyBytes,
  SendTransaction,
  SignedTransaction,
  TokenTicker,
} from "@iov/bcp";
import { Ed25519, Sha512 } from "@iov/crypto";
import { Encoding, TransactionEncoder } from "@iov/encoding";

import { bnsCodec } from "./bnscodec";
import {
  chainId,
  randomTxJson,
  sendTxJson,
  sendTxSignBytes,
  signedTxBin,
  signedTxJson,
  signedTxSig,
  swapAbortTxJson,
  swapClaimTxJson,
  swapOfferTxJson,
} from "./testdata.spec";
import { MultisignatureTx, UpdateMultisignatureTx, VoteOption, VoteTx } from "./types";
import { encodeBnsAddress } from "./util";

describe("bnscodec", () => {
  fit("generate update multisig test data", () => {
    const nonce = 71 as Nonce;
    const fee: Fee = {
      tokens: { quantity: "100000000", fractionalDigits: 9, tokenTicker: "CASH" as TokenTicker },
    };
    const participants: readonly {
      readonly participant: Identity;
    }[] = [
      // Testnet
      {
        participant: {
          chainId: "iov-exchangenet" as ChainId,
          pubkey: {
            algo: Algorithm.Ed25519,
            data: Encoding.fromHex(
              "bd59db1fb5b1c835970d33262f743f8bfc23c866aa95f16abaf72730c5388761", // alice
            ) as PubkeyBytes,
          },
        },
      },
      // Mainnet
      {
        participant: {
          chainId: "iov-mainnet" as ChainId,
          pubkey: {
            algo: Algorithm.Ed25519,
            data: Encoding.fromHex(
              "34299fa3fe218a6210ace221f86597c800ecff3d27e1e6a7937248514a6784ee",
            ) as PubkeyBytes,
          },
        },
      },
    ];

    const multisigs: readonly (readonly number[])[] = [
      [42],
      [0, Number.MAX_SAFE_INTEGER],
      [1, 123, 455, 2877],
    ];

    // tslint:disable-next-line: readonly-array
    const out: any[] = [];

    for (const { participant } of participants) {
      const newbie: Identity = {
        chainId: participant.chainId,
        pubkey: {
          algo: Algorithm.Ed25519,
          data: Encoding.fromHex(
            "a54fb18c039cee5f2b28999daca61f326e2998f67202d67ad27bcbc4e38da2ae",
          ) as PubkeyBytes,
        },
      };
      const cohorts = [
        {
          address: bnsCodec.identityToAddress(participant),
          weight: 1,
        },
        {
          address: bnsCodec.identityToAddress(newbie),
          weight: 5,
        },
      ];
      for (const multisig of multisigs) {
        const send: UpdateMultisignatureTx & MultisignatureTx = {
          kind: "bns/update_multisignature_contract",
          chainId: participant.chainId,
          contractId: new Uint8Array([0, 0, 0, 1]),
          participants: cohorts,
          activationThreshold: 2,
          adminThreshold: 3,
          multisig: multisig,
          fee: fee,
        };
        const { bytes } = bnsCodec.bytesToSign(send, nonce);
        out.push({
          transaction: TransactionEncoder.toJson(send),
          nonce: nonce,
          bytes: Encoding.toHex(bytes),
        });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require("fs");
    fs.writeFileSync("updatetx_multisig_tests.json", JSON.stringify(out, null, 2) + "\n", "utf8");
  });

  fit("generate vote test data", () => {
    const nonce = 69 as Nonce;
    const proposalId = 70;
    const fee: Fee = {
      tokens: { quantity: "100000000", fractionalDigits: 9, tokenTicker: "CASH" as TokenTicker },
    };
    const voters: readonly {
      readonly voter: Identity;
    }[] = [
      // Testnet
      {
        voter: {
          chainId: "iov-exchangenet" as ChainId,
          pubkey: {
            algo: Algorithm.Ed25519,
            data: Encoding.fromHex(
              "bd59db1fb5b1c835970d33262f743f8bfc23c866aa95f16abaf72730c5388761", // alice
            ) as PubkeyBytes,
          },
        },
      },
      // Mainnet
      {
        voter: {
          chainId: "iov-mainnet" as ChainId,
          pubkey: {
            algo: Algorithm.Ed25519,
            data: Encoding.fromHex(
              "34299fa3fe218a6210ace221f86597c800ecff3d27e1e6a7937248514a6784ee",
            ) as PubkeyBytes,
          },
        },
      },
    ];

    // tslint:disable-next-line: readonly-array
    const out: any[] = [];

    for (const { voter } of voters) {
      const address = bnsCodec.identityToAddress(voter);
      for (const selection of [VoteOption.Yes, VoteOption.No, VoteOption.Abstain]) {
        const vote: VoteTx = {
          kind: "bns/vote",
          chainId: voter.chainId,
          proposalId: proposalId,
          selection: selection,
          voter: address,
          fee: {
            ...fee,
            payer: address,
          },
        };
        const { bytes } = bnsCodec.bytesToSign(vote, nonce);
        out.push({
          transaction: TransactionEncoder.toJson(vote),
          nonce: nonce,
          bytes: Encoding.toHex(bytes),
        });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require("fs");
    fs.writeFileSync("votetx_tests.json", JSON.stringify(out, null, 2) + "\n", "utf8");
  });

  fit("generate send test data", () => {
    const nonces = [0 as Nonce, 1 as Nonce, Number.MAX_SAFE_INTEGER as Nonce] as const;
    const fees: readonly (Fee | undefined)[] = [
      undefined,
      { tokens: { quantity: "0", fractionalDigits: 9, tokenTicker: "CASH" as TokenTicker } },
      { tokens: { quantity: "100000000", fractionalDigits: 9, tokenTicker: "CASH" as TokenTicker } },
    ];
    const amounts: readonly Amount[] = [
      { quantity: "0", fractionalDigits: 9, tokenTicker: "CASH" as TokenTicker },
      { quantity: "1", fractionalDigits: 9, tokenTicker: "CASH" as TokenTicker },
      { quantity: "1000000000", fractionalDigits: 9, tokenTicker: "CASH" as TokenTicker },
      { quantity: "7400000000", fractionalDigits: 9, tokenTicker: "IOV" as TokenTicker },
    ];
    const memos: readonly (string | undefined)[] = [undefined, "", "some text", "text with emoji: 🐎"];

    const creatorRecipientPairs: readonly { readonly creator: Identity; readonly recipient: Address }[] = [
      // Local devnet
      {
        creator: {
          chainId: "local-some.Net_123" as ChainId,
          pubkey: {
            algo: Algorithm.Ed25519,
            data: Encoding.fromHex(
              "82f1a2b41db4883adc37b5bd5e742dc039a0fee677bae0d5de88f8e37a8315ed",
            ) as PubkeyBytes,
          },
        },
        recipient: "tiov17urh302j7nrz2gnufgh47qdjgnm4ywhgwzhrdf" as Address,
      },
      // Testnet
      {
        creator: {
          chainId: "iov-lovenet" as ChainId,
          pubkey: {
            algo: Algorithm.Ed25519,
            data: Encoding.fromHex(
              "fa8c2a18b2854ab65207c0c727b825b6dbaa29379e6b2bb35ac778bfaa881e92",
            ) as PubkeyBytes,
          },
        },
        recipient: encodeBnsAddress("tiov", Encoding.fromHex("0000000000000000000000000000000000000000")),
      },
      // Mainnet
      {
        creator: {
          chainId: "iov-mainnet" as ChainId,
          pubkey: {
            algo: Algorithm.Ed25519,
            data: Encoding.fromHex(
              "34299fa3fe218a6210ace221f86597c800ecff3d27e1e6a7937248514a6784ee",
            ) as PubkeyBytes,
          },
        },
        recipient: encodeBnsAddress("iov", Encoding.fromHex("020daec62066ec82a5a1b40378d87457ed88e4fc")),
      },
    ];

    // tslint:disable-next-line: readonly-array
    const out: any[] = [];

    for (const nonce of nonces) {
      for (const fee of fees) {
        for (const { creator, recipient } of creatorRecipientPairs) {
          for (const amount of amounts) {
            for (const memo of memos) {
              const send: SendTransaction = {
                kind: "bcp/send",
                chainId: creator.chainId,
                sender: bnsCodec.identityToAddress(creator),
                recipient: recipient,
                memo: memo,
                amount: amount,
                fee: fee
                  ? {
                      ...fee,
                      payer: bnsCodec.identityToAddress(creator),
                    }
                  : undefined,
              };
              const { bytes } = bnsCodec.bytesToSign(send, nonce);
              out.push({
                transaction: TransactionEncoder.toJson(send),
                nonce: nonce,
                bytes: Encoding.toHex(bytes),
              });
            }
          }
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require("fs");
    fs.writeFileSync("sendtx_tests.json", JSON.stringify(out, null, 2) + "\n", "utf8");
  });

  fit("generate multisig send test data", () => {
    const nonce = 7 as Nonce;
    const fee: Fee = {
      tokens: { quantity: "100000000", fractionalDigits: 9, tokenTicker: "CASH" as TokenTicker },
    };
    const amount: Amount = { quantity: "8900000000", fractionalDigits: 9, tokenTicker: "IOV" as TokenTicker };
    const memo =
      "A very long memo lorem ipsum lorem ipsum. A very long memo lorem ipsum lorem ipsum. A very long memo lorem ipsum lorem ipsum!!11";

    const creatorRecipientPairs: readonly {
      readonly creator: Identity;
      readonly sender: Address;
      readonly recipient: Address;
    }[] = [
      // Testnet
      {
        creator: {
          chainId: "iov-lovenet" as ChainId,
          pubkey: {
            algo: Algorithm.Ed25519,
            data: Encoding.fromHex(
              "fa8c2a18b2854ab65207c0c727b825b6dbaa29379e6b2bb35ac778bfaa881e92",
            ) as PubkeyBytes,
          },
        },
        sender: encodeBnsAddress("tiov", Encoding.fromHex("abababab111222111222111222ccccccccdddddd")), // a multisig contract
        recipient: encodeBnsAddress("tiov", Encoding.fromHex("0000000000000000000000000000000000000000")),
      },
      // Mainnet
      {
        creator: {
          chainId: "iov-mainnet" as ChainId,
          pubkey: {
            algo: Algorithm.Ed25519,
            data: Encoding.fromHex(
              "34299fa3fe218a6210ace221f86597c800ecff3d27e1e6a7937248514a6784ee",
            ) as PubkeyBytes,
          },
        },
        sender: encodeBnsAddress("iov", Encoding.fromHex("8787878787878787aaaaaaaaaaaaaaaa99999999")), // a multisig contract
        recipient: encodeBnsAddress("iov", Encoding.fromHex("020daec62066ec82a5a1b40378d87457ed88e4fc")),
      },
    ];

    const multisigs: readonly (readonly number[])[] = [
      [42],
      [0, Number.MAX_SAFE_INTEGER],
      [1, 123, 455, 2877],
    ];

    // tslint:disable-next-line: readonly-array
    const out: any[] = [];

    for (const { creator, sender, recipient } of creatorRecipientPairs) {
      for (const multisig of multisigs) {
        const send: SendTransaction & MultisignatureTx = {
          kind: "bcp/send",
          chainId: creator.chainId,
          sender: sender,
          recipient: recipient,
          multisig: multisig,
          memo: memo,
          amount: amount,
          fee: fee,
        };
        const { bytes } = bnsCodec.bytesToSign(send, nonce);
        out.push({
          transaction: TransactionEncoder.toJson(send),
          nonce: nonce,
          bytes: Encoding.toHex(bytes),
        });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require("fs");
    fs.writeFileSync("sendtx_multisig_tests.json", JSON.stringify(out, null, 2) + "\n", "utf8");
  });

  it("properly encodes transactions", () => {
    const encoded = bnsCodec.bytesToPost(signedTxJson);
    expect(encoded).toEqual(signedTxBin);
  });

  it("properly decodes transactions", () => {
    const decoded = bnsCodec.parseBytes(signedTxBin as PostableBytes, chainId);
    expect(decoded).toEqual(signedTxJson);
  });

  it("properly generates signbytes", async () => {
    const { bytes, prehashType } = bnsCodec.bytesToSign(sendTxJson, signedTxSig.nonce);

    // it should validate
    switch (prehashType) {
      case PrehashType.Sha512: {
        // testvector is a sha512 digest of our testbytes
        const prehash = new Sha512(bytes).digest();
        expect(prehash).toEqual(sendTxSignBytes);
        const pubkey = signedTxSig.pubkey.data;
        const valid = await Ed25519.verifySignature(signedTxSig.signature, prehash, pubkey);
        expect(valid).toEqual(true);
        break;
      }
      default:
        fail("Unexpected prehash type");
    }
  });

  it("generates transaction id", () => {
    const id = bnsCodec.identifier(signedTxJson);
    expect(id).toMatch(/^[0-9A-F]{64}$/);
  });

  it("round trip works", () => {
    const transactionsToBeVerified: readonly SignedTransaction[] = [
      signedTxJson,
      randomTxJson,
      swapOfferTxJson,
      swapClaimTxJson,
      swapAbortTxJson,
    ];

    for (const trial of transactionsToBeVerified) {
      const encoded = bnsCodec.bytesToPost(trial);
      const decoded = bnsCodec.parseBytes(encoded, trial.transaction.chainId);
      expect(decoded)
        .withContext(trial.transaction.kind)
        .toEqual(trial);
    }
  });
});
