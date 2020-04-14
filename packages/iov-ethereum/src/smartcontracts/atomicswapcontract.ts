import { SwapProcessState } from "@iov/bcp";
import { Encoding } from "@iov/encoding";
import { Abi } from "./../abi";

export enum SwapContractEvent {
  Opened,
  Claimed,
  Aborted,
}

export enum SwapContractMethod {
  Open,
  Claim,
  Abort,
}

export class AtomicSwapContract {
  // ABI methods previously decodeSwapProcessState in ABI file

  public static abiDecodeSwapProcessState(data: Uint8Array): SwapProcessState {
    if (data.length !== 32) {
      throw new Error("Input data not 256 bit long");
    }
    const key = Abi.decodeUint256(data);
    const map: { readonly [key: string]: SwapProcessState } = {
      1: SwapProcessState.Open,
      2: SwapProcessState.Claimed,
      3: SwapProcessState.Aborted,
    };
    const state: SwapProcessState | undefined = map[key];

    if (state === undefined) {
      throw new Error("Invalid swap process state");
    }
    return state;
  }

  // ABI methods previously decodeMethodId in ABI file

  public static abiDecodeMethodId(data: Uint8Array): SwapContractMethod {
    if (data.length !== 4) {
      throw new Error("Input data not 32 bit long");
    }
    const key = Encoding.toHex(data);

    const map: { readonly [key: string]: SwapContractMethod } = {
      [AtomicSwapContract.abiMethodIds.openEth]: SwapContractMethod.Open,
      [AtomicSwapContract.abiMethodIds.openErc20]: SwapContractMethod.Open,
      [AtomicSwapContract.abiMethodIds.claim]: SwapContractMethod.Claim,
      [AtomicSwapContract.abiMethodIds.abort]: SwapContractMethod.Abort,
    };
    const method: SwapContractMethod | undefined = map[key];

    if (method === undefined) {
      throw new Error("Invalid method ID");
    }
    return method;
  }

  // ABI methods previously decodeEventSignature in ABI file

  public static abiDecodeEventSignature(data: Uint8Array): SwapContractEvent {
    if (data.length !== 32) {
      throw new Error("Input data not 256 bit long");
    }
    const key = Encoding.toHex(data);
    const map: { readonly [key: string]: SwapContractEvent } = {
      [AtomicSwapContract.abiEventSignatures.openedEth]: SwapContractEvent.Opened,
      [AtomicSwapContract.abiEventSignatures.openedErc20]: SwapContractEvent.Opened,
      [AtomicSwapContract.abiEventSignatures.claimed]: SwapContractEvent.Claimed,
      [AtomicSwapContract.abiEventSignatures.aborted]: SwapContractEvent.Aborted,
    };
    const event: SwapContractEvent | undefined = map[key];

    if (event === undefined) {
      throw new Error("Invalid event signature");
    }
    return event;
  }

  // ABI methods previously eventSignatures in ABI file

  private static readonly abiEventSignatures: {
    readonly openedEth: string;
    readonly openedErc20: string;
    readonly claimed: string;
    readonly aborted: string;
  } = {
    openedEth: Encoding.toHex(
      Abi.calculateMethodHash("Opened(bytes32,address,address,bytes32,uint256,uint256)"),
    ),
    openedErc20: Encoding.toHex(
      Abi.calculateMethodHash("Opened(bytes32,address,address,bytes32,uint256,uint256,address)"),
    ),
    claimed: Encoding.toHex(Abi.calculateMethodHash("Claimed(bytes32,bytes32)")),
    aborted: Encoding.toHex(Abi.calculateMethodHash("Aborted(bytes32)")),
  };

  // ABI methods previously methodIds in ABI file

  private static readonly abiMethodIds: {
    readonly openEth: string;
    readonly openErc20: string;
    readonly claim: string;
    readonly abort: string;
  } = {
    openEth: Encoding.toHex(Abi.calculateMethodId("open(bytes32,address,bytes32,uint256)")),
    openErc20: Encoding.toHex(Abi.calculateMethodId("open(bytes32,address,bytes32,uint256,address,uint256)")),
    claim: Encoding.toHex(Abi.calculateMethodId("claim(bytes32,bytes32)")),
    abort: Encoding.toHex(Abi.calculateMethodId("abort(bytes32)")),
  };
}
