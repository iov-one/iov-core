import { Hash, Preimage } from "./atomicswaptypes";
import { SwapIdBytes } from "./transactions";
export declare class AtomicSwapHelpers {
    static createPreimage(): Promise<Preimage>;
    /** Creates a SHA256 hash of the preimage */
    static hashPreimage(preimage: Preimage): Hash;
    static createId(): Promise<SwapIdBytes>;
}
