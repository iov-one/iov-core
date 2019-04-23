import BN from "bn.js";

import {
  Address,
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
  TokenTicker,
  UnsignedTransaction,
} from "@iov/bcp";
import { ExtendedSecp256k1Signature } from "@iov/crypto";
import { Encoding, Int53 } from "@iov/encoding";

import { Abi } from "./abi";
import { isValidAddress } from "./address";
import { constants } from "./constants";
import { BlknumForkState, Eip155ChainId, eip155V, toRlp } from "./encoding";
import { Erc20Options } from "./erc20";
import { encodeQuantity, encodeQuantityString, fromBcpChainId, normalizeHex } from "./utils";

const { fromHex, toUtf8 } = Encoding;
const ZERO_ETH_QUANTITY = "0";

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
    erc20Tokens: ReadonlyMap<TokenTicker, Erc20Options> = new Map(),
    atomicSwapEtherContractAddress?: Address,
    atomicSwapErc20ContractAddress?: Address,
  ): Uint8Array {
    const chainIdHex = Serialization.getChainIdHex(unsigned);
    const gasPriceHex = Serialization.getGasPriceHex(unsigned);
    const gasLimitHex = Serialization.getGasLimitHex(unsigned);

    if (isSendTransaction(unsigned)) {
      return Serialization.serializeUnsignedSendTransaction(
        unsigned,
        nonce,
        erc20Tokens,
        chainIdHex,
        gasPriceHex,
        gasLimitHex,
      );
    } else if (isSwapOfferTransaction(unsigned)) {
      return Serialization.serializeUnsignedSwapOfferTransaction(
        unsigned,
        nonce,
        erc20Tokens,
        chainIdHex,
        gasPriceHex,
        gasLimitHex,
        atomicSwapEtherContractAddress,
        atomicSwapErc20ContractAddress,
      );
    } else if (isSwapClaimTransaction(unsigned)) {
      return Serialization.serializeUnsignedSwapClaimTransaction(
        unsigned,
        nonce,
        chainIdHex,
        gasPriceHex,
        gasLimitHex,
        atomicSwapEtherContractAddress,
        atomicSwapErc20ContractAddress,
      );
    } else if (isSwapAbortTransaction(unsigned)) {
      return Serialization.serializeUnsignedSwapAbortTransaction(
        unsigned,
        nonce,
        chainIdHex,
        gasPriceHex,
        gasLimitHex,
        atomicSwapEtherContractAddress,
        atomicSwapErc20ContractAddress,
      );
    } else {
      throw new Error("Unsupported kind of transaction");
    }
  }

  public static serializeSignedTransaction(
    signed: SignedTransaction,
    erc20Tokens: ReadonlyMap<TokenTicker, Erc20Options> = new Map(),
    atomicSwapEtherContractAddress?: Address,
    atomicSwapErc20ContractAddress?: Address,
  ): Uint8Array {
    const unsigned = signed.transaction;
    Serialization.checkIsSupportedTransaction(unsigned);

    const { nonce } = signed.primarySignature;
    const gasPriceHex = Serialization.getGasPriceHex(unsigned);
    const gasLimitHex = Serialization.getGasLimitHex(unsigned);

    const sig = ExtendedSecp256k1Signature.fromFixedLength(signed.primarySignature.signature);
    const r = sig.r();
    const s = sig.s();
    const chainId = fromBcpChainId(unsigned.creator.chainId);
    const chain: Eip155ChainId =
      chainId > 0
        ? { forkState: BlknumForkState.Forked, chainId: chainId }
        : { forkState: BlknumForkState.Before };
    const v = eip155V(chain, sig.recovery);

    if (isSendTransaction(unsigned)) {
      return Serialization.serializeSignedSendTransaction(
        unsigned,
        nonce,
        erc20Tokens,
        gasPriceHex,
        gasLimitHex,
        v,
        r,
        s,
      );
    } else if (isSwapOfferTransaction(unsigned)) {
      return Serialization.serializeSignedSwapOfferTransaction(
        unsigned,
        nonce,
        erc20Tokens,
        gasPriceHex,
        gasLimitHex,
        v,
        r,
        s,
        atomicSwapEtherContractAddress,
        atomicSwapErc20ContractAddress,
      );
    } else if (isSwapClaimTransaction(unsigned)) {
      return Serialization.serializeSignedSwapClaimTransaction(
        unsigned,
        nonce,
        gasPriceHex,
        gasLimitHex,
        v,
        r,
        s,
        atomicSwapEtherContractAddress,
        atomicSwapErc20ContractAddress,
      );
    } else if (isSwapAbortTransaction(unsigned)) {
      return Serialization.serializeSignedSwapAbortTransaction(
        unsigned,
        nonce,
        gasPriceHex,
        gasLimitHex,
        v,
        r,
        s,
        atomicSwapEtherContractAddress,
        atomicSwapErc20ContractAddress,
      );
    } else {
      throw new Error("Unsupported kind of transaction");
    }
  }

  private static checkIsSupportedTransaction(unsigned: UnsignedTransaction): void {
    const supportedTransactionCheckers: ReadonlyArray<(unsigned: UnsignedTransaction) => boolean> = [
      isSendTransaction,
      isSwapOfferTransaction,
      isSwapClaimTransaction,
      isSwapAbortTransaction,
    ];
    if (!supportedTransactionCheckers.some(fn => fn(unsigned))) {
      throw new Error("Unsupported kind of transaction");
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
    if (unsigned.swapId.length !== 32) {
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

  private static checkAtomicSwapContractAddress(
    atomicSwapEtherContractAddress?: Address,
    atomicSwapErc20ContractAddress?: Address,
  ): void {
    const numContractAddresses = [atomicSwapEtherContractAddress, atomicSwapErc20ContractAddress].filter(
      Boolean,
    ).length;
    if (numContractAddresses !== 1) {
      throw new Error("Atomic swap transactions require exactly one atomic swap contract address");
    }
  }

  private static checkMemoNotPresent(unsigned: SendTransaction | SwapOfferTransaction): void {
    if (unsigned.memo) {
      throw new Error("Memo cannot be serialized in a smart contract-based transaction");
    }
  }

  private static checkEtherAmount(unsigned: SwapOfferTransaction): void {
    if (unsigned.amounts.length !== 1) {
      throw new Error("Cannot serialize a swap offer with more than one amount");
    }
    const { tokenTicker } = unsigned.amounts[0];
    if (tokenTicker !== constants.primaryTokenTicker) {
      throw new Error("Invalid amount: Ether atomic swap must specify amount in ETH");
    }
  }

  private static checkErc20Amount(
    unsigned: SwapOfferTransaction,
    erc20Tokens: ReadonlyMap<TokenTicker, Erc20Options>,
  ): void {
    if (unsigned.amounts.length !== 1) {
      throw new Error("Cannot serialize a swap offer with more than one amount");
    }
    const { tokenTicker } = unsigned.amounts[0];
    if (!erc20Tokens.get(tokenTicker)) {
      throw new Error("Invalid amount: unknown ERC20 token");
    }
  }

  private static getChainIdHex(unsigned: UnsignedTransaction): string {
    return encodeQuantity(fromBcpChainId(unsigned.creator.chainId));
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

  private static getErc20Token(
    unsigned: UnsignedTransaction,
    erc20Tokens: ReadonlyMap<TokenTicker, Erc20Options>,
  ): Erc20Options {
    let erc20Token: Erc20Options | undefined;
    let ticker: string;
    if (isSendTransaction(unsigned)) {
      erc20Token = erc20Tokens.get(unsigned.amount.tokenTicker);
      ticker = unsigned.amount.tokenTicker;
    } else if (isSwapOfferTransaction(unsigned)) {
      erc20Token = erc20Tokens.get(unsigned.amounts[0].tokenTicker);
      ticker = unsigned.amounts[0].tokenTicker;
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
      return numericValue.toArrayLike(Uint8Array, "be");
    }
  }

  private static buildErc20TransferCall(unsigned: SendTransaction): Uint8Array {
    return new Uint8Array([
      ...Abi.calculateMethodId("transfer(address,uint256)"),
      ...Abi.encodeAddress(unsigned.recipient),
      ...Abi.encodeUint256(unsigned.amount.quantity),
    ]);
  }

  private static buildAtomicSwapOfferEtherCall(unsigned: SwapOfferTransaction): Uint8Array {
    const timeout = unsigned.timeout as BlockHeightTimeout;
    return new Uint8Array([
      ...Abi.calculateMethodId("open(bytes32,address,bytes32,uint256)"),
      ...unsigned.swapId!,
      ...Abi.encodeAddress(unsigned.recipient),
      ...unsigned.hash,
      ...Abi.encodeUint256(timeout.height.toString()),
    ]);
  }

  private static buildAtomicSwapOfferErc20Call(
    unsigned: SwapOfferTransaction,
    erc20ContractAddress: Address,
  ): Uint8Array {
    const timeout = unsigned.timeout as BlockHeightTimeout;
    return new Uint8Array([
      ...Abi.calculateMethodId("open(bytes32,address,bytes32,uint256,address,uint256)"),
      ...unsigned.swapId!,
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
      ...unsigned.swapId,
      ...unsigned.preimage,
    ]);
  }

  private static buildAtomicSwapAbortCall(unsigned: SwapAbortTransaction): Uint8Array {
    return new Uint8Array([...Abi.calculateMethodId("abort(bytes32)"), ...unsigned.swapId]);
  }

  private static serializeUnsignedSendTransaction(
    unsigned: SendTransaction,
    nonce: Nonce,
    erc20Tokens: ReadonlyMap<TokenTicker, Erc20Options>,
    chainIdHex: string,
    gasPriceHex: string,
    gasLimitHex: string,
  ): Uint8Array {
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
    nonce: Nonce,
    erc20Tokens: ReadonlyMap<TokenTicker, Erc20Options>,
    chainIdHex: string,
    gasPriceHex: string,
    gasLimitHex: string,
    atomicSwapEtherContractAddress?: Address,
    atomicSwapErc20ContractAddress?: Address,
  ): Uint8Array {
    Serialization.checkSwapId(unsigned);
    Serialization.checkHash(unsigned);
    Serialization.checkRecipientAddress(unsigned);
    Serialization.checkMemoNotPresent(unsigned);
    Serialization.checkAtomicSwapContractAddress(
      atomicSwapEtherContractAddress,
      atomicSwapErc20ContractAddress,
    );
    if (!isBlockHeightTimeout(unsigned.timeout)) {
      throw new Error("Timeout must be specified as a block height");
    }

    if (atomicSwapEtherContractAddress) {
      // native ETH swap
      Serialization.checkEtherAmount(unsigned);

      const atomicSwapOfferCall = Serialization.buildAtomicSwapOfferEtherCall(unsigned);

      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        atomicSwapEtherContractAddress,
        unsigned.amounts[0].quantity,
        atomicSwapOfferCall,
        chainIdHex,
      );
    } else {
      // ERC20 swap
      Serialization.checkErc20Amount(unsigned, erc20Tokens);

      const erc20Token = Serialization.getErc20Token(unsigned, erc20Tokens);
      const atomicSwapOfferCall = Serialization.buildAtomicSwapOfferErc20Call(
        unsigned,
        erc20Token.contractAddress,
      );

      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        atomicSwapErc20ContractAddress!,
        ZERO_ETH_QUANTITY,
        atomicSwapOfferCall,
        chainIdHex,
      );
    }
  }

  private static serializeUnsignedSwapClaimTransaction(
    unsigned: SwapClaimTransaction,
    nonce: Nonce,
    chainIdHex: string,
    gasPriceHex: string,
    gasLimitHex: string,
    atomicSwapEtherContractAddress?: Address,
    atomicSwapErc20ContractAddress?: Address,
  ): Uint8Array {
    Serialization.checkSwapId(unsigned);
    Serialization.checkPreimage(unsigned);
    Serialization.checkAtomicSwapContractAddress(
      atomicSwapEtherContractAddress,
      atomicSwapErc20ContractAddress,
    );

    const atomicSwapClaimCall = Serialization.buildAtomicSwapClaimCall(unsigned);

    return Serialization.serializeGenericTransaction(
      nonce,
      gasPriceHex,
      gasLimitHex,
      (atomicSwapEtherContractAddress || atomicSwapErc20ContractAddress)!,
      ZERO_ETH_QUANTITY,
      atomicSwapClaimCall,
      chainIdHex,
    );
  }

  private static serializeUnsignedSwapAbortTransaction(
    unsigned: SwapAbortTransaction,
    nonce: Nonce,
    chainIdHex: string,
    gasPriceHex: string,
    gasLimitHex: string,
    atomicSwapEtherContractAddress?: Address,
    atomicSwapErc20ContractAddress?: Address,
  ): Uint8Array {
    Serialization.checkSwapId(unsigned);
    Serialization.checkAtomicSwapContractAddress(
      atomicSwapEtherContractAddress,
      atomicSwapErc20ContractAddress,
    );

    const atomicSwapAbortCall = Serialization.buildAtomicSwapAbortCall(unsigned);

    return Serialization.serializeGenericTransaction(
      nonce,
      gasPriceHex,
      gasLimitHex,
      (atomicSwapEtherContractAddress || atomicSwapErc20ContractAddress)!,
      ZERO_ETH_QUANTITY,
      atomicSwapAbortCall,
      chainIdHex,
    );
  }

  private static serializeSignedSendTransaction(
    unsigned: SendTransaction,
    nonce: Nonce,
    erc20Tokens: ReadonlyMap<TokenTicker, Erc20Options>,
    gasPriceHex: string,
    gasLimitHex: string,
    v: number,
    r: Uint8Array,
    s: Uint8Array,
  ): Uint8Array {
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
        encodeQuantity(v),
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
        encodeQuantity(v),
        r,
        s,
      );
    }
  }

  private static serializeSignedSwapOfferTransaction(
    unsigned: SwapOfferTransaction,
    nonce: Nonce,
    erc20Tokens: ReadonlyMap<TokenTicker, Erc20Options>,
    gasPriceHex: string,
    gasLimitHex: string,
    v: number,
    r: Uint8Array,
    s: Uint8Array,
    atomicSwapEtherContractAddress?: Address,
    atomicSwapErc20ContractAddress?: Address,
  ): Uint8Array {
    Serialization.checkSwapId(unsigned);
    Serialization.checkHash(unsigned);
    Serialization.checkRecipientAddress(unsigned);
    Serialization.checkMemoNotPresent(unsigned);
    Serialization.checkAtomicSwapContractAddress(
      atomicSwapEtherContractAddress,
      atomicSwapErc20ContractAddress,
    );
    if (!isBlockHeightTimeout(unsigned.timeout)) {
      throw new Error("Timeout must be specified as a block height");
    }

    if (atomicSwapEtherContractAddress) {
      // native ETH swap
      Serialization.checkEtherAmount(unsigned);

      const atomicSwapOfferCall = Serialization.buildAtomicSwapOfferEtherCall(unsigned);

      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        atomicSwapEtherContractAddress,
        unsigned.amounts[0].quantity,
        atomicSwapOfferCall,
        encodeQuantity(v),
        r,
        s,
      );
    } else {
      // ERC20 swap
      Serialization.checkErc20Amount(unsigned, erc20Tokens);

      const erc20Token = Serialization.getErc20Token(unsigned, erc20Tokens);
      const atomicSwapOfferCall = Serialization.buildAtomicSwapOfferErc20Call(
        unsigned,
        erc20Token.contractAddress,
      );

      return Serialization.serializeGenericTransaction(
        nonce,
        gasPriceHex,
        gasLimitHex,
        atomicSwapErc20ContractAddress!,
        ZERO_ETH_QUANTITY,
        atomicSwapOfferCall,
        encodeQuantity(v),
        r,
        s,
      );
    }
  }

  private static serializeSignedSwapClaimTransaction(
    unsigned: SwapClaimTransaction,
    nonce: Nonce,
    gasPriceHex: string,
    gasLimitHex: string,
    v: number,
    r: Uint8Array,
    s: Uint8Array,
    atomicSwapEtherContractAddress?: Address,
    atomicSwapErc20ContractAddress?: Address,
  ): Uint8Array {
    Serialization.checkSwapId(unsigned);
    Serialization.checkPreimage(unsigned);
    Serialization.checkAtomicSwapContractAddress(
      atomicSwapEtherContractAddress,
      atomicSwapErc20ContractAddress,
    );

    const atomicSwapClaimCall = Serialization.buildAtomicSwapClaimCall(unsigned);

    return Serialization.serializeGenericTransaction(
      nonce,
      gasPriceHex,
      gasLimitHex,
      (atomicSwapEtherContractAddress || atomicSwapErc20ContractAddress)!,
      ZERO_ETH_QUANTITY,
      atomicSwapClaimCall,
      encodeQuantity(v),
      r,
      s,
    );
  }

  private static serializeSignedSwapAbortTransaction(
    unsigned: SwapAbortTransaction,
    nonce: Nonce,
    gasPriceHex: string,
    gasLimitHex: string,
    v: number,
    r: Uint8Array,
    s: Uint8Array,
    atomicSwapEtherContractAddress?: Address,
    atomicSwapErc20ContractAddress?: Address,
  ): Uint8Array {
    Serialization.checkSwapId(unsigned);
    Serialization.checkAtomicSwapContractAddress(
      atomicSwapEtherContractAddress,
      atomicSwapErc20ContractAddress,
    );

    const atomicSwapAbortCall = Serialization.buildAtomicSwapAbortCall(unsigned);

    return Serialization.serializeGenericTransaction(
      nonce,
      gasPriceHex,
      gasLimitHex,
      (atomicSwapEtherContractAddress || atomicSwapErc20ContractAddress)!,
      ZERO_ETH_QUANTITY,
      atomicSwapAbortCall,
      encodeQuantity(v),
      r,
      s,
    );
  }
}
