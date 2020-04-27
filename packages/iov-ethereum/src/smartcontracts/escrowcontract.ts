import {
  Address,
  Amount,
  BlockHeightTimeout,
  ChainId,
  Fee,
  Hash,
  isBlockHeightTimeout,
  PubkeyBundle,
  SwapId,
  SwapIdBytes,
  SwapTimeout,
  UnsignedTransaction,
} from "@iov/bcp";
import { Encoding } from "@iov/encoding";
import { isJsonRpcErrorResponse, makeJsonRpcId } from "@iov/jsonrpc";
import BN from "bn.js";

import { Abi } from "../abi";
import { pubkeyToAddress } from "../address";
import { EthereumRpcClient } from "../ethereumrpcclient";
import { EthereumRpcTransactionResult } from "../ethereumrpctransactionresult";
import {
  GenericTransactionSerializerParameters,
  SerializationCommon,
  SignedSerializationOptions,
  SwapIdPrefix,
  UnsignedSerializationOptions,
  ZERO_ETH_QUANTITY,
} from "../serializationcommon";
import { Escrow, EscrowState, SmartContractConfig, SmartContractType } from "../smartcontracts/definitions";
import { decodeHexQuantityString, normalizeHex, toEthereumHex } from "../utils";

interface EscrowBaseTransaction extends UnsignedTransaction {
  readonly sender: Address;
  readonly chainId: ChainId;
  readonly swapId: SwapId;
}

