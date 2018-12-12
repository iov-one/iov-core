import { Algorithm, PublicKeyBundle, SignatureBytes } from "@iov/base-types";
import {
  Amount,
  FullSignature,
  SendTransaction,
  SignedTransaction,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { Encoding, Int53 } from "@iov/encoding";

import * as codecImpl from "./generated/codecimpl";
import {
  AddAddressToUsernameTx,
  isBnsTx,
  PrivateKeyBundle,
  RegisterBlockchainTx,
  RegisterUsernameTx,
  RemoveAddressFromUsernameTx,
  SetNameTx,
  SwapClaimTx,
  SwapCounterTx,
  SwapOfferTx,
  SwapTimeoutTx,
} from "./types";
import { decodeBnsAddress, keyToAddress, preimageIdentifier } from "./util";

const { toUtf8 } = Encoding;

function encodeBoolean(value: boolean): true | undefined {
  return value ? true : undefined;
}

function encodeInt(intNumber: number): number | null {
  if (!Number.isInteger(intNumber)) {
    throw new Error("Received some kind of number that can't be encoded.");
  }

  // use null instead of 0 to not encode zero fields
  // for compatibility with golang encoder
  return intNumber || null;
}

export function encodePubkey(publicKey: PublicKeyBundle): codecImpl.crypto.IPublicKey {
  switch (publicKey.algo) {
    case Algorithm.Ed25519:
      return { ed25519: publicKey.data };
    default:
      throw new Error("unsupported algorithm: " + publicKey.algo);
  }
}

export function encodePrivkey(privateKey: PrivateKeyBundle): codecImpl.crypto.IPrivateKey {
  switch (privateKey.algo) {
    case Algorithm.Ed25519:
      return { ed25519: privateKey.data };
    default:
      throw new Error("unsupported algorithm: " + privateKey.algo);
  }
}

export function encodeAmount(amount: Amount): codecImpl.x.ICoin {
  if (amount.fractionalDigits !== 9) {
    throw new Error(`Fractional digits must be 9 but was ${amount.fractionalDigits}`);
  }

  const whole = Int53.fromString(amount.quantity.slice(0, -amount.fractionalDigits) || "0");
  const fractional = Int53.fromString(amount.quantity.slice(-amount.fractionalDigits) || "0");
  return {
    whole: encodeInt(whole.toNumber()),
    fractional: encodeInt(fractional.toNumber()),
    ticker: amount.tokenTicker,
  };
}

function encodeSignature(algo: Algorithm, bytes: SignatureBytes): codecImpl.crypto.ISignature {
  switch (algo) {
    case Algorithm.Ed25519:
      return { ed25519: bytes };
    default:
      throw new Error("unsupported algorithm: " + algo);
  }
}

export function encodeFullSignature(fullSignature: FullSignature): codecImpl.sigs.IStdSignature {
  return codecImpl.sigs.StdSignature.create({
    sequence: fullSignature.nonce.toNumber(),
    pubkey: encodePubkey(fullSignature.pubkey),
    signature: encodeSignature(fullSignature.pubkey.algo, fullSignature.signature),
  });
}

export function buildSignedTx(tx: SignedTransaction): codecImpl.app.ITx {
  const sigs: ReadonlyArray<FullSignature> = [tx.primarySignature, ...tx.otherSignatures];
  const built = buildUnsignedTx(tx.transaction);
  return { ...built, signatures: sigs.map(encodeFullSignature) };
}

export function buildUnsignedTx(tx: UnsignedTransaction): codecImpl.app.ITx {
  const msg = buildMsg(tx);
  return codecImpl.app.Tx.create({
    ...msg,
    fees: tx.fee ? { fees: encodeAmount(tx.fee) } : null,
  });
}

export function buildMsg(tx: UnsignedTransaction): codecImpl.app.ITx {
  if (!isBnsTx(tx)) {
    throw new Error("Transaction is not a BNS transaction");
  }

  switch (tx.kind) {
    case "add_address_to_username":
      return buildAddAddressToUsernameTx(tx);
    case "send":
      return buildSendTransaction(tx);
    case "set_name":
      return buildSetNameTx(tx);
    case "swap_offer":
      return buildSwapOfferTx(tx);
    case "swap_counter":
      return buildSwapCounterTx(tx);
    case "swap_claim":
      return buildSwapClaimTx(tx);
    case "swap_timeout":
      return buildSwapTimeoutTx(tx);
    case "register_blockchain":
      return buildRegisterBlockchainTx(tx);
    case "register_username":
      return buildRegisterUsernameTx(tx);
    case "remove_address_from_username":
      return buildRemoveAddressFromUsernameTx(tx);
    default:
      throw new Error("Received transacion of unsupported kind.");
  }
}

function buildAddAddressToUsernameTx(tx: AddAddressToUsernameTx): codecImpl.app.ITx {
  return {
    addUsernameAddressNftMsg: {
      id: toUtf8(tx.username),
      chainID: toUtf8(tx.payload.chainId),
      address: toUtf8(tx.payload.address),
    },
  };
}

function buildSendTransaction(tx: SendTransaction): codecImpl.app.ITx {
  return {
    sendMsg: codecImpl.cash.SendMsg.create({
      src: decodeBnsAddress(keyToAddress(tx.signer)).data,
      dest: decodeBnsAddress(tx.recipient).data,
      amount: encodeAmount(tx.amount),
      memo: tx.memo,
    }),
  };
}

function buildSetNameTx(tx: SetNameTx): codecImpl.app.ITx {
  return {
    setNameMsg: codecImpl.namecoin.SetWalletNameMsg.create({
      address: decodeBnsAddress(keyToAddress(tx.signer)).data,
      name: tx.name,
    }),
  };
}

function buildSwapOfferTx(tx: SwapOfferTx): codecImpl.app.ITx {
  const hashed = {
    ...tx,
    hashCode: preimageIdentifier(tx.preimage),
    kind: "swap_counter",
  };
  return buildSwapCounterTx(hashed as SwapCounterTx);
}

function buildSwapCounterTx(tx: SwapCounterTx): codecImpl.app.ITx {
  return {
    createEscrowMsg: codecImpl.escrow.CreateEscrowMsg.create({
      src: decodeBnsAddress(keyToAddress(tx.signer)).data,
      arbiter: tx.hashCode,
      recipient: decodeBnsAddress(tx.recipient).data,
      amount: tx.amount.map(encodeAmount),
      timeout: tx.timeout,
      memo: tx.memo,
    }),
  };
}

function buildSwapClaimTx(tx: SwapClaimTx): codecImpl.app.ITx {
  return {
    releaseEscrowMsg: codecImpl.escrow.ReleaseEscrowMsg.create({
      escrowId: tx.swapId,
    }),
    preimage: tx.preimage,
  };
}

function buildSwapTimeoutTx(tx: SwapTimeoutTx): codecImpl.app.ITx {
  return {
    returnEscrowMsg: codecImpl.escrow.ReturnEscrowMsg.create({
      escrowId: tx.swapId,
    }),
  };
}

function buildRegisterBlockchainTx(tx: RegisterBlockchainTx): codecImpl.app.ITx {
  return {
    issueBlockchainNftMsg: codecImpl.blockchain.IssueTokenMsg.create({
      id: toUtf8(tx.chain.chainId),
      owner: decodeBnsAddress(keyToAddress(tx.signer)).data,
      approvals: undefined,
      details: codecImpl.blockchain.TokenDetails.create({
        chain: codecImpl.blockchain.Chain.create({
          chainID: tx.chain.chainId,
          name: tx.chain.name,
          enabled: encodeBoolean(tx.chain.enabled),
          production: encodeBoolean(tx.chain.production),
          networkID: tx.chain.networkId,
          mainTickerID: tx.chain.mainTickerId ? toUtf8(tx.chain.mainTickerId) : undefined,
        }),
        iov: codecImpl.blockchain.IOV.create({
          codec: tx.codecName,
          codecConfig: tx.codecConfig,
        }),
      }),
    }),
  };
}

function buildRegisterUsernameTx(tx: RegisterUsernameTx): codecImpl.app.ITx {
  const chainAddresses = tx.addresses.map(
    (pair): codecImpl.username.IChainAddress => {
      return {
        chainID: toUtf8(pair.chainId),
        address: toUtf8(pair.address),
      };
    },
  );

  return {
    issueUsernameNftMsg: codecImpl.username.IssueTokenMsg.create({
      id: Encoding.toUtf8(tx.username),
      owner: decodeBnsAddress(keyToAddress(tx.signer)).data,
      approvals: undefined,
      details: codecImpl.username.TokenDetails.create({
        addresses: chainAddresses,
      }),
    }),
  };
}

function buildRemoveAddressFromUsernameTx(tx: RemoveAddressFromUsernameTx): codecImpl.app.ITx {
  return {
    removeUsernameAddressMsg: {
      id: toUtf8(tx.username),
      chainID: toUtf8(tx.payload.chainId),
      address: toUtf8(tx.payload.address),
    },
  };
}
