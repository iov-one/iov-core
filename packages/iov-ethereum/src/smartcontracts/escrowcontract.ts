import {
  Address,
  Amount,
  BlockHeightTimeout,
  ChainId,
  Fee,
  Hash,
  PubkeyBundle,
  SwapId,
  SwapIdBytes,
  SwapTimeout,
  UnsignedTransaction,
} from "@iov/bcp";
import { Encoding } from "@iov/encoding";
import BN from "bn.js";

import { Abi } from "../abi";
import { pubkeyToAddress } from "../address";
import { EthereumRpcTransactionResult } from "../ethereumrpctransactionresult";
import { SmartContractConfig } from "../smartcontracts/definitions";
import { decodeHexQuantityString } from "../utils";

interface EscrowBaseTransaction extends UnsignedTransaction {
  readonly sender: Address;
  readonly amount: Amount;
  readonly chainId: ChainId;
  readonly swapId: SwapId;
}

export interface EscrowOpenTransaction extends EscrowBaseTransaction {
  readonly kind: "smartcontract/escrow_open";
  readonly arbiter: Address;
  readonly hash: Hash;
  readonly timeout: SwapTimeout;
}

export interface EscrowClaimTransaction extends EscrowBaseTransaction {
  readonly kind: "smartcontract/escrow_claim";
  readonly recipient: Address;
}

export interface EscrowAbortTransaction extends EscrowBaseTransaction {
  readonly kind: "smartcontract/escrow_abort";
}

export function isEscrowOpenTransaction(
  transaction: UnsignedTransaction,
): transaction is EscrowOpenTransaction {
  return (transaction as EscrowOpenTransaction).kind === "smartcontract/escrow_open";
}

export function isEscrowClaimTransaction(
  transaction: UnsignedTransaction,
): transaction is EscrowClaimTransaction {
  return (transaction as EscrowClaimTransaction).kind === "smartcontract/escrow_claim";
}

export function isEscrowAbortTransaction(
  transaction: UnsignedTransaction,
): transaction is EscrowAbortTransaction {
  return (transaction as EscrowAbortTransaction).kind === "smartcontract/escrow_abort";
}

enum EscrowContractMethod {
  Open,
  Claim,
  Abort,
}

export class EscrowContract {
  public static buildTransaction(
    input: Uint8Array,
    json: EthereumRpcTransactionResult,
    chainId: ChainId,
    fee: Fee,
    signerPubkey: PubkeyBundle,
    config: SmartContractConfig,
  ): EscrowAbortTransaction | EscrowClaimTransaction | EscrowOpenTransaction {
    // All methods
    const positionMethodIdBegin = 0;
    const positionMethodIdEnd = positionMethodIdBegin + 4;
    const positionSwapIdBegin = positionMethodIdEnd;
    const positionSwapIdEnd = positionSwapIdBegin + 32;
    // Open only
    const positionArbiterBegin = positionSwapIdEnd;
    const positionArbiterEnd = positionArbiterBegin + 32;
    const positionHashBegin = positionArbiterEnd;
    const positionHashEnd = positionArbiterEnd + 32;
    const positionTimeoutBegin = positionHashEnd;
    const positionTimeoutEnd = positionTimeoutBegin + 32;
    // Claim only
    const positionRecipientBegin = positionSwapIdEnd;
    const positionRecipientEnd = positionSwapIdEnd + 32;
    // Get method type
    const method: EscrowContractMethod = EscrowContract.getMethodTypeFromInput(
      input.slice(positionMethodIdBegin, positionMethodIdEnd),
    );
    // Extract swap id
    const swapIdWithoutPrefix = {
      data: input.slice(positionSwapIdBegin, positionSwapIdEnd) as SwapIdBytes,
    };
    // The sender is used in multiple places, so let's convert it to address once
    const sender: Address = pubkeyToAddress(signerPubkey);
    // This is a basic transaction that is common to all methods. This is
    // incomplete and the final transaction that will be returned needs more
    // information that will be decoded from the binary input
    const commonTransaction = {
      chainId: chainId,
      sender: sender,
      swapId: {
        ...swapIdWithoutPrefix,
        prefix: config.tokenType,
      },
      amount: {
        quantity: decodeHexQuantityString(json.value),
        fractionalDigits: config.fractionalDigits,
        tokenTicker: config.tokenTicker,
      },
      fee: fee,
    };

    switch (method) {
      case EscrowContractMethod.Open:
        return {
          ...commonTransaction,
          kind: "smartcontract/escrow_open",
          arbiter: Abi.decodeAddress(input.slice(positionArbiterBegin, positionArbiterEnd)),
          hash: input.slice(positionHashBegin, positionHashEnd) as Hash,
          timeout: {
            height: new BN(input.slice(positionTimeoutBegin, positionTimeoutEnd)).toNumber(),
          },
        };
      case EscrowContractMethod.Claim:
        return {
          ...commonTransaction,
          recipient: Abi.decodeAddress(input.slice(positionRecipientBegin, positionRecipientEnd)),
          kind: "smartcontract/escrow_claim",
        };
      case EscrowContractMethod.Abort:
        return {
          ...commonTransaction,
          kind: "smartcontract/escrow_abort",
        };
    }
  }

