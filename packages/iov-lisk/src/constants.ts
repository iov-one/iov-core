import { TokenTicker } from "@iov/bcp-types";

export const constants = {
  addressSuffix: "L",
  primaryTokenTicker: "LSK" as TokenTicker,
  primaryTokenName: "Lisk",
  primaryTokenFractionalDigits: 8,
  transactionSerializationOptions: {
    maxMemoLength: 64,
  },
};
