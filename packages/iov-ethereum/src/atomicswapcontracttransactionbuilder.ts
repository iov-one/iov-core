import {
  Address,
  ChainId,
  Fee,
  Hash,
  Preimage,
  PubkeyBundle,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapIdBytes,
  SwapOfferTransaction,
  TokenTicker,
} from "@iov/bcp";
import BN from "bn.js";

import { Abi } from "./abi";
import { pubkeyToAddress } from "./address";
import { constants } from "./constants";
import { Erc20TokensMap } from "./erc20";
import { SwapIdPrefix } from "./serializationcommon";
import { AtomicSwapContract, SwapContractMethod } from "./smartcontracts/atomicswapcontract";

export class AtomicSwapContractTransactionBuilder {
  public static buildTransaction(
    input: Uint8Array,
    erc20Tokens: Erc20TokensMap,
    chainId: ChainId,
    value: string,
    fee: Fee,
    signerPubkey: PubkeyBundle,
    atomicSwapContractAddress: Address,
    prefix: SwapIdPrefix,
  ): SwapOfferTransaction | SwapClaimTransaction | SwapAbortTransaction {
    const positionMethodIdBegin = 0;
    const positionMethodIdEnd = positionMethodIdBegin + 4;
    const positionSwapIdBegin = positionMethodIdEnd;
    const positionSwapIdEnd = positionSwapIdBegin + 32;

    const method = AtomicSwapContract.abiDecodeMethodId(
      input.slice(positionMethodIdBegin, positionMethodIdEnd),
    );
    const swapIdWithoutPrefix = {
      data: input.slice(positionSwapIdBegin, positionSwapIdEnd) as SwapIdBytes,
    };

    switch (method) {
      case SwapContractMethod.Open: {
        const positionRecipientBegin = positionSwapIdEnd;
        const positionRecipientEnd = positionRecipientBegin + 32;
        const positionHashBegin = positionRecipientEnd;
        const positionHashEnd = positionHashBegin + 32;
        const positionTimeoutBegin = positionHashEnd;
        const positionTimeoutEnd = positionTimeoutBegin + 32;
        const positionErc20ContractAddressBegin = positionTimeoutEnd;
        const positionErc20ContractAddressEnd = positionErc20ContractAddressBegin + 32;
        const positionAmountBegin = positionErc20ContractAddressEnd;
        const positionAmountEnd = positionAmountBegin + 32;

        const recipientAddress = Abi.decodeAddress(input.slice(positionRecipientBegin, positionRecipientEnd));
        const hash = input.slice(positionHashBegin, positionHashEnd) as Hash;
        const timeoutHeight = new BN(input.slice(positionTimeoutBegin, positionTimeoutEnd)).toNumber();

        const erc20ContractAddressBytes = input.slice(
          positionErc20ContractAddressBegin,
          positionErc20ContractAddressEnd,
        );
        const token = erc20ContractAddressBytes.length
          ? [...erc20Tokens.values()].find(
              (t) =>
                t.contractAddress.toLowerCase() ===
                Abi.decodeAddress(erc20ContractAddressBytes).toLowerCase(),
            )
          : null;
        const fractionalDigits = token ? token.decimals : constants.primaryTokenFractionalDigits;
        const tokenTicker = token ? (token.symbol as TokenTicker) : constants.primaryTokenTicker;
        const quantity = token
          ? Abi.decodeUint256(input.slice(positionAmountBegin, positionAmountEnd))
          : value;

        return {
          kind: "bcp/swap_offer",
          chainId: chainId,
          swapId: {
            ...swapIdWithoutPrefix,
            prefix: token ? SwapIdPrefix.Erc20 : SwapIdPrefix.Ether,
          },
          fee: fee,
          amounts: [
            {
              quantity: quantity,
              fractionalDigits: fractionalDigits,
              tokenTicker: tokenTicker,
            },
          ],
          sender: pubkeyToAddress(signerPubkey),
          recipient: recipientAddress,
          timeout: {
            height: timeoutHeight,
          },
          hash: hash,
        };
      }
      case SwapContractMethod.Claim: {
        const positionPreimageBegin = positionSwapIdEnd;
        const positionPreimageEnd = positionPreimageBegin + 32;

        const preimage = input.slice(positionPreimageBegin, positionPreimageEnd) as Preimage;

        return {
          kind: "bcp/swap_claim",
          chainId: chainId,
          fee: fee,
          swapId: {
            ...swapIdWithoutPrefix,
            prefix: prefix,
          },
          preimage: preimage,
        };
      }
      case SwapContractMethod.Abort: {
        return {
          kind: "bcp/swap_abort",
          chainId: chainId,
          fee: fee,
          swapId: {
            ...swapIdWithoutPrefix,
            prefix: prefix,
          },
        };
      }
      default:
        throw new Error("Atomic swap method not recognized");
    }
  }
}
