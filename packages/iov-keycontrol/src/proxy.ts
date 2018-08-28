/*
Code for https://github.com/iov-one/iov-core/issues/301

This file just contains a proposal for a new API for this package.
This code will not be run, but by placing it here, we force
it to be tslint/tsc compatible.

Once approved, this should be a template to update the other files in
this package.
*/

/*
import {
  PrehashType,
  SignableBytes,
} from "@iov/bcp-types";
import { Algorithm, ChainId, SignatureBytes } from "@iov/tendermint-types";
import { KeyringEntryImplementationIdString, LocalIdentity, PublicIdentity } from "./keyring";
*/

import { Algorithm } from "@iov/tendermint-types";
import { EventEmitter } from "events";

import { KeyringEntryImplementationIdString } from "./keyring";
import { ValueAndUpdates } from "./valueandupdates";

// simplified KeyringEntry to demonstrate....
export interface KeyringEntry {
  // these store labels locally outside of the key material
  // do we want Promises for the case of proxy connections?
  readonly setLabel: (label: string | undefined) => Promise<void>;
  // readonly setIdentityLabel: (identity: PublicIdentity, label: string | undefined) => Promise<void>;

  // all state observation should be based on streams (ValueAndUpdates)
  readonly getLabel: () => ValueAndUpdates<string | undefined>;
  // readonly getIdentities: () => ValueAndUpdates<ReadonlyArray<LocalIdentity>>;
  // readonly canSign: ValueAndUpdates<boolean>;

  readonly implementationId: KeyringEntryImplementationIdString;
  // it may support ed25519, secp256k1 or both (constant from compile time)
  // ideally most KeyringEntries support both (breaking change)
  readonly supportedAlgorithms: ReadonlyArray<Algorithm>;

  // the actual usage of the keys
  // readonly createTransactionSignature: (
  //   identity: PublicIdentity,
  //   transactionBytes: SignableBytes,
  //   prehash: PrehashType,
  //   chainId: ChainId,
  // ) => Promise<SignatureBytes>;
}

export enum Method {
  SetLabel = "setLabel",
  GetLabelUpdate = "getLabelUpdate",
  ImplementationId = "implementationId",
  SupportedAlgorithms = "supportedAlgorithms",
}

// A connection has a read/write interface,
// Send messages and listen to return messages.
// Each one needs a unique ID.
export interface Connection extends EventEmitter {
  readonly send: (msg: Message) => void;
}

// Should we just use JsonRpc standard here?
export interface Message {
  readonly id: string;
  readonly method: Method;
  readonly params: any;
}

const randomId = (): string => {
  // TODO: better
  return "random";
};

// LabelParams is one possible params
export interface LabelParams {
  readonly label: string | undefined;
}

export type Connector = () => Connection;

export class KeyringProxyClient /*implements KeyringEntry*/ {
  public static async connect(connector: Connector): Promise<KeyringProxyClient> {
    const connection = await connector();
    const { implementationId, supportedAlgorithms } = await this.setupConnection(/*connection*/);
    return new KeyringProxyClient(connection, implementationId, supportedAlgorithms);
  }

  private static async setupConnection(/*connection: Connection*/): Promise<{
    readonly implementationId: KeyringEntryImplementationIdString;
    readonly supportedAlgorithms: ReadonlyArray<Algorithm>;
  }> {
    // TODO: listen for initial events from the connection
    return {
      implementationId: "change-me" as KeyringEntryImplementationIdString,
      supportedAlgorithms: [Algorithm.ED25519],
    };
  }

  public readonly implementationId: KeyringEntryImplementationIdString;
  public readonly supportedAlgorithms: ReadonlyArray<Algorithm>;
  private readonly connection: Connection;

  constructor(
    connection: Connection,
    implementationId: KeyringEntryImplementationIdString,
    supportedAlgorithms: ReadonlyArray<Algorithm>,
  ) {
    this.connection = connection;
    this.implementationId = implementationId;
    this.supportedAlgorithms = supportedAlgorithms;
  }

  public async setLabel(label: string | undefined): Promise<void> {
    const message = { id: randomId(), method: Method.SetLabel, params: { label } };
    this.connection.send(message);
  }
}

export class KeyringProxyServer {
  // this is like a "listen forever loop",
  // it spawns individual instances of the server with a real connection
  public static listen(/* some sort of listener, keyring to proxy to */): void {
    throw new Error("Not yet implemented");
  }

  private readonly connection: Connection;
  private readonly keyring: KeyringEntry;

  constructor(connection: Connection, keyring: KeyringEntry) {
    this.connection = connection;
    this.keyring = keyring;
    this.connection.on("message", this.handleMessage.bind(this));
    // this.sendEvents();
  }

  private handleMessage(message: Message): void {
    switch (message.method) {
      case Method.SetLabel:
        const label = (message.params as LabelParams).label;
        // for now, don't worry that this returns a Promise....
        this.keyring.setLabel(label);
        break;
      default:
        throw new Error(`Unknown method ${message.method}`);
    }
  }
}
