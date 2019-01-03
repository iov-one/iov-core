import { Adaptor } from "../adaptor";
import { hashTx } from "./hasher";
import { Params } from "./requests";
import { Responses } from "./responses";

/**
 * @deprecated Support for Tendermint version 0.20.0 and 0.21.0 is deprecated
 * and will be removed in the next version of IOV-Core. If you need support
 * for Tendermint < 0.25.0, please open an issue on Github and we'll maintain it.
 */
// tslint:disable-next-line:variable-name
export const v0_20: Adaptor = {
  params: Params,
  responses: Responses,
  hashTx: hashTx,
};
