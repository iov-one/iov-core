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
import { Stream } from "xstream";

import { Client, Connection, Handler, Server } from "./connection";
import { KeyringEntryImplementationIdString } from "./keyring";
import { Event } from "./messages";
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
  Init = "init",
  SetLabel = "setLabel",
  GetLabelUpdate = "getLabelUpdate",
  ImplementationId = "implementationId",
  SupportedAlgorithms = "supportedAlgorithms",
}

// LabelParams is one possible params
export interface LabelParams {
  readonly label: string | undefined;
}

export interface InitResponse {
  readonly implementationId: KeyringEntryImplementationIdString;
  readonly supportedAlgorithms: ReadonlyArray<Algorithm>;
}

export class KeyringProxyClient /*implements KeyringEntry*/ {
  public static async connect(connection: Connection): Promise<KeyringProxyClient> {
    const client = new Client(connection);
    const { implementationId, supportedAlgorithms } = await this.init(client);
    return new KeyringProxyClient(client, implementationId, supportedAlgorithms);
  }

  private static async init(client: Client): Promise<InitResponse> {
    const resp = await client.request(Method.Init, {});
    return resp as InitResponse;
  }

  public readonly implementationId: KeyringEntryImplementationIdString;
  public readonly supportedAlgorithms: ReadonlyArray<Algorithm>;
  private readonly client: Client;

  constructor(
    client: Client,
    implementationId: KeyringEntryImplementationIdString,
    supportedAlgorithms: ReadonlyArray<Algorithm>,
  ) {
    this.client = client;
    this.implementationId = implementationId;
    this.supportedAlgorithms = supportedAlgorithms;
  }

  public setLabel(label: string | undefined): Promise<void> {
    return this.client.request(Method.SetLabel, { label });
  }
}

export class KeyringProxyHandler implements Handler {
  private readonly keyring: KeyringEntry;

  constructor(keyring: KeyringEntry) {
    this.keyring = keyring;
  }

  public async handleRequest(method: string, params: any): Promise<any> {
    switch (method) {
      case Method.Init:
        return {
          implementationId: this.keyring.implementationId,
          supportedAlgorithms: this.keyring.supportedAlgorithms,
        };
      case Method.SetLabel:
        return this.keyring.setLabel((params as LabelParams).label);
      default:
        throw new Error("Not yet implemented");
    }
  }

  public handleSubscribe(query: string): Stream<Event> {
    if (!query) {
      throw new Error("query required");
    }
    throw new Error("Not yet implemented");
  }
}

// serveProxy will expose the given keyring entry over a connection
export const serveProxy = (connection: Connection, keyring: KeyringEntry): Server => {
  const handler = new KeyringProxyHandler(keyring);
  return new Server(connection, handler);
};
