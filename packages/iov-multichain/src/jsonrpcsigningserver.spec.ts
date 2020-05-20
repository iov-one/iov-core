import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  Identity,
  isConfirmedTransaction,
  isIdentity,
  PubkeyBundle,
  PubkeyBytes,
  SendTransaction,
  TokenTicker,
  TransactionId,
} from "@iov/bcp";
import { bnsCodec, createBnsConnector } from "@iov/bns";
import { Ed25519, Random } from "@iov/crypto";
import { fromHex, TransactionEncoder } from "@iov/encoding";
import { createEthereumConnector } from "@iov/ethereum";
import { isJsonRpcErrorResponse } from "@iov/jsonrpc";
import { Ed25519HdWallet, HdPaths, Secp256k1HdWallet, UserProfile } from "@iov/keycontrol";
import { firstEvent } from "@iov/stream";

import { JsonRpcSigningServer } from "./jsonrpcsigningserver";
import { MultiChainSigner } from "./multichainsigner";
import { GetIdentitiesAuthorization, SignAndPostAuthorization, SigningServerCore } from "./signingservercore";

function pendingWithoutBnsd(): void {
  if (!process.env.BNSD_ENABLED) {
    pending("Set BNSD_ENABLED to enable bnsd-based tests");
  }
}

function pendingWithoutEthereum(): void {
  if (!process.env.ETHEREUM_ENABLED) {
    pending("Set ETHEREUM_ENABLED to enable ethereum-based tests");
  }
}

async function randomBnsAddress(): Promise<Address> {
  const rawKeypair = await Ed25519.makeKeypair(Random.getBytes(32));
  const randomIdentity: Identity = {
    chainId: "some-testnet" as ChainId,
    pubkey: {
      algo: Algorithm.Ed25519,
      data: rawKeypair.pubkey as PubkeyBytes,
    },
  };
  return bnsCodec.identityToAddress(randomIdentity);
}

const bnsdUrl = "ws://localhost:23456";
const bnsChainId = "local-iov-devnet";
// Dev faucet
// path: m/1229936198'/1'/0'/0'
// pubkey: e05f47e7639b47625c23738e2e46d092819abd6039c5fc550d9aa37f1a2556a1
// IOV address: tiov1q5lyl7asgr2dcweqrhlfyexqpkgcuzrm4e0cku
// This account has money in the genesis file (see scripts/bnsd/README.md).
const bnsdFaucetMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
// tslint:disable-next-line: deprecation
const bnsdFaucetPath = HdPaths.iovFaucet();
const ethereumUrl = "http://localhost:8545";
const ethereumChainId = "ethereum-eip155-5777" as ChainId;
const ganacheMnemonic = "oxygen fall sure lava energy veteran enroll frown question detail include maximum";

const defaultGetIdentitiesCallback: GetIdentitiesAuthorization = async (
  _,
  matching,
): Promise<readonly Identity[]> => matching;
const defaultSignAndPostCallback: SignAndPostAuthorization = async (_1, _2): Promise<boolean> => true;

async function makeBnsEthereumSigningServer(
  authorizeGetIdentities: GetIdentitiesAuthorization = defaultGetIdentitiesCallback,
  authorizeSignAndPost: SignAndPostAuthorization = defaultSignAndPostCallback,
): Promise<JsonRpcSigningServer> {
  const profile = new UserProfile();
  const ed25519Wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(bnsdFaucetMnemonic));
  const secp256k1Wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(ganacheMnemonic));
  const signer = new MultiChainSigner(profile);

  // connect to chains
  const bnsConnection = (await signer.addChain(createBnsConnector(bnsdUrl))).connection;
  const ethereumConnection = (await signer.addChain(createEthereumConnector(ethereumUrl, {}))).connection;

  // faucet identity
  await profile.createIdentity(ed25519Wallet.id, bnsConnection.chainId, bnsdFaucetPath);
  // ganache second identity
  await profile.createIdentity(secp256k1Wallet.id, ethereumConnection.chainId, HdPaths.bip44(60, 0, 0, 1));

  const core = new SigningServerCore(profile, signer, authorizeGetIdentities, authorizeSignAndPost);
  return new JsonRpcSigningServer(core);
}

