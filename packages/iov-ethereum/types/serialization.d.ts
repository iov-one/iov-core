import { Address, Nonce, SignedTransaction, UnsignedTransaction } from "@iov/bcp";
import { Erc20TokensMap } from "./erc20";
export declare enum SwapIdPrefix {
  Ether = "ether",
  Erc20 = "erc20",
}
export declare class Serialization {
  static serializeGenericTransaction(
    nonce: Nonce,
    gasPriceHex: string,
    gasLimitHex: string,
    recipient: Address,
    value: string,
    data: Uint8Array,
    v: string,
    r?: Uint8Array,
    s?: Uint8Array,
  ): Uint8Array;
  static serializeUnsignedTransaction(
    unsigned: UnsignedTransaction,
    nonce: Nonce,
    erc20Tokens?: Erc20TokensMap,
    atomicSwapContractAddress?: Address,
    customSmartContractAddress?: Address,
  ): Uint8Array;
  static serializeSignedTransaction(
    signed: SignedTransaction,
    erc20Tokens?: Erc20TokensMap,
    atomicSwapContractAddress?: Address,
    customSmartContractAddress?: Address,
  ): Uint8Array;
  private static checkSenderPubkeyMatchesSenderAddress;
  private static checkRecipientAddress;
  private static checkSwapId;
  private static checkHash;
  private static checkPreimage;
  private static checkAtomicSwapContractAddress;
  private static checkMemoNotPresent;
  private static checkEtherAmount;
  private static checkErc20Amount;
  private static getChainIdHex;
  private static getGasPriceHex;
  private static getGasLimitHex;
  private static getErc20Token;
  /**
   * Nonce 0 must be represented as 0x instead of 0x0 for some strange reason
   */
  private static encodeNonce;
  /**
   * Value 0 must be represented as 0x instead of 0x0 for some strange reason
   */
  private static encodeValue;
  private static buildErc20TransferCall;
  private static buildErc20ApproveCall;
  private static buildAtomicSwapOfferEtherCall;
  private static buildAtomicSwapOfferErc20Call;
  private static buildAtomicSwapClaimCall;
  private static buildAtomicSwapAbortCall;
  private static serializeUnsignedSendTransaction;
  private static serializeUnsignedSwapOfferTransaction;
  private static serializeUnsignedSwapClaimTransaction;
  private static serializeUnsignedSwapAbortTransaction;
  private static serializeUnsignedErc20ApproveTransaction;
  private static serializeUnsignedEscrowOpenTransaction;
  private static serializeUnsignedEscrowClaimTransaction;
  private static serializeUnsignedEscrowAbortTransaction;
  private static serializeSignedSendTransaction;
  private static serializeSignedSwapOfferTransaction;
  private static serializeSignedSwapClaimTransaction;
  private static serializeSignedSwapAbortTransaction;
  private static serializeSignedErc20ApproveTransaction;
  private static serializeSignedOpenTransaction;
  private static serializeSignedClaimTransaction;
  private static serializeSignedAbortTransaction;
}
