import { Amount } from "@iov/bcp";
import * as codecImpl from "./generated/codecimpl";
export declare function encodeInt(intNumber: number): number | null;
export declare function encodeString(data: string | undefined): string | null;
export declare function encodeAmount(amount: Amount): codecImpl.coin.ICoin;
export declare function encodeNumericId(id: number): Uint8Array;