describe("JsonRpcSigningServer", () => {
  const bnsdFaucetPubkey: PubkeyBundle = {
    algo: Algorithm.Ed25519,
    data: fromHex("e05f47e7639b47625c23738e2e46d092819abd6039c5fc550d9aa37f1a2556a1") as PubkeyBytes,
  };

  const ganacheSecondIdentity: Identity = {
    chainId: ethereumChainId,
    pubkey: {
      algo: Algorithm.Secp256k1,
      data: fromHex(
        "041d4c015b00cbd914e280b871d3c6ae2a047ca650d3ecea4b5246bb3036d4d74960b7feb09068164d2b82f1c7df9e95839b29ae38e90d60578b2318a54e108cf8",
      ) as PubkeyBytes,
    },
  };

  const defaultAmount: Amount = {
    quantity: "1",
    fractionalDigits: 9,
    tokenTicker: "CASH" as TokenTicker,
  };

  it("can get bnsd identities", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();

    const server = await makeBnsEthereumSigningServer();

    const response = await server.handleUnchecked({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: {
        reason: "string:Who are you?",
        chainIds: [`string:${bnsChainId}`],
      },
    });
    expect(response.id).toEqual(123);
    if (isJsonRpcErrorResponse(response)) {
      throw new Error(`Response must not be an error, but got '${response.error.message}'`);
    }
    const result = TransactionEncoder.fromJson(response.result);
    expect(result).toEqual(jasmine.any(Array));
    expect((result as readonly any[]).length).toEqual(1);
    expect(result[0]).toEqual({
      chainId: bnsChainId,
      pubkey: bnsdFaucetPubkey,
    });

    server.shutdown();
  });

  it("can get ethereum identities", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();

    const server = await makeBnsEthereumSigningServer();

    const response = await server.handleChecked({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: {
        reason: "string:Who are you?",
        chainIds: [`string:${ethereumChainId}`],
      },
    });
    expect(response.id).toEqual(123);
    if (isJsonRpcErrorResponse(response)) {
      throw new Error(`Response must not be an error, but got '${response.error.message}'`);
    }
    const result = TransactionEncoder.fromJson(response.result);
    expect(result).toEqual(jasmine.any(Array));
    expect((result as readonly any[]).length).toEqual(1);
    expect(result[0]).toEqual(ganacheSecondIdentity);

    server.shutdown();
  });

  it("can get BNS or Ethereum identities", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();

    const server = await makeBnsEthereumSigningServer();

    const response = await server.handleChecked({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: {
        reason: "string:Who are you?",
        chainIds: [`string:${ethereumChainId}`, `string:${bnsChainId}`],
      },
    });
    expect(response.id).toEqual(123);
    if (isJsonRpcErrorResponse(response)) {
      throw new Error(`Response must not be an error, but got '${response.error.message}'`);
    }
    const result = TransactionEncoder.fromJson(response.result);
    expect(result).toEqual(jasmine.any(Array));
    expect((result as readonly any[]).length).toEqual(2);
    expect(result[0]).toEqual({
      chainId: bnsChainId,
      pubkey: bnsdFaucetPubkey,
    });
    expect(result[1]).toEqual(ganacheSecondIdentity);

    server.shutdown();
  });

  it("handles signing requests", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();

    const bnsConnection = await createBnsConnector(bnsdUrl).establishConnection();

    const server = await makeBnsEthereumSigningServer();

    const identitiesResponse = await server.handleChecked({
      jsonrpc: "2.0",
      id: 1,
      method: "getIdentities",
      params: {
        reason: "string:Who are you?",
        chainIds: [`string:${bnsConnection.chainId}`],
      },
    });
    if (isJsonRpcErrorResponse(identitiesResponse)) {
      throw new Error(`Response must not be an error, but got '${identitiesResponse.error.message}'`);
    }
    expect(identitiesResponse.result).toEqual(jasmine.any(Array));
    expect((identitiesResponse.result as readonly any[]).length).toEqual(1);
    const signer = TransactionEncoder.fromJson(identitiesResponse.result[0]);
    if (!isIdentity(signer)) {
      throw new Error("Identity element is not valid");
    }

    const send = await bnsConnection.withDefaultFee<SendTransaction>(
      {
        kind: "bcp/send",
        chainId: signer.chainId,
        sender: bnsCodec.identityToAddress(signer),
        memo: `Hello ${Math.random()}`,
        amount: defaultAmount,
        recipient: await randomBnsAddress(),
      },
      "tiov1q5lyl7asgr2dcweqrhlfyexqpkgcuzrm4e0cku" as Address,
    );

    const signAndPostResponse = await server.handleChecked({
      jsonrpc: "2.0",
      id: 2,
      method: "signAndPost",
      params: {
        reason: "string:Please sign",
        signer: TransactionEncoder.toJson(signer),
        transaction: TransactionEncoder.toJson(send),
      },
    });
    if (isJsonRpcErrorResponse(signAndPostResponse)) {
      throw new Error(`Response must not be an error, but got '${signAndPostResponse.error.message}'`);
    }
    const transactionId: TransactionId = TransactionEncoder.fromJson(signAndPostResponse.result);
    expect(transactionId).toMatch(/^[0-9A-F]+$/);

    const result = await firstEvent(bnsConnection.liveTx({ id: transactionId }));
    if (!isConfirmedTransaction(result)) {
      throw new Error("Expected confirmed transaction");
    }
    expect(result.transactionId).toEqual(transactionId);
    expect(result.transaction).toEqual(send);

    server.shutdown();
    bnsConnection.disconnect();
  });

  it("returns null when user denied signing request", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();

    const server = await makeBnsEthereumSigningServer(defaultGetIdentitiesCallback, async () => false);

    const identitiesResponse = await server.handleChecked({
      jsonrpc: "2.0",
      id: 1,
      method: "getIdentities",
      params: {
        reason: "string:Who are you?",
        chainIds: [`string:${bnsChainId}`],
      },
    });
    if (isJsonRpcErrorResponse(identitiesResponse)) {
      throw new Error(`Response must not be an error, but got '${identitiesResponse.error.message}'`);
    }
    expect(identitiesResponse.result).toEqual(jasmine.any(Array));
    expect((identitiesResponse.result as readonly any[]).length).toEqual(1);
    const signer = TransactionEncoder.fromJson(identitiesResponse.result[0]);
    if (!isIdentity(signer)) {
      throw new Error("Identity element is not valid");
    }

    const send: SendTransaction = {
      kind: "bcp/send",
      chainId: signer.chainId,
      sender: bnsCodec.identityToAddress(signer),
      memo: `Hello ${Math.random()}`,
      amount: defaultAmount,
      recipient: await randomBnsAddress(),
    };

    const signAndPostResponse = await server.handleChecked({
      jsonrpc: "2.0",
      id: 2,
      method: "signAndPost",
      params: {
        reason: "string:Please sign",
        signer: TransactionEncoder.toJson(signer),
        transaction: TransactionEncoder.toJson(send),
      },
    });
    if (isJsonRpcErrorResponse(signAndPostResponse)) {
      throw new Error(`Response must not be an error, but got '${signAndPostResponse.error.message}'`);
    }
    expect(TransactionEncoder.fromJson(signAndPostResponse.result)).toBeNull();

    server.shutdown();
  });

  it("sends correct error codes", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();

    const server = await makeBnsEthereumSigningServer();

    // unknown method
    {
      const response = await server.handleChecked({
        jsonrpc: "2.0",
        id: 123,
        method: "doSomeStuff",
        params: {},
      });
      if (!isJsonRpcErrorResponse(response)) {
        throw new Error("Expected RPC response to be an error");
      }
      expect(response.error.code).toEqual(-32601);
    }

    // parameter 'chainIds' missing
    {
      const response = await server.handleChecked({
        jsonrpc: "2.0",
        id: 123,
        method: "getIdentities",
        params: {
          reason: "string:Who are you?",
        },
      });
      if (!isJsonRpcErrorResponse(response)) {
        throw new Error("Expected RPC response to be an error");
      }
      expect(response.error.code).toEqual(-32602);
    }

    // parameter 'reason' of wrong type
    {
      const response = await server.handleChecked({
        jsonrpc: "2.0",
        id: 123,
        method: "getIdentities",
        params: {
          reason: 1,
          chainIds: [`string:${ethereumChainId}`],
        },
      });
      if (!isJsonRpcErrorResponse(response)) {
        throw new Error("Expected RPC response to be an error");
      }
      expect(response.error.code).toEqual(-32602);
    }

    server.shutdown();
  });

  it("passes request meta from request handler to callback", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();

    const originalRequestMeta = { foo: "bar" };

    const server = await makeBnsEthereumSigningServer(async (_1, _2, requestMeta) => {
      // we want object identity here
      expect(requestMeta).toBe(originalRequestMeta);
      return [];
    });

    // unchecked
    await server.handleUnchecked(
      {
        jsonrpc: "2.0",
        id: 123,
        method: "getIdentities",
        params: {
          reason: "string:Who are you?",
          chainIds: [`string:${bnsChainId}`],
        },
      },
      originalRequestMeta,
    );

    // checked
    await server.handleChecked(
      {
        jsonrpc: "2.0",
        id: 123,
        method: "getIdentities",
        params: {
          reason: "string:Who are you?",
          chainIds: [`string:${bnsChainId}`],
        },
      },
      originalRequestMeta,
    );

    server.shutdown();
  });
});
