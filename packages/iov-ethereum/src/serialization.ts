import {
  Address,
  Amount,
  BlockHeightTimeout,
  isBlockHeightTimeout,
  isSendTransaction,
  isSwapAbortTransaction,
  isSwapClaimTransaction,
  isSwapOfferTransaction,
  Nonce,
  SendTransaction,
  SignedTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapOfferTransaction,
  SwapTransaction,
  UnsignedTransaction,
} from "@iov/bcp";
import { ExtendedSecp256k1Signature } from "@iov/crypto";
import { Encoding, Int53 } from "@iov/encoding";
import BN from "bn.js";

import { Abi } from "./abi";
import { isValidAddress, pubkeyToAddress } from "./address";
import { constants } from "./constants";
import { BlknumForkState, Eip155ChainId, eip155V, toRlp } from "./encoding";
import { Erc20ApproveTransaction, Erc20Options, Erc20TokensMap, isErc20ApproveTransaction } from "./erc20";
import {
  EscrowAbortTransaction,
  EscrowClaimTransaction,
  EscrowContract,
  EscrowOpenTransaction,
  isEscrowAbortTransaction,
  isEscrowClaimTransaction,
  isEscrowOpenTransaction,
} from "./smartcontracts/escrowcontract";
import { encodeQuantity, encodeQuantityString, fromBcpChainId, normalizeHex } from "./utils";

const { fromHex, toUtf8 } = Encoding;
const ZERO_ETH_QUANTITY = "0";

export enum SwapIdPrefix {
  Ether = "ether",
  Erc20 = "erc20",
}

interface UnsignedSerializationOptions {
  readonly chainIdHex: string;
  readonly gasPriceHex: string;
  readonly gasLimitHex: string;
  readonly nonce: Nonce;
  readonly erc20Tokens: Erc20TokensMap;
  readonly atomicSwapContractAddress?: Address;
  readonly customSmartContractAddress?: Address;
}

interface SignedSerializationOptions {
  readonly v: string;
  readonly r: Uint8Array;
  readonly s: Uint8Array;
  readonly gasPriceHex: string;
  readonly gasLimitHex: string;
  readonly nonce: Nonce;
  readonly erc20Tokens: Erc20TokensMap;
  readonly atomicSwapContractAddress?: Address;
  readonly customSmartContractAddress?: Address;
}

export class Serialization {
  public static serializeGenericTransaction(
    nonce: Nonce,
    gasPriceHex: string,
    gasLimitHex: string,
    recipient: Address,
    value: string,
    data: Uint8Array,
    v: string,
    r?: Uint8Array,
    s?: Uint8Array,
  ): Uint8Array {
    if (!isValidAddress(recipient)) {
      throw new Error("Invalid recipient address");
    }

    // Last 3 items are v, r and s values. Are present to encode full structure.
    return toRlp([
      Serialization.encodeNonce(nonce),
      fromHex(normalizeHex(gasPriceHex)),
      fromHex(normalizeHex(gasLimitHex)),
      fromHex(normalizeHex(recipient)),
      Serialization.encodeValue(value),
      data,
      fromHex(normalizeHex(v)),
      r || new Uint8Array([]),
      s || new Uint8Array([]),
    ]);
  }

  public static serializeUnsignedTransaction(
    unsigned: UnsignedTransaction,
    nonce: Nonce,
    erc20Tokens: Erc20TokensMap = new Map(),
    atomicSwapContractAddress?: Address,
    customSmartContractAddress?: Address,
  ): Uint8Array {
    const options: UnsignedSerializationOptions = {
      chainIdHex: Serialization.getChainIdHex(unsigned),
      gasPriceHex: Serialization.getGasPriceHex(unsigned),
      gasLimitHex: Serialization.getGasLimitHex(unsigned),
      nonce: nonce,
      erc20Tokens: erc20Tokens,
      atomicSwapContractAddress: atomicSwapContractAddress,
      customSmartContractAddress: customSmartContractAddress,
    };

    if (isSendTransaction(unsigned)) {
      return Serialization.serializeUnsignedSendTransaction(unsigned, options);
    } else if (isSwapOfferTransaction(unsigned)) {
      return Serialization.serializeUnsignedSwapOfferTransaction(unsigned, options);
    } else if (isSwapClaimTransaction(unsigned)) {
      return Serialization.serializeUnsignedSwapClaimTransaction(unsigned, options);
    } else if (isSwapAbortTransaction(unsigned)) {
      return Serialization.serializeUnsignedSwapAbortTransaction(unsigned, options);
    } else if (isErc20ApproveTransaction(unsigned)) {
      return Serialization.serializeUnsignedErc20ApproveTransaction(unsigned, options);
    } else if (isEscrowOpenTransaction(unsigned)) {
      return Serialization.serializeUnsignedEscrowOpenTransaction(unsigned, options);
    } else if (isEscrowClaimTransaction(unsigned)) {
      return Serialization.serializeUnsignedEscrowClaimTransaction(unsigned, options);
    } else if (isEscrowAbortTransaction(unsigned)) {
      return Serialization.serializeUnsignedEscrowAbortTransaction(unsigned, options);
    } else {
      throw new Error("Unsupported kind of transaction");
    }
  }

