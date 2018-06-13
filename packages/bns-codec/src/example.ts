import { AddressBytes, ChainID, PublicKeyBundle, SendTx, TokenTicker, TransactionKind } from "@iov/types";

export const sendTx = (
  sender: PublicKeyBundle,
  recipient: AddressBytes,
  amount: number,
  token: TokenTicker,
  chainID: ChainID,
) => {
  const res: SendTx = {
    kind: TransactionKind.SEND,
    amount: { whole: amount, fractional: 0, tokenTicker: token },
    chainId: chainID,
    fee: { whole: 0, fractional: 0, tokenTicker: token },
    recipient,
    signer: sender,
  };
  return res;
};
