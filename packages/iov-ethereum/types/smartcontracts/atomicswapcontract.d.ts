import { SwapProcessState } from "@iov/bcp";
export declare enum SwapContractEvent {
  Opened = 0,
  Claimed = 1,
  Aborted = 2,
}
export declare enum SwapContractMethod {
  Open = 0,
  Claim = 1,
  Abort = 2,
}
export declare class AtomicSwapContract {
  static abiDecodeSwapProcessState(data: Uint8Array): SwapProcessState;
  static abiDecodeMethodId(data: Uint8Array): SwapContractMethod;
  static abiDecodeEventSignature(data: Uint8Array): SwapContractEvent;
  private static readonly abiEventSignatures;
  private static readonly abiMethodIds;
}