  public static serializeSignedTransaction(
    signed: SignedTransaction,
    erc20Tokens: Erc20TokensMap = new Map(),
    atomicSwapContractAddress?: Address,
    customSmartContractAddress?: Address,
  ): Uint8Array {
    const unsigned = signed.transaction;

    const sig = ExtendedSecp256k1Signature.fromFixedLength(signed.signatures[0].signature);
    const r = sig.r();
    const s = sig.s();
    const chainId = fromBcpChainId(unsigned.chainId);
    const chain: Eip155ChainId =
      chainId > 0
        ? { forkState: BlknumForkState.Forked, chainId: chainId }
        : { forkState: BlknumForkState.Before };
    const v = encodeQuantity(eip155V(chain, sig.recovery));

    const options: SignedSerializationOptions = {
      v: v,
      r: r,
      s: s,
      gasPriceHex: Serialization.getGasPriceHex(unsigned),
      gasLimitHex: Serialization.getGasLimitHex(unsigned),
      nonce: signed.signatures[0].nonce,
      erc20Tokens: erc20Tokens,
      atomicSwapContractAddress: atomicSwapContractAddress,
      customSmartContractAddress: customSmartContractAddress,
    };

    if (isSendTransaction(unsigned)) {
      return Serialization.serializeSignedSendTransaction(unsigned, options);
    } else if (isSwapOfferTransaction(unsigned)) {
      return Serialization.serializeSignedSwapOfferTransaction(unsigned, options);
    } else if (isSwapClaimTransaction(unsigned)) {
      return Serialization.serializeSignedSwapClaimTransaction(unsigned, options);
    } else if (isSwapAbortTransaction(unsigned)) {
      return Serialization.serializeSignedSwapAbortTransaction(unsigned, options);
    } else if (isErc20ApproveTransaction(unsigned)) {
      return Serialization.serializeSignedErc20ApproveTransaction(unsigned, options);
    } else if (isEscrowOpenTransaction(unsigned)) {
      return Serialization.serializeSignedOpenTransaction(unsigned, options);
    } else if (isEscrowClaimTransaction(unsigned)) {
      return Serialization.serializeSignedClaimTransaction(unsigned, options);
    } else if (isEscrowAbortTransaction(unsigned)) {
      return Serialization.serializeSignedAbortTransaction(unsigned, options);
    } else {
      throw new Error("Unsupported kind of transaction");
    }
  }

  private static checkSenderPubkeyMatchesSenderAddress(unsigned: SendTransaction): void {
    if (unsigned.senderPubkey?.data.length) {
      const pubkeyAddress = pubkeyToAddress(unsigned.senderPubkey);
      if (pubkeyAddress !== unsigned.sender) {
        throw new Error("Sender pubkey does not match sender address");
      }
    }
  }

  private static checkRecipientAddress(unsigned: SendTransaction | SwapOfferTransaction): void {
    if (!isValidAddress(unsigned.recipient)) {
      throw new Error("Invalid recipient address");
    }
  }

  private static checkSwapId(unsigned: SwapTransaction): void {
    if (!unsigned.swapId) {
      throw new Error("No swap ID provided");
    }
    if (unsigned.swapId.data.length !== 32) {
      throw new Error("Swap ID must be 32 bytes");
    }
  }

  private static checkHash(unsigned: SwapOfferTransaction): void {
    if (unsigned.hash.length !== 32) {
      throw new Error("Hash must be 32 bytes");
    }
  }

