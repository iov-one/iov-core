import { TokenTicker } from "@iov/bcp-types";

export const constants = {
  addressSuffix: "R",
  primaryTokenTicker: "RISE" as TokenTicker,
  primaryTokenName: "RISE",
  primaryTokenFractionalDigits: 8,
  transactionSerializationOptions: {
    maxMemoLength: 64,
  },
};
