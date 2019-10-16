import {
  Address,
  Algorithm,
  ChainId,
  FullSignature,
  Nonce,
  PubkeyBundle,
  PubkeyBytes,
  SendTransaction,
  SignatureBytes,
  SignedTransaction,
  TokenTicker,
  TransactionId,
  WithCreator,
} from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import data from "./testdata/cosmoshub.json";

const { fromBase64 } = Encoding;

export const pubJson: PubkeyBundle = {
  algo: Algorithm.Secp256k1,
  data: fromBase64(data.tx.value.signatures[0].pub_key.value) as PubkeyBytes,
};

export const chainId = "cosmoshub-2" as ChainId;

export const nonce = 0 as Nonce;

export const sendTxJson: SendTransaction & WithCreator = {
  kind: "bcp/send",
  creator: {
    chainId: chainId,
    pubkey: pubJson,
  },
  sender: data.tx.value.msg[0].value.from_address as Address,
  recipient: data.tx.value.msg[0].value.to_address as Address,
  memo: data.tx.value.memo,
  amount: {
    quantity: data.tx.value.msg[0].value.amount[0].amount,
    fractionalDigits: 9,
    tokenTicker: data.tx.value.msg[0].value.amount[0].denom as TokenTicker,
  },
  fee: {
    tokens: {
      tokenTicker: data.tx.value.fee.amount[0].denom as TokenTicker,
      quantity: data.tx.value.fee.amount[0].amount,
      fractionalDigits: 9,
    },
    gasLimit: data.tx.value.fee.gas,
  },
};

export const signedTxSig: FullSignature = {
  nonce: nonce,
  pubkey: pubJson,
  signature: fromBase64(data.tx.value.signatures[0].signature) as SignatureBytes,
};

export const signedTxJson: SignedTransaction = {
  transaction: sendTxJson,
  primarySignature: signedTxSig,
  otherSignatures: [],
};

export const signedTxBin = fromBase64(data.tx_data);

export const txId = data.id as TransactionId;