  private static checkPreimage(unsigned: SwapClaimTransaction): void {
    if (unsigned.preimage.length !== 32) {
      throw new Error("Preimage must be 32 bytes");
    }
  }

  private static checkAtomicSwapContractAddress(atomicSwapContractAddress?: Address): void {
    if (!atomicSwapContractAddress) {
      throw new Error("No atomic swap contract address provided");
    }
  }

  private static checkMemoNotPresent(unsigned: SendTransaction | SwapOfferTransaction): void {
    if (unsigned.memo) {
      throw new Error("Memo cannot be serialized in a smart contract-based transaction");
    }
  }

  private static checkEtherAmount(amounts: readonly Amount[]): void {
    if (amounts.length !== 1) {
      throw new Error("Cannot serialize a swap offer with more than one amount");
    }
    const { tokenTicker } = amounts[0];
    if (tokenTicker !== constants.primaryTokenTicker) {
      throw new Error("Invalid amount: Ether atomic swap must specify amount in ETH");
    }
  }

  private static checkErc20Amount(amounts: readonly Amount[], erc20Tokens: Erc20TokensMap): void {
    if (amounts.length !== 1) {
      throw new Error("Cannot serialize a swap offer with more than one amount");
    }
    const { tokenTicker } = amounts[0];
    if (!erc20Tokens.get(tokenTicker)) {
      throw new Error("Invalid amount: unknown ERC20 token");
    }
  }

  private static getChainIdHex(unsigned: UnsignedTransaction): string {
    return encodeQuantity(fromBcpChainId(unsigned.chainId));
  }

  private static getGasPriceHex(unsigned: UnsignedTransaction): string {
    if (!unsigned.fee || !unsigned.fee.gasPrice) {
      throw new Error("fee.gasPrice must be set");
    }
    return encodeQuantityString(unsigned.fee.gasPrice.quantity);
  }

  private static getGasLimitHex(unsigned: UnsignedTransaction): string {
    if (!unsigned.fee || !unsigned.fee.gasLimit) {
      throw new Error("fee.gasLimit must be set");
    }
    return encodeQuantityString(unsigned.fee.gasLimit);
  }

  private static getErc20Token(transaction: UnsignedTransaction, erc20Tokens: Erc20TokensMap): Erc20Options {
    let erc20Token: Erc20Options | undefined;
    let ticker: string;
    if (isSendTransaction(transaction) || isErc20ApproveTransaction(transaction)) {
      erc20Token = erc20Tokens.get(transaction.amount.tokenTicker);
      ticker = transaction.amount.tokenTicker;
    } else if (isSwapOfferTransaction(transaction)) {
      erc20Token = erc20Tokens.get(transaction.amounts[0].tokenTicker);
      ticker = transaction.amounts[0].tokenTicker;
    } else {
      throw new Error("Cannot get ERC20 token for unsupported transaction type");
    }
    if (!erc20Token) {
      throw new Error(`No ERC20 token configured for ticker ${ticker}`);
    }
    return erc20Token;
  }

  /**
   * Nonce 0 must be represented as 0x instead of 0x0 for some strange reason
   */
  private static encodeNonce(nonce: Nonce): Uint8Array {
    const checkedNonce = new Int53(nonce);

    if (checkedNonce.toNumber() === 0) {
      return new Uint8Array([]);
    } else {
      return fromHex(normalizeHex(encodeQuantity(checkedNonce.toNumber())));
    }
  }

  /**
   * Value 0 must be represented as 0x instead of 0x0 for some strange reason
   */
  private static encodeValue(value: string): Uint8Array {
    if (!value.match(/^[0-9]+$/)) {
      throw new Error("Invalid string format");
    }
    const numericValue = new BN(value, 10);

    if (numericValue.isZero()) {
      return new Uint8Array([]);
    } else {
      return Uint8Array.from(numericValue.toArray("be"));
    }
  }

  private static buildErc20TransferCall(unsigned: SendTransaction): Uint8Array {
    return new Uint8Array([
      ...Abi.calculateMethodId("transfer(address,uint256)"),
      ...Abi.encodeAddress(unsigned.recipient),
      ...Abi.encodeUint256(unsigned.amount.quantity),
    ]);
  }

