import {
  ChainId,
  Fee,
  PubkeyBundle,
  SendTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapOfferTransaction,
  TokenTicker,
} from "@iov/bcp";

import { Abi } from "./abi";
import { pubkeyToAddress } from "./address";
import { Erc20ApproveTransaction, Erc20Options } from "./erc20";
import { EthereumRpcTransactionResult } from "./ethereumrpctransactionresult";
import { toEthereumHex } from "./utils";

const methodCallPrefix = {
  erc20: {
    transfer: toEthereumHex(Abi.calculateMethodId("transfer(address,uint256)")),
    approve: toEthereumHex(Abi.calculateMethodId("approve(address,uint256)")),
  },
};

export class Erc20TokenTransactionBuilder {
  public static buildTransaction(
    input: Uint8Array,
    json: EthereumRpcTransactionResult,
    erc20Token: Erc20Options,
    chainId: ChainId,
    fee: Fee,
    signerPubkey: PubkeyBundle,
  ):
    | SendTransaction
    | Erc20ApproveTransaction
    | SwapOfferTransaction
    | SwapClaimTransaction
    | SwapAbortTransaction {
    if (json.input.startsWith(methodCallPrefix.erc20.transfer)) {
      const positionTransferMethodEnd = 4;
      const positionTransferRecipientBegin = positionTransferMethodEnd;
      const positionTransferRecipientEnd = positionTransferRecipientBegin + 32;
      const positionTransferAmountBegin = positionTransferRecipientEnd;
      const positionTransferAmountEnd = positionTransferAmountBegin + 32;

      const quantity = Abi.decodeUint256(input.slice(positionTransferAmountBegin, positionTransferAmountEnd));

      return {
        kind: "bcp/send",
        chainId: chainId,
        sender: pubkeyToAddress(signerPubkey),
        fee: fee,
        amount: {
          quantity: quantity,
          fractionalDigits: erc20Token.decimals,
          tokenTicker: erc20Token.symbol as TokenTicker,
        },
        recipient: Abi.decodeAddress(
          input.slice(positionTransferRecipientBegin, positionTransferRecipientEnd),
        ),
        memo: undefined,
      };
    } else if (json.input.startsWith(methodCallPrefix.erc20.approve)) {
      const positionApproveMethodEnd = 4;
      const positionApproveSpenderBegin = positionApproveMethodEnd;
      const positionApproveSpenderEnd = positionApproveSpenderBegin + 32;
      const positionApproveAmountBegin = positionApproveSpenderEnd;
      const positionApproveAmountEnd = positionApproveAmountBegin + 32;

      const spender = Abi.decodeAddress(input.slice(positionApproveSpenderBegin, positionApproveSpenderEnd));
      const quantity = Abi.decodeUint256(input.slice(positionApproveAmountBegin, positionApproveAmountEnd));

      return {
        kind: "erc20/approve",
        chainId: chainId,
        fee: fee,
        amount: {
          quantity: quantity,
          fractionalDigits: erc20Token.decimals,
          tokenTicker: erc20Token.symbol as TokenTicker,
        },
        spender: spender,
      };
    } else {
      throw new Error("unknown erc23 method");
    }
  }
}
