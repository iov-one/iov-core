import BN from "bn.js";
import { Address } from "web3x/address";
import { EventLog, TransactionReceipt } from "web3x/formatters";
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from "web3x/contract";
import { Eth } from "web3x/eth";
export declare type MinterAddedEvent = {
    account: Address;
};
export declare type MinterRemovedEvent = {
    account: Address;
};
export declare type TransferEvent = {
    from: Address;
    to: Address;
    value: string;
};
export declare type ApprovalEvent = {
    owner: Address;
    spender: Address;
    value: string;
};
export interface MinterAddedEventLog extends EventLog<MinterAddedEvent, "MinterAdded"> {
}
export interface MinterRemovedEventLog extends EventLog<MinterRemovedEvent, "MinterRemoved"> {
}
export interface TransferEventLog extends EventLog<TransferEvent, "Transfer"> {
}
export interface ApprovalEventLog extends EventLog<ApprovalEvent, "Approval"> {
}
interface AshTokenEvents {
    MinterAdded: EventSubscriptionFactory<MinterAddedEventLog>;
    MinterRemoved: EventSubscriptionFactory<MinterRemovedEventLog>;
    Transfer: EventSubscriptionFactory<TransferEventLog>;
    Approval: EventSubscriptionFactory<ApprovalEventLog>;
}
interface AshTokenEventLogs {
    MinterAdded: MinterAddedEventLog;
    MinterRemoved: MinterRemovedEventLog;
    Transfer: TransferEventLog;
    Approval: ApprovalEventLog;
}
interface AshTokenTxEventLogs {
    MinterAdded: MinterAddedEventLog[];
    MinterRemoved: MinterRemovedEventLog[];
    Transfer: TransferEventLog[];
    Approval: ApprovalEventLog[];
}
export interface AshTokenTransactionReceipt extends TransactionReceipt<AshTokenTxEventLogs> {
}
interface AshTokenMethods {
    name(): TxCall<string>;
    approve(spender: Address, value: number | string | BN): TxSend<AshTokenTransactionReceipt>;
    totalSupply(): TxCall<string>;
    transferFrom(from: Address, to: Address, value: number | string | BN): TxSend<AshTokenTransactionReceipt>;
    decimals(): TxCall<string>;
    increaseAllowance(spender: Address, addedValue: number | string | BN): TxSend<AshTokenTransactionReceipt>;
    mint(to: Address, value: number | string | BN): TxSend<AshTokenTransactionReceipt>;
    balanceOf(owner: Address): TxCall<string>;
    symbol(): TxCall<string>;
    addMinter(account: Address): TxSend<AshTokenTransactionReceipt>;
    renounceMinter(): TxSend<AshTokenTransactionReceipt>;
    decreaseAllowance(spender: Address, subtractedValue: number | string | BN): TxSend<AshTokenTransactionReceipt>;
    transfer(to: Address, value: number | string | BN): TxSend<AshTokenTransactionReceipt>;
    isMinter(account: Address): TxCall<boolean>;
    allowance(owner: Address, spender: Address): TxCall<string>;
}
export interface AshTokenDefinition {
    methods: AshTokenMethods;
    events: AshTokenEvents;
    eventLogs: AshTokenEventLogs;
}
export declare class AshToken extends Contract<AshTokenDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions);
    deploy(): TxSend<AshTokenTransactionReceipt>;
}
export declare var AshTokenAbi: import("web3x/contract").ContractAbi;
export {};