  private static buildErc20ApproveCall(unsigned: Erc20ApproveTransaction): Uint8Array {
    return new Uint8Array([
      ...Abi.calculateMethodId("approve(address,uint256)"),
      ...Abi.encodeAddress(unsigned.spender),
      ...Abi.encodeUint256(unsigned.amount.quantity),
    ]);
  }

  private static buildAtomicSwapOfferEtherCall(unsigned: SwapOfferTransaction): Uint8Array {
    if (!unsigned.swapId) {
      throw new Error("Could not build atomic swap offer call: swapId required");
    }
    const timeout = unsigned.timeout as BlockHeightTimeout;
    return new Uint8Array([
      ...Abi.calculateMethodId("open(bytes32,address,bytes32,uint256)"),
      ...unsigned.swapId.data,
      ...Abi.encodeAddress(unsigned.recipient),
      ...unsigned.hash,
      ...Abi.encodeUint256(timeout.height.toString()),
    ]);
  }

  private static buildAtomicSwapOfferErc20Call(
    unsigned: SwapOfferTransaction,
    erc20ContractAddress: Address,
  ): Uint8Array {
    if (!unsigned.swapId) {
      throw new Error("Could not build atomic swap offer call: swapId required");
    }
    const timeout = unsigned.timeout as BlockHeightTimeout;
    return new Uint8Array([
      ...Abi.calculateMethodId("open(bytes32,address,bytes32,uint256,address,uint256)"),
      ...unsigned.swapId.data,
      ...Abi.encodeAddress(unsigned.recipient),
      ...unsigned.hash,
      ...Abi.encodeUint256(timeout.height.toString()),
      ...Abi.encodeAddress(erc20ContractAddress),
      ...Abi.encodeUint256(unsigned.amounts[0].quantity),
    ]);
  }

  private static buildAtomicSwapClaimCall(unsigned: SwapClaimTransaction): Uint8Array {
    return new Uint8Array([
      ...Abi.calculateMethodId("claim(bytes32,bytes32)"),
      ...unsigned.swapId.data,
      ...unsigned.preimage,
    ]);
  }

  private static buildAtomicSwapAbortCall(unsigned: SwapAbortTransaction): Uint8Array {
    return new Uint8Array([...Abi.calculateMethodId("abort(bytes32)"), ...unsigned.swapId.data]);
  }

