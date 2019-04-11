import { Address, Nonce, SignedTransaction, TokenTicker, UnsignedTransaction } from "@iov/bcp";
import { Erc20Options } from "./erc20";
export declare class Serialization {
    static serializeGenericTransaction(nonce: Nonce, gasPriceHex: string, gasLimitHex: string, recipient: Address, value: string, data: Uint8Array, v: string, r?: Uint8Array, s?: Uint8Array): Uint8Array;
    static serializeUnsignedTransaction(unsigned: UnsignedTransaction, nonce: Nonce, erc20Tokens?: ReadonlyMap<TokenTicker, Erc20Options>, atomicSwapEtherContractAddress?: Address): Uint8Array;
    static serializeSignedTransaction(signed: SignedTransaction, erc20Tokens?: ReadonlyMap<TokenTicker, Erc20Options>, atomicSwapEtherContractAddress?: Address): Uint8Array;
    private static checkIsSupportedTransaction;
    private static checkRecipientAddress;
    private static checkSwapId;
    private static checkAtomicSwapContractAddress;
    private static checkMemoNotPresent;
    private static checkAmounts;
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
}
