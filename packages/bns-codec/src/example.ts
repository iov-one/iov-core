import { ChainID, PublicKeyBundle, SendTx, TokenTicker } from "@iov/types";

export const sendTx = (
  sender: PublicKeyBundle,
  recipient: PublicKeyBundle,
  amount: number,
  token: TokenTicker,
  chainID: ChainID,
) => {
  const res: SendTx = {
    kind: "send",
    amount: { whole: amount, fractional: 0, tokenTicker: token },
    chainId: chainID,
    fee: { whole: 0, fractional: 0, tokenTicker: token },
    recipient,
    signer: sender,
  };
  return res;
};