export interface EscrowOpenTransaction extends EscrowBaseTransaction {
  readonly kind: "smartcontract/escrow_open";
  readonly arbiter: Address;
  readonly hash: Hash;
  readonly timeout: SwapTimeout;
  readonly amount: Amount;
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

export function isEscrowTransaction(transaction: UnsignedTransaction): transaction is EscrowBaseTransaction {
  const { kind } = transaction;
  return kind.startsWith("smartcontract/escrow_");
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

  public static serializeUnsignedTransaction(
    unsigned: EscrowBaseTransaction,
    options: UnsignedSerializationOptions,
  ): GenericTransactionSerializerParameters {
    if (isEscrowOpenTransaction(unsigned)) {
      return this.serializeUnsignedOpenTransaction(unsigned, options);
    } else if (isEscrowAbortTransaction(unsigned)) {
      return this.serializeUnsignedAbortTransaction(unsigned, options);
    } else if (isEscrowClaimTransaction(unsigned)) {
      return this.serializeUnsignedClaimTransaction(unsigned, options);
    } else {
      throw new Error("unsupported escrow transaction kind: " + unsigned.kind);
    }
  }

  public static serializeSignedTransaction(
    unsigned: EscrowBaseTransaction,
    options: SignedSerializationOptions,
  ): GenericTransactionSerializerParameters {
    if (isEscrowOpenTransaction(unsigned)) {
      return this.serializeSignedOpenTransaction(unsigned, options);
    } else if (isEscrowAbortTransaction(unsigned)) {
      return this.serializeSignedAbortTransaction(unsigned, options);
    } else if (isEscrowClaimTransaction(unsigned)) {
      return this.serializeSignedClaimTransaction(unsigned, options);
    } else {
      throw new Error("unsupported escrow transaction kind: " + unsigned.kind);
    }
  }

  public static async getEscrowById(
    swapId: Uint8Array,
    config: SmartContractConfig,
    client: EthereumRpcClient,
  ): Promise<Escrow | null> {
    if (swapId.length !== 32) {
      throw new Error("Swap id must be 32 bytes");
    }
    if (config.type !== SmartContractType.EscrowSmartContract) {
      throw new Error("Invalid type of smart contract configured for this connection");
    }
    const data: Uint8Array = Uint8Array.from([...Abi.calculateMethodId("get(bytes32)"), ...swapId]);
    const params = [
      {
        to: config.address,
        data: toEthereumHex(data),
      },
    ] as readonly any[];
    const swapsResponse = await client.run({
      jsonrpc: "2.0",
      method: "eth_call",
      params: params,
      id: makeJsonRpcId(),
    });
    if (isJsonRpcErrorResponse(swapsResponse)) {
      throw new Error(JSON.stringify(swapsResponse.error));
    }

    if (swapsResponse.result === null) {
      return null;
    }

    const senderBegin = 0;
    const senderEnd = senderBegin + 32;
    const recipientBegin = senderEnd;
    const recipientEnd = recipientBegin + 32;
    const arbiterBegin = recipientEnd;
    const arbiterEnd = arbiterBegin + 32;
    const hashBegin = arbiterEnd;
    const hashEnd = hashBegin + 32;
    const timeoutBegin = hashEnd;
    const timeoutEnd = timeoutBegin + 32;
    const amountBegin = timeoutEnd;
    const amountEnd = amountBegin + 32;
    const stateBegin = amountEnd;
    const stateEnd = stateBegin + 32;
    const resultArray = Encoding.fromHex(normalizeHex(swapsResponse.result));
    return {
      sender: Abi.decodeAddress(resultArray.slice(senderBegin, senderEnd)),
      recipient: Abi.decodeAddress(resultArray.slice(recipientBegin, recipientEnd)),
      arbiter: Abi.decodeAddress(resultArray.slice(arbiterBegin, arbiterEnd)),
      hash: resultArray.slice(hashBegin, hashEnd) as Hash,
      amount: {
        quantity: new BN(resultArray.slice(amountBegin, amountEnd)).toString(),
        fractionalDigits: config.fractionalDigits,
        tokenTicker: config.tokenTicker,
      },
      timeout: {
        height: new BN(resultArray.slice(timeoutBegin, timeoutEnd)).toNumber(),
      },
      state: new BN(resultArray.slice(stateBegin, stateEnd)).toNumber() as EscrowState,
    };
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

  private static readonly NO_SMART_CONTRACT_ADDRESS_ERROR: Error = new Error(
    "Escrow smart contract address not set",
  );

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

  private static serializeSignedOpenTransaction(
    unsigned: EscrowOpenTransaction,
    { v, r, s, gasPriceHex, gasLimitHex, nonce, customSmartContractAddress }: SignedSerializationOptions,
  ): GenericTransactionSerializerParameters {
    const { amount } = unsigned;
    if (customSmartContractAddress === undefined) {
      throw EscrowContract.NO_SMART_CONTRACT_ADDRESS_ERROR;
    }
    return {
      nonce: nonce,
      gasPriceHex: gasPriceHex,
      gasLimitHex: gasLimitHex,
      recipient: customSmartContractAddress,
      value: amount.quantity,
      data: EscrowContract.open(unsigned.swapId, unsigned.arbiter, unsigned.hash, unsigned.timeout),
      v: v,
      r: r,
      s: s,
    };
  }

  private static serializeSignedClaimTransaction(
    unsigned: EscrowClaimTransaction,
    { v, r, s, gasPriceHex, gasLimitHex, nonce, customSmartContractAddress }: SignedSerializationOptions,
  ): GenericTransactionSerializerParameters {
    if (customSmartContractAddress === undefined) {
      throw EscrowContract.NO_SMART_CONTRACT_ADDRESS_ERROR;
    }
    return {
      nonce: nonce,
      gasPriceHex: gasPriceHex,
      gasLimitHex: gasLimitHex,
      recipient: customSmartContractAddress,
      value: ZERO_ETH_QUANTITY,
      data: EscrowContract.claim(unsigned.swapId, unsigned.recipient),
      v: v,
      r: r,
      s: s,
    };
  }

  private static serializeSignedAbortTransaction(
    unsigned: EscrowAbortTransaction,
    { v, r, s, gasPriceHex, gasLimitHex, nonce, customSmartContractAddress }: SignedSerializationOptions,
  ): GenericTransactionSerializerParameters {
    if (customSmartContractAddress === undefined) {
      throw EscrowContract.NO_SMART_CONTRACT_ADDRESS_ERROR;
    }
    return {
      nonce: nonce,
      gasPriceHex: gasPriceHex,
      gasLimitHex: gasLimitHex,
      recipient: customSmartContractAddress,
      value: ZERO_ETH_QUANTITY,
      data: EscrowContract.abort(unsigned.swapId),
      v: v,
      r: r,
      s: s,
    };
  }

  private static serializeUnsignedOpenTransaction(
    unsigned: EscrowOpenTransaction,
    {
      chainIdHex,
      gasPriceHex,
      gasLimitHex,
      nonce,
      erc20Tokens,
      customSmartContractAddress,
    }: UnsignedSerializationOptions,
  ): GenericTransactionSerializerParameters {
    if (customSmartContractAddress === undefined) {
      throw EscrowContract.NO_SMART_CONTRACT_ADDRESS_ERROR;
    }
    EscrowContract.checkOpenTransaction(unsigned);
    if (!isBlockHeightTimeout(unsigned.timeout)) {
      throw new Error("Timeout must be specified as a block height");
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (unsigned.swapId.prefix === SwapIdPrefix.Ether) {
      // native ETH swap
      SerializationCommon.checkEtherAmount([unsigned.amount]);
      const escrowOpenCall = EscrowContract.open(
        unsigned.swapId,
        unsigned.arbiter,
        unsigned.hash,
        unsigned.timeout,
      );
      return {
        nonce: nonce,
        gasPriceHex: gasPriceHex,
        gasLimitHex: gasLimitHex,
        recipient: customSmartContractAddress,
        value: unsigned.amount.quantity,
        data: escrowOpenCall,
        v: chainIdHex,
      };
    } else {
      // ERC20 swap
      SerializationCommon.checkErc20Amount([unsigned.amount], erc20Tokens);
      const escrowOpenCall = EscrowContract.open(
        unsigned.swapId,
        unsigned.arbiter,
        unsigned.hash,
        unsigned.timeout,
      );
      return {
        nonce: nonce,
        gasPriceHex: gasPriceHex,
        gasLimitHex: gasLimitHex,
        recipient: customSmartContractAddress,
        value: ZERO_ETH_QUANTITY,
        data: escrowOpenCall,
        v: chainIdHex,
      };
    }
  }

  private static serializeUnsignedClaimTransaction(
    unsigned: EscrowClaimTransaction,
    { chainIdHex, gasPriceHex, gasLimitHex, nonce, customSmartContractAddress }: UnsignedSerializationOptions,
  ): GenericTransactionSerializerParameters {
    if (customSmartContractAddress === undefined) {
      throw EscrowContract.NO_SMART_CONTRACT_ADDRESS_ERROR;
    }
    EscrowContract.checkClaimTransaction(unsigned);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (unsigned.swapId.prefix === SwapIdPrefix.Ether) {
      const escrowClaimCall = EscrowContract.claim(unsigned.swapId, unsigned.recipient);
      return {
        nonce: nonce,
        gasPriceHex: gasPriceHex,
        gasLimitHex: gasLimitHex,
        recipient: customSmartContractAddress,
        value: ZERO_ETH_QUANTITY,
        data: escrowClaimCall,
        v: chainIdHex,
      };
    } else {
      const escrowClaimCall = EscrowContract.claim(unsigned.swapId, unsigned.recipient);
      return {
        nonce: nonce,
        gasPriceHex: gasPriceHex,
        gasLimitHex: gasLimitHex,
        recipient: customSmartContractAddress,
        value: ZERO_ETH_QUANTITY,
        data: escrowClaimCall,
        v: chainIdHex,
      };
    }
  }

  private static serializeUnsignedAbortTransaction(
    unsigned: EscrowAbortTransaction,
    { chainIdHex, gasPriceHex, gasLimitHex, nonce, customSmartContractAddress }: UnsignedSerializationOptions,
  ): GenericTransactionSerializerParameters {
    if (customSmartContractAddress === undefined) {
      throw EscrowContract.NO_SMART_CONTRACT_ADDRESS_ERROR;
    }
    EscrowContract.checkAbortTransaction(unsigned);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (unsigned.swapId.prefix === SwapIdPrefix.Ether) {
      const escrowAbortCall = EscrowContract.abort(unsigned.swapId);
      return {
        nonce: nonce,
        gasPriceHex: gasPriceHex,
        gasLimitHex: gasLimitHex,
        recipient: customSmartContractAddress,
        value: ZERO_ETH_QUANTITY,
        data: escrowAbortCall,
        v: chainIdHex,
      };
    } else {
      const escrowAbortCall = EscrowContract.abort(unsigned.swapId);
      return {
        nonce: nonce,
        gasPriceHex: gasPriceHex,
        gasLimitHex: gasLimitHex,
        recipient: customSmartContractAddress,
        value: ZERO_ETH_QUANTITY,
        data: escrowAbortCall,
        v: chainIdHex,
      };
    }
  }
}
