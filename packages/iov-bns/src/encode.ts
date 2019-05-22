import {
  Algorithm,
  Amount,
  FullSignature,
  isTimestampTimeout,
  PublicKeyBundle,
  SendTransaction,
  SignatureBytes,
  SignedTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapOfferTransaction,
  UnsignedTransaction,
} from "@iov/bcp";
import { Encoding, Int53 } from "@iov/encoding";

import * as codecImpl from "./generated/codecimpl";
import {
  AddAddressToUsernameTx,
  CreateMultisignatureTx,
  isBnsTx,
  Participant,
  PrivateKeyBundle,
  RegisterUsernameTx,
  RemoveAddressFromUsernameTx,
  UpdateMultisignatureTx,
} from "./types";
import { decodeBnsAddress, hashIdentifier, identityToAddress } from "./util";

const { toUtf8 } = Encoding;

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

export function encodeAmount(amount: Amount): codecImpl.coin.ICoin {
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
    sequence: fullSignature.nonce,
    pubkey: encodePubkey(fullSignature.pubkey),
    signature: encodeSignature(fullSignature.pubkey.algo, fullSignature.signature),
  });
}

export function encodeParticipants(
  participants: ReadonlyArray<Participant>,
  // tslint:disable-next-line:readonly-array
): codecImpl.multisig.IParticipant[] {
  return participants.map(participant => ({
    signature: decodeBnsAddress(participant.address).data,
    power: participant.power,
  }));
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
    fees:
      tx.fee && tx.fee.tokens
        ? {
            fees: encodeAmount(tx.fee.tokens),
            payer: decodeBnsAddress(identityToAddress(tx.creator)).data,
          }
        : null,
  });
}

export function buildMsg(tx: UnsignedTransaction): codecImpl.app.ITx {
  if (!isBnsTx(tx)) {
    throw new Error("Transaction is not a BNS transaction");
  }

  switch (tx.kind) {
    // BCP
    case "bcp/send":
      return buildSendTransaction(tx);
    case "bcp/swap_offer":
      return buildSwapOfferTx(tx);
    case "bcp/swap_claim":
      return buildSwapClaimTx(tx);
    case "bcp/swap_abort":
      return buildSwapAbortTransaction(tx);
    // BNS
    case "bns/add_address_to_username":
      return buildAddAddressToUsernameTx(tx);
    case "bns/create_multisignature_contract":
      return buildCreateMultisignatureTx(tx);
    case "bns/register_username":
      return buildRegisterUsernameTx(tx);
    case "bns/remove_address_from_username":
      return buildRemoveAddressFromUsernameTx(tx);
    case "bns/update_multisignature_contract":
      return buildUpdateMultisignatureTx(tx);

    default:
      throw new Error("Received transaction of unsupported kind.");
  }
}

function buildAddAddressToUsernameTx(tx: AddAddressToUsernameTx): codecImpl.app.ITx {
  return {
    addUsernameAddressNftMsg: {
      usernameId: toUtf8(tx.username),
      blockchainId: toUtf8(tx.payload.chainId),
      address: tx.payload.address,
    },
  };
}

function buildCreateMultisignatureTx(tx: CreateMultisignatureTx): codecImpl.app.ITx {
  return {
    createContractMsg: {
      participants: encodeParticipants(tx.participants),
      activationThreshold: tx.activationThreshold,
      adminThreshold: tx.adminThreshold,
    },
  };
}

function buildSendTransaction(tx: SendTransaction): codecImpl.app.ITx {
  return {
    sendMsg: codecImpl.cash.SendMsg.create({
      src: decodeBnsAddress(identityToAddress(tx.creator)).data,
      dest: decodeBnsAddress(tx.recipient).data,
      amount: encodeAmount(tx.amount),
      memo: tx.memo,
    }),
  };
}

function buildSwapOfferTx(tx: SwapOfferTransaction): codecImpl.app.ITx {
  if (!isTimestampTimeout(tx.timeout)) {
    throw new Error("Got unsupported timeout type");
  }

  return {
    createEscrowMsg: codecImpl.escrow.CreateEscrowMsg.create({
      src: decodeBnsAddress(identityToAddress(tx.creator)).data,
      arbiter: hashIdentifier(tx.hash),
      recipient: decodeBnsAddress(tx.recipient).data,
      amount: tx.amounts.map(encodeAmount),
      timeout: encodeInt(tx.timeout.timestamp),
      memo: tx.memo,
    }),
  };
}

function buildSwapClaimTx(tx: SwapClaimTransaction): codecImpl.app.ITx {
  return {
    releaseEscrowMsg: codecImpl.escrow.ReleaseEscrowMsg.create({
      escrowId: tx.swapId.data,
    }),
    preimage: tx.preimage,
  };
}

function buildSwapAbortTransaction(tx: SwapAbortTransaction): codecImpl.app.ITx {
  return {
    returnEscrowMsg: codecImpl.escrow.ReturnEscrowMsg.create({
      escrowId: tx.swapId.data,
    }),
  };
}

function buildRegisterUsernameTx(tx: RegisterUsernameTx): codecImpl.app.ITx {
  const chainAddresses = tx.addresses.map(
    (pair): codecImpl.username.IChainAddress => {
      return {
        blockchainId: toUtf8(pair.chainId),
        address: pair.address,
      };
    },
  );
  return {
    issueUsernameNftMsg: codecImpl.username.IssueTokenMsg.create({
      id: Encoding.toUtf8(tx.username),
      owner: decodeBnsAddress(identityToAddress(tx.creator)).data,
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
      usernameId: toUtf8(tx.username),
      blockchainId: toUtf8(tx.payload.chainId),
      address: tx.payload.address,
    },
  };
}

function buildUpdateMultisignatureTx(tx: UpdateMultisignatureTx): codecImpl.app.ITx {
  return {
    updateContractMsg: {
      contractId: tx.contractId,
      participants: encodeParticipants(tx.participants),
      activationThreshold: tx.activationThreshold,
      adminThreshold: tx.adminThreshold,
    },
  };
}
