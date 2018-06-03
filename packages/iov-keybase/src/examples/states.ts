import { KeybaseState } from "../types/states";
import { user } from "./accounts";

export const keybaseState: KeybaseState = {
  activeKey: null,
  users: [user]
};