  public static checkOpenTransaction(tx: EscrowOpenTransaction): void {
    this.checkTransaction(tx);
  }

  public static checkClaimTransaction(tx: EscrowClaimTransaction): void {
    this.checkTransaction(tx);
  }

  public static checkAbortTransaction(tx: EscrowAbortTransaction): void {
    this.checkTransaction(tx);
  }

  public static abort(swapId: SwapId): Uint8Array {
    return new Uint8Array([...Abi.calculateMethodId("abort(bytes32)"), ...swapId.data]);
  }

  public static claim(swapId: SwapId, recipient: Address): Uint8Array {
    return new Uint8Array([
      ...Abi.calculateMethodId("claim(bytes32,address)"),
      ...swapId.data,
      ...Abi.encodeAddress(recipient),
    ]);
  }

  public static open(swapId: SwapId, arbiter: Address, hash: Hash, timeout: SwapTimeout): Uint8Array {
    const blockHeightTimeout = timeout as BlockHeightTimeout;
    return new Uint8Array([
      ...Abi.calculateMethodId("open(bytes32,address,bytes32,uint256)"),
      ...swapId.data,
      ...Abi.encodeAddress(arbiter),
      ...hash,
      ...Abi.encodeUint256(blockHeightTimeout.height.toString()),
    ]);
  }

  private static readonly OPEN_METHOD_ID: string = Encoding.toHex(
    Abi.calculateMethodHash("open(bytes32,address,bytes32,uint256)"),
  );

  private static readonly CLAIM_METHOD_ID: string = Encoding.toHex(
    Abi.calculateMethodHash("claim(bytes32,address)"),
  );

  private static readonly ABORT_METHOD_ID: string = Encoding.toHex(Abi.calculateMethodHash("abort(bytes32)"));

  private static readonly METHODS: { readonly [key: string]: EscrowContractMethod } = {
    [EscrowContract.OPEN_METHOD_ID]: EscrowContractMethod.Open,
    [EscrowContract.CLAIM_METHOD_ID]: EscrowContractMethod.Claim,
    [EscrowContract.ABORT_METHOD_ID]: EscrowContractMethod.Abort,
  };

  private static checkTransaction(tx: EscrowBaseTransaction): void {
    const { swapId } = tx;
    if (!swapId) {
      throw new Error("No swap ID provided");
    }
    if (swapId.data.length !== 32) {
      throw new Error("Swap ID must be 32 bytes");
    }
  }

  private static getMethodTypeFromInput(data: Uint8Array): EscrowContractMethod {
    const id: string = Encoding.toHex(data);
    const method: EscrowContractMethod | undefined = EscrowContract.METHODS[id];
    if (method === undefined) {
      throw new Error("Unknown method for escrow contract");
    }
    return method;
  }
}
