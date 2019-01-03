import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  PublicIdentity,
  PublicKeyBytes,
  SendTransaction,
  TokenTicker,
  TransactionId,
} from "@iov/bcp-types";
import { bnsCodec, bnsConnector } from "@iov/bns";
import { Ed25519, Random } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { isJsonRpcErrorResponse, JsonCompatibleDictionary } from "@iov/jsonrpc";
import { Ed25519HdWallet, HdPaths, Secp256k1HdWallet, UserProfile } from "@iov/keycontrol";
import { toListPromise } from "@iov/stream";

import { JsonRpcSigningServer } from "./jsonrpcsigningserver";
import { MultiChainSigner } from "./multichainsigner";
import { SigningServerCore } from "./signingservercore";

const { fromHex } = Encoding;

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
  const rawKeypair = await Ed25519.makeKeypair(await Random.getBytes(32));
  const randomIdentity: PublicIdentity = {
    chainId: "some-testnet" as ChainId,
    pubkey: {
      algo: Algorithm.Ed25519,
      data: rawKeypair.pubkey as PublicKeyBytes,
    },
  };
  return bnsCodec.identityToAddress(randomIdentity);
}

const bnsdUrl = "ws://localhost:22345";
const bnsdFaucetMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
const ethereumChainId = "ethereum-eip155-5777" as ChainId;
const ganacheMnemonic = "oxygen fall sure lava energy veteran enroll frown question detail include maximum";

async function makeJsonRpcSigningServer(): Promise<JsonRpcSigningServer> {
  const profile = new UserProfile();
  const ed25519Wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(bnsdFaucetMnemonic));
  const secp256k1Wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(ganacheMnemonic));
  const signer = new MultiChainSigner(profile);

  const bnsConnection = (await signer.addChain(bnsConnector(bnsdUrl))).connection;

  // faucet identity
  await profile.createIdentity(ed25519Wallet.id, bnsConnection.chainId(), HdPaths.simpleAddress(0));
  // ganache second identity
  await profile.createIdentity(secp256k1Wallet.id, ethereumChainId, HdPaths.bip44(60, 0, 0, 1));

  return new JsonRpcSigningServer(new SigningServerCore(profile, signer));
}

describe("JsonRpcSigningServer", () => {
  const ganacheSecondIdentity: PublicIdentity = {
    chainId: ethereumChainId,
    pubkey: {
      algo: Algorithm.Secp256k1,
      data: Encoding.fromHex(
        "041d4c015b00cbd914e280b871d3c6ae2a047ca650d3ecea4b5246bb3036d4d74960b7feb09068164d2b82f1c7df9e95839b29ae38e90d60578b2318a54e108cf8",
      ) as PublicKeyBytes,
    },
  };

  const defaultAmount: Amount = {
    quantity: "1",
    fractionalDigits: 9,
    tokenTicker: "CASH" as TokenTicker,
  };

  it("can get bnsd identities", async () => {
    pendingWithoutBnsd();

    const bnsConnection = await bnsConnector(bnsdUrl).client();

    const server = await makeJsonRpcSigningServer();

    const response = await server.handleUnchecked({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: {
        reason: "Who are you?",
        chainIds: [bnsConnection.chainId()],
      },
    });
    expect(response.jsonrpc).toEqual("2.0");
    expect(response.id).toEqual(123);
    if (isJsonRpcErrorResponse(response)) {
      throw new Error("Response must not be an error");
    }
    expect(response.result).toEqual(jasmine.any(Array));
    expect((response.result as ReadonlyArray<any>).length).toEqual(1);
    expect(response.result[0].chainId).toEqual(bnsConnection.chainId());
    expect(response.result[0].pubkey.algo).toEqual("ed25519");
    expect(response.result[0].pubkey.data).toEqual(
      fromHex("533e376559fa551130e721735af5e7c9fcd8869ddd54519ee779fce5984d7898"),
    );

    server.shutdown();
    bnsConnection.disconnect();
  });

  it("can get ethereum identities", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();

    const server = await makeJsonRpcSigningServer();

    const response = await server.handleChecked({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: {
        reason: "Who are you?",
        chainIds: [ethereumChainId],
      },
    });
    expect(response.jsonrpc).toEqual("2.0");
    expect(response.id).toEqual(123);
    if (isJsonRpcErrorResponse(response)) {
      throw new Error("Response must not be an error");
    }
    expect(response.result).toEqual(jasmine.any(Array));
    expect((response.result as ReadonlyArray<any>).length).toEqual(1);
    expect(response.result[0]).toEqual(ganacheSecondIdentity);

    server.shutdown();
  });

  it("can get BNS or Ethereum identities", async () => {
    pendingWithoutEthereum();

    const bnsConnection = await bnsConnector(bnsdUrl).client();

    const server = await makeJsonRpcSigningServer();

    const response = await server.handleChecked({
      jsonrpc: "2.0",
      id: 123,
      method: "getIdentities",
      params: {
        reason: "Who are you?",
        chainIds: [ethereumChainId, bnsConnection.chainId()],
      },
    });
    expect(response.jsonrpc).toEqual("2.0");
    expect(response.id).toEqual(123);
    if (isJsonRpcErrorResponse(response)) {
      throw new Error("Response must not be an error");
    }
    expect(response.result).toEqual(jasmine.any(Array));
    expect((response.result as ReadonlyArray<any>).length).toEqual(2);
    expect(response.result[0].chainId).toEqual(bnsConnection.chainId());
    expect(response.result[0].pubkey.algo).toEqual("ed25519");
    expect(response.result[0].pubkey.data).toEqual(
      fromHex("533e376559fa551130e721735af5e7c9fcd8869ddd54519ee779fce5984d7898"),
    );
    expect(response.result[1]).toEqual(ganacheSecondIdentity);

    server.shutdown();
    bnsConnection.disconnect();
  });

  it("send a signing request to service", async () => {
    pendingWithoutBnsd();

    const bnsConnection = await bnsConnector(bnsdUrl).client();

    const server = await makeJsonRpcSigningServer();

    const identitiesResponse = await server.handleChecked({
      jsonrpc: "2.0",
      id: 1,
      method: "getIdentities",
      params: {
        reason: "Who are you?",
        chainIds: [bnsConnection.chainId()],
      },
    });
    if (isJsonRpcErrorResponse(identitiesResponse)) {
      throw new Error("Response must not be an error");
    }
    const signer: PublicIdentity = identitiesResponse.result[0];

    const send: SendTransaction = {
      kind: "bcp/send",
      chainId: bnsConnection.chainId(),
      signer: signer.pubkey,
      memo: `Hello ${Math.random()}`,
      amount: defaultAmount,
      recipient: await randomBnsAddress(),
    };

    const signAndPostResponse = await server.handleChecked({
      jsonrpc: "2.0",
      id: 2,
      method: "signAndPost",
      params: {
        reason: "Please sign",
        transaction: (send as unknown) as JsonCompatibleDictionary,
      },
    });
    if (isJsonRpcErrorResponse(signAndPostResponse)) {
      throw new Error("Response must not be an error");
    }
    const transactionId: TransactionId = signAndPostResponse.result;
    expect(transactionId).toMatch(/^[0-9A-F]+$/);

    const transactionSearch = await toListPromise(bnsConnection.liveTx({ id: transactionId }), 1);
    expect(transactionSearch[0].transactionId).toEqual(transactionId);
    expect(transactionSearch[0].transaction).toEqual(send);

    server.shutdown();
    bnsConnection.disconnect();
  });
});