  private static serializeUnsignedSendTransaction(
    unsigned: SendTransaction,
    { chainIdHex, gasPriceHex, gasLimitHex, nonce, erc20Tokens }: UnsignedSerializationOptions,
  ): Uint8Array {
    Serialization.checkSenderPubkeyMatchesSenderAddress(unsigned);
    Serialization.checkRecipientAddress(unsigned);

    if (unsigned.amount.tokenTicker !== constants.primaryTokenTicker) {
      // ERC20 send
      Serialization.checkMemoNotPresent(unsigned);

      const erc20Token = Serialization.getErc20Token(unsigned, erc20Tokens);
      const erc20TransferCall = Serialization.buildErc20TransferCall(unsigned);

      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        erc20Token.contractAddress,
        ZERO_ETH_QUANTITY,
        erc20TransferCall,
        chainIdHex,
      );
    } else {
      // native ETH send
      const data = toUtf8(unsigned.memo || "");

      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        unsigned.recipient,
        unsigned.amount.quantity,
        data,
        chainIdHex,
      );
    }
  }

  private static serializeUnsignedSwapOfferTransaction(
    unsigned: SwapOfferTransaction,
    {
      chainIdHex,
      gasPriceHex,
      gasLimitHex,
      nonce,
      erc20Tokens,
      atomicSwapContractAddress,
    }: UnsignedSerializationOptions,
  ): Uint8Array {
    Serialization.checkSwapId(unsigned);
    Serialization.checkHash(unsigned);
    Serialization.checkRecipientAddress(unsigned);
    Serialization.checkMemoNotPresent(unsigned);
    Serialization.checkAtomicSwapContractAddress(atomicSwapContractAddress);
    if (!isBlockHeightTimeout(unsigned.timeout)) {
      throw new Error("Timeout must be specified as a block height");
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (unsigned.swapId!.prefix === SwapIdPrefix.Ether) {
      // native ETH swap
      Serialization.checkEtherAmount(unsigned.amounts);

      const atomicSwapOfferCall = Serialization.buildAtomicSwapOfferEtherCall(unsigned);

      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        atomicSwapContractAddress!,
        unsigned.amounts[0].quantity,
        atomicSwapOfferCall,
        chainIdHex,
      );
    } else {
      // ERC20 swap
      Serialization.checkErc20Amount(unsigned.amounts, erc20Tokens);

      const erc20Token = Serialization.getErc20Token(unsigned, erc20Tokens);
      const atomicSwapOfferCall = Serialization.buildAtomicSwapOfferErc20Call(
        unsigned,
        erc20Token.contractAddress,
      );

      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        atomicSwapContractAddress!,
        ZERO_ETH_QUANTITY,
        atomicSwapOfferCall,
        chainIdHex,
      );
    }
  }

  private static serializeUnsignedSwapClaimTransaction(
    unsigned: SwapClaimTransaction,
    { chainIdHex, gasPriceHex, gasLimitHex, nonce, atomicSwapContractAddress }: UnsignedSerializationOptions,
  ): Uint8Array {
    Serialization.checkSwapId(unsigned);
    Serialization.checkPreimage(unsigned);
    Serialization.checkAtomicSwapContractAddress(atomicSwapContractAddress);

    const atomicSwapClaimCall = Serialization.buildAtomicSwapClaimCall(unsigned);

    return Serialization.serializeGenericTransaction(
      nonce,
      gasPriceHex,
      gasLimitHex,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      atomicSwapContractAddress!,
      ZERO_ETH_QUANTITY,
      atomicSwapClaimCall,
      chainIdHex,
    );
  }

  private static serializeUnsignedSwapAbortTransaction(
    unsigned: SwapAbortTransaction,
    { chainIdHex, gasPriceHex, gasLimitHex, nonce, atomicSwapContractAddress }: UnsignedSerializationOptions,
  ): Uint8Array {
    Serialization.checkSwapId(unsigned);
    Serialization.checkAtomicSwapContractAddress(atomicSwapContractAddress);

    const atomicSwapAbortCall = Serialization.buildAtomicSwapAbortCall(unsigned);

    return Serialization.serializeGenericTransaction(
      nonce,
      gasPriceHex,
      gasLimitHex,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      atomicSwapContractAddress!,
      ZERO_ETH_QUANTITY,
      atomicSwapAbortCall,
      chainIdHex,
    );
  }

  private static serializeUnsignedErc20ApproveTransaction(
    unsigned: Erc20ApproveTransaction,
    { chainIdHex, gasPriceHex, gasLimitHex, nonce, erc20Tokens }: UnsignedSerializationOptions,
  ): Uint8Array {
    const erc20Token = Serialization.getErc20Token(unsigned, erc20Tokens);
    const erc20ApproveCall = Serialization.buildErc20ApproveCall(unsigned);
    return Serialization.serializeGenericTransaction(
      nonce,
      gasPriceHex,
      gasLimitHex,
      erc20Token.contractAddress,
      ZERO_ETH_QUANTITY,
      erc20ApproveCall,
      chainIdHex,
    );
  }

  private static serializeUnsignedEscrowOpenTransaction(
    unsigned: EscrowOpenTransaction,
    {
      chainIdHex,
      gasPriceHex,
      gasLimitHex,
      nonce,
      erc20Tokens,
      customSmartContractAddress,
    }: UnsignedSerializationOptions,
  ): Uint8Array {
    EscrowContract.checkOpenTransaction(unsigned);
    if (!isBlockHeightTimeout(unsigned.timeout)) {
      throw new Error("Timeout must be specified as a block height");
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (unsigned.swapId.prefix === SwapIdPrefix.Ether) {
      // native ETH swap
      Serialization.checkEtherAmount([unsigned.amount]);
      const escrowOpenCall = EscrowContract.open(
        unsigned.swapId,
        unsigned.arbiter,
        unsigned.hash,
        unsigned.timeout,
      );
      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        customSmartContractAddress!,
        unsigned.amount.quantity,
        escrowOpenCall,
        chainIdHex,
      );
    } else {
      // ERC20 swap
      Serialization.checkErc20Amount([unsigned.amount], erc20Tokens);
      const escrowOpenCall = EscrowContract.open(
        unsigned.swapId,
        unsigned.arbiter,
        unsigned.hash,
        unsigned.timeout,
      );
      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        customSmartContractAddress!,
        ZERO_ETH_QUANTITY,
        escrowOpenCall,
        chainIdHex,
      );
    }
  }

  private static serializeUnsignedEscrowClaimTransaction(
    unsigned: EscrowClaimTransaction,
    { chainIdHex, gasPriceHex, gasLimitHex, nonce, customSmartContractAddress }: UnsignedSerializationOptions,
  ): Uint8Array {
    EscrowContract.checkClaimTransaction(unsigned);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (unsigned.swapId.prefix === SwapIdPrefix.Ether) {
      const escrowClaimCall = EscrowContract.claim(unsigned.swapId, unsigned.recipient);
      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        customSmartContractAddress!,
        ZERO_ETH_QUANTITY,
        escrowClaimCall,
        chainIdHex,
      );
    } else {
      const escrowClaimCall = EscrowContract.claim(unsigned.swapId, unsigned.recipient);
      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        customSmartContractAddress!,
        ZERO_ETH_QUANTITY,
        escrowClaimCall,
        chainIdHex,
      );
    }
  }

  private static serializeUnsignedEscrowAbortTransaction(
    unsigned: EscrowAbortTransaction,
    { chainIdHex, gasPriceHex, gasLimitHex, nonce, customSmartContractAddress }: UnsignedSerializationOptions,
  ): Uint8Array {
    EscrowContract.checkAbortTransaction(unsigned);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (unsigned.swapId.prefix === SwapIdPrefix.Ether) {
      const escrowAbortCall = EscrowContract.abort(unsigned.swapId);
      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        customSmartContractAddress!,
        ZERO_ETH_QUANTITY,
        escrowAbortCall,
        chainIdHex,
      );
    } else {
      const escrowAbortCall = EscrowContract.abort(unsigned.swapId);
      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        customSmartContractAddress!,
        ZERO_ETH_QUANTITY,
        escrowAbortCall,
        chainIdHex,
      );
    }
  }

  private static serializeSignedSendTransaction(
    unsigned: SendTransaction,
    { v, r, s, gasPriceHex, gasLimitHex, nonce, erc20Tokens }: SignedSerializationOptions,
  ): Uint8Array {
    Serialization.checkSenderPubkeyMatchesSenderAddress(unsigned);
    Serialization.checkRecipientAddress(unsigned);

    if (unsigned.amount.tokenTicker !== constants.primaryTokenTicker) {
      // ERC20 send
      Serialization.checkMemoNotPresent(unsigned);

      const erc20Token = Serialization.getErc20Token(unsigned, erc20Tokens);
      const erc20TransferCall = Serialization.buildErc20TransferCall(unsigned);

      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        erc20Token.contractAddress,
        ZERO_ETH_QUANTITY,
        erc20TransferCall,
        v,
        r,
        s,
      );
    } else {
      // native ETH send
      const data = toUtf8(unsigned.memo || "");

      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        unsigned.recipient,
        unsigned.amount.quantity,
        data,
        v,
        r,
        s,
      );
    }
  }

  private static serializeSignedSwapOfferTransaction(
    unsigned: SwapOfferTransaction,
    {
      v,
      r,
      s,
      gasPriceHex,
      gasLimitHex,
      nonce,
      erc20Tokens,
      atomicSwapContractAddress,
    }: SignedSerializationOptions,
  ): Uint8Array {
    Serialization.checkSwapId(unsigned);
    Serialization.checkHash(unsigned);
    Serialization.checkRecipientAddress(unsigned);
    Serialization.checkMemoNotPresent(unsigned);
    Serialization.checkAtomicSwapContractAddress(atomicSwapContractAddress);
    if (!isBlockHeightTimeout(unsigned.timeout)) {
      throw new Error("Timeout must be specified as a block height");
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (unsigned.swapId!.prefix === SwapIdPrefix.Ether) {
      // native ETH swap
      Serialization.checkEtherAmount(unsigned.amounts);

      const atomicSwapOfferCall = Serialization.buildAtomicSwapOfferEtherCall(unsigned);

      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        atomicSwapContractAddress!,
        unsigned.amounts[0].quantity,
        atomicSwapOfferCall,
        v,
        r,
        s,
      );
    } else {
      // ERC20 swap
      Serialization.checkErc20Amount(unsigned.amounts, erc20Tokens);

      const erc20Token = Serialization.getErc20Token(unsigned, erc20Tokens);
      const atomicSwapOfferCall = Serialization.buildAtomicSwapOfferErc20Call(
        unsigned,
        erc20Token.contractAddress,
      );

      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        atomicSwapContractAddress!,
        ZERO_ETH_QUANTITY,
        atomicSwapOfferCall,
        v,
        r,
        s,
      );
    }
  }

  private static serializeSignedSwapClaimTransaction(
    unsigned: SwapClaimTransaction,
    { v, r, s, gasPriceHex, gasLimitHex, nonce, atomicSwapContractAddress }: SignedSerializationOptions,
  ): Uint8Array {
    Serialization.checkSwapId(unsigned);
    Serialization.checkPreimage(unsigned);
    Serialization.checkAtomicSwapContractAddress(atomicSwapContractAddress);

    const atomicSwapClaimCall = Serialization.buildAtomicSwapClaimCall(unsigned);

    return Serialization.serializeGenericTransaction(
      nonce,
      gasPriceHex,
      gasLimitHex,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      atomicSwapContractAddress!,
      ZERO_ETH_QUANTITY,
      atomicSwapClaimCall,
      v,
      r,
      s,
    );
  }

  private static serializeSignedSwapAbortTransaction(
    unsigned: SwapAbortTransaction,
    { v, r, s, gasPriceHex, gasLimitHex, nonce, atomicSwapContractAddress }: SignedSerializationOptions,
  ): Uint8Array {
    Serialization.checkSwapId(unsigned);
    Serialization.checkAtomicSwapContractAddress(atomicSwapContractAddress);

    const atomicSwapAbortCall = Serialization.buildAtomicSwapAbortCall(unsigned);

    return Serialization.serializeGenericTransaction(
      nonce,
      gasPriceHex,
      gasLimitHex,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      atomicSwapContractAddress!,
      ZERO_ETH_QUANTITY,
      atomicSwapAbortCall,
      v,
      r,
      s,
    );
  }

  private static serializeSignedErc20ApproveTransaction(
    unsigned: Erc20ApproveTransaction,
    { v, r, s, gasPriceHex, gasLimitHex, nonce, erc20Tokens }: SignedSerializationOptions,
  ): Uint8Array {
    const erc20Token = Serialization.getErc20Token(unsigned, erc20Tokens);
    const erc20ApproveCall = Serialization.buildErc20ApproveCall(unsigned);

    return Serialization.serializeGenericTransaction(
      nonce,
      gasPriceHex,
      gasLimitHex,
      erc20Token.contractAddress,
      ZERO_ETH_QUANTITY,
      erc20ApproveCall,
      v,
      r,
      s,
    );
  }

  private static serializeSignedOpenTransaction(
    unsigned: EscrowOpenTransaction,
    { v, r, s, gasPriceHex, gasLimitHex, nonce, customSmartContractAddress }: SignedSerializationOptions,
  ): Uint8Array {
    return Serialization.serializeGenericTransaction(
      nonce,
      gasPriceHex,
      gasLimitHex,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      customSmartContractAddress!,
      unsigned.amount.quantity,
      EscrowContract.open(unsigned.swapId, unsigned.arbiter, unsigned.hash, unsigned.timeout),
      v,
      r,
      s,
    );
  }

  private static serializeSignedClaimTransaction(
    unsigned: EscrowClaimTransaction,
    { v, r, s, gasPriceHex, gasLimitHex, nonce, customSmartContractAddress }: SignedSerializationOptions,
  ): Uint8Array {
    return Serialization.serializeGenericTransaction(
      nonce,
      gasPriceHex,
      gasLimitHex,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      customSmartContractAddress!,
      ZERO_ETH_QUANTITY,
      EscrowContract.claim(unsigned.swapId, unsigned.recipient),
      v,
      r,
      s,
    );
  }

  private static serializeSignedAbortTransaction(
    unsigned: EscrowAbortTransaction,
    { v, r, s, gasPriceHex, gasLimitHex, nonce, customSmartContractAddress }: SignedSerializationOptions,
  ): Uint8Array {
    return Serialization.serializeGenericTransaction(
      nonce,
      gasPriceHex,
      gasLimitHex,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      customSmartContractAddress!,
      ZERO_ETH_QUANTITY,
      EscrowContract.abort(unsigned.swapId),
      v,
      r,
      s,
    );
  }
}
