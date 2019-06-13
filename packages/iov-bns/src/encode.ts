import {
  Algorithm,
  Amount,
  FullSignature,
  isTimestampTimeout,
  PubkeyBundle,
  SendTransaction,
  SignatureBytes,
  SignedTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapOfferTransaction,
  UnsignedTransaction,
  WithCreator,
} from "@iov/bcp";
import { Encoding, Int53 } from "@iov/encoding";

import * as codecImpl from "./generated/codecimpl";
import {
  AddAddressToUsernameTx,
  CreateMultisignatureTx,
  isBnsTx,
  Participant,
  PrivkeyBundle,
  RegisterUsernameTx,
  RemoveAddressFromUsernameTx,
  UpdateMultisignatureTx,
} from "./types";
import { decodeBnsAddress, identityToAddress } from "./util";

const { toUtf8 } = Encoding;

function encodeInt(intNumber: number): number | null {
  if (!Number.isInteger(intNumber)) {
    throw new Error("Received some kind of number that can't be encoded.");
  }

  // Normalizes the zero value to null as expected by weave
  return intNumber || null;
}

function encodeString(data: string | undefined): string | null {
  // Normalizes the empty string to null as expected by weave
  return data || null;
}

export function encodePubkey(publicKey: PubkeyBundle): codecImpl.crypto.IPublicKey {
  switch (publicKey.algo) {
    case Algorithm.Ed25519:
      return { ed25519: publicKey.data };
    default:
      throw new Error("unsupported algorithm: " + publicKey.algo);
  }
}

export function encodePrivkey(privateKey: PrivkeyBundle): codecImpl.crypto.IPrivateKey {
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
  participants: readonly Participant[],
  // tslint:disable-next-line:readonly-array
): codecImpl.multisig.IParticipant[] {
  return participants.map(
    (participant): codecImpl.multisig.IParticipant => ({
      signature: decodeBnsAddress(participant.address).data,
      weight: participant.weight,
    }),
  );
}

// Token sends

function buildSendTransaction(tx: SendTransaction & WithCreator): codecImpl.app.ITx {
  const { prefix: prefix1, data: data1 } = decodeBnsAddress(identityToAddress(tx.creator));
  const { prefix: prefix2, data: data2 } = decodeBnsAddress(tx.sender);
  if (prefix1 !== prefix2 || data1.length !== data2.length || data1.some((b, i) => b !== data2[i])) {
    throw new Error("Sender and creator do not match (currently unsupported)");
  }
  return {
    sendMsg: codecImpl.cash.SendMsg.create({
      metadata: { schema: 1 },
      src: decodeBnsAddress(identityToAddress(tx.creator)).data,
      dest: decodeBnsAddress(tx.recipient).data,
      amount: encodeAmount(tx.amount),
      memo: encodeString(tx.memo),
    }),
  };
}

// Atomic swaps

function buildSwapOfferTx(tx: SwapOfferTransaction & WithCreator): codecImpl.app.ITx {
  if (!isTimestampTimeout(tx.timeout)) {
    throw new Error("Got unsupported timeout type");
  }

  return {
    createSwapMsg: codecImpl.aswap.CreateSwapMsg.create({
      metadata: { schema: 1 },
      src: decodeBnsAddress(identityToAddress(tx.creator)).data,
      preimageHash: tx.hash,
      recipient: decodeBnsAddress(tx.recipient).data,
      amount: tx.amounts.map(encodeAmount),
      timeout: encodeInt(tx.timeout.timestamp),
      memo: encodeString(tx.memo),
    }),
  };
}

function buildSwapClaimTx(tx: SwapClaimTransaction): codecImpl.app.ITx {
  return {
    releaseSwapMsg: codecImpl.aswap.ReleaseSwapMsg.create({
      metadata: { schema: 1 },
      swapId: tx.swapId.data,
      preimage: tx.preimage,
    }),
  };
}

function buildSwapAbortTransaction(tx: SwapAbortTransaction): codecImpl.app.ITx {
  return {
    returnSwapMsg: codecImpl.aswap.ReturnSwapMsg.create({
      metadata: { schema: 1 },
      swapId: tx.swapId.data,
    }),
  };
}

// Usernames

function buildRegisterUsernameTx(tx: RegisterUsernameTx & WithCreator): codecImpl.app.ITx {
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

function buildAddAddressToUsernameTx(tx: AddAddressToUsernameTx): codecImpl.app.ITx {
  return {
    addUsernameAddressNftMsg: {
      usernameId: toUtf8(tx.username),
      blockchainId: toUtf8(tx.payload.chainId),
      address: tx.payload.address,
    },
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

// Multisignature contracts

function buildCreateMultisignatureTx(tx: CreateMultisignatureTx): codecImpl.app.ITx {
  return {
    createContractMsg: {
      metadata: { schema: 1 },
      participants: encodeParticipants(tx.participants),
      activationThreshold: tx.activationThreshold,
      adminThreshold: tx.adminThreshold,
    },
  };
}

function buildUpdateMultisignatureTx(tx: UpdateMultisignatureTx): codecImpl.app.ITx {
  return {
    updateContractMsg: {
      metadata: { schema: 1 },
      contractId: tx.contractId,
      participants: encodeParticipants(tx.participants),
      activationThreshold: tx.activationThreshold,
      adminThreshold: tx.adminThreshold,
    },
  };
}

export function buildMsg(tx: UnsignedTransaction): codecImpl.app.ITx {
  if (!isBnsTx(tx)) {
    throw new Error("Transaction is not a BNS transaction");
  }

  switch (tx.kind) {
    // BCP: Token sends
    case "bcp/send":
      return buildSendTransaction(tx);

    // BCP: Atomic swaps
    case "bcp/swap_offer":
      return buildSwapOfferTx(tx);
    case "bcp/swap_claim":
      return buildSwapClaimTx(tx);
    case "bcp/swap_abort":
      return buildSwapAbortTransaction(tx);

    // BNS: Usernames
    case "bns/register_username":
      return buildRegisterUsernameTx(tx);
    case "bns/add_address_to_username":
      return buildAddAddressToUsernameTx(tx);
    case "bns/remove_address_from_username":
      return buildRemoveAddressFromUsernameTx(tx);

    // BNS: Multisignature contracts
    case "bns/create_multisignature_contract":
      return buildCreateMultisignatureTx(tx);
    case "bns/update_multisignature_contract":
      return buildUpdateMultisignatureTx(tx);

    default:
      throw new Error("Received transaction of unsupported kind.");
  }
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

export function buildSignedTx(tx: SignedTransaction): codecImpl.app.ITx {
  const sigs: readonly FullSignature[] = [tx.primarySignature, ...tx.otherSignatures];
  const built = buildUnsignedTx(tx.transaction);
  return { ...built, signatures: sigs.map(encodeFullSignature) };
}
