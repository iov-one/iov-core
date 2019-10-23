/* eslint-disable @typescript-eslint/camelcase */
import {
  Amount,
  Fee,
  FullSignature,
  isSendTransaction,
  PubkeyBundle,
  SignedTransaction,
  UnsignedTransaction,
} from "@iov/bcp";
import { Secp256k1 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import amino from "@tendermint/amino-js";

const { toBase64 } = Encoding;

export function encodePubkey(pubkey: PubkeyBundle): amino.PubKey {
  return {
    type: "tendermint/PubKeySecp256k1",
    value: toBase64(pubkey.data),
  };
}

export function encodeAmount(amount: Amount): readonly amino.Coin[] {
  return [
    {
      denom: amount.tokenTicker,
      amount: amount.quantity,
    },
  ];
}

export function encodeFee(fee: Fee): amino.StdFee {
  if (fee.tokens === undefined) {
    throw new Error("Cannot encode fee without tokens");
  }
  if (fee.gasLimit === undefined) {
    throw new Error("Cannot encode fee without gas limit");
  }
  return {
    amount: [
      {
        denom: fee.tokens.tokenTicker,
        amount: fee.tokens.quantity,
      },
    ],
    gas: fee.gasLimit,
  };
}

export function encodeFullSignature(fullSignature: FullSignature): amino.StdSignature {
  return {
    pub_key: {
      type: "tendermint/PubKeySecp256k1",
      value: toBase64(Secp256k1.compressPubkey(fullSignature.pubkey.data)),
    },
    // Recovery seems to be unused
    signature: toBase64(fullSignature.signature.slice(0, 64)),
  };
}

export function buildUnsignedTx(tx: UnsignedTransaction): amino.Tx {
  if (!isSendTransaction(tx)) {
    throw new Error("Received transaction of unsupported kind");
  }
  return {
    type: "auth/StdTx",
    value: {
      msg: [
        {
          type: "cosmos-sdk/MsgSend",
          value: {
            from_address: tx.sender,
            to_address: tx.recipient,
            amount: encodeAmount(tx.amount),
          },
        },
      ],
      memo: tx.memo,
      fee: tx.fee ? encodeFee(tx.fee) : null,
      signatures: [],
    },
  };
}

export function buildSignedTx(tx: SignedTransaction): amino.Tx {
  const signatures: readonly FullSignature[] = [tx.primarySignature, ...tx.otherSignatures];
  const built = buildUnsignedTx(tx.transaction);
  return {
    ...built,
    value: {
      ...built.value,
      signatures: signatures.map(encodeFullSignature),
    },
  };
}
