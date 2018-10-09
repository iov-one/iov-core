import { Slip10RawIndex } from "@iov/crypto";
export declare class HdPaths {
    /**
     * IOV's SimpleAddress derivation path
     *
     * @see https://github.com/iov-one/iov-core/blob/v0.6.1/docs/KeyBase.md#simple-addresses
     */
    static simpleAddress(index: number): ReadonlyArray<Slip10RawIndex>;
}
