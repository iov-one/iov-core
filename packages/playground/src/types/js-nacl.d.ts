import { NaclCallback, NaclOpts } from "./nacl";

declare module "js-nacl" {
  export function instantiate(cb: NaclCallback, opts?: NaclOpts): void;
}
