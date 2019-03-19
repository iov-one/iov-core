import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  isConfirmedTransaction,
  PublicIdentity,
  PublicKeyBytes,
  SendTransaction,
  TokenTicker,
  TransactionId,
} from "@iov/bcp";
import { bnsCodec, bnsConnector } from "@iov/bns";
import { Ed25519, Random } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { ethereumConnector } from "@iov/ethereum";
import { Ed25519HdWallet, HdPaths, Secp256k1HdWallet, UserProfile } from "@iov/keycontrol";
import { firstEvent } from "@iov/stream";

import { isJsRpcErrorResponse, JsRpcCompatibleDictionary } from "./jsrpc";
import { JsRpcSigningServer } from "./jsrpcsigningserver";
import { MultiChainSigner } from "./multichainsigner";
import { GetIdentitiesAuthorization, SignAndPostAuthorization, SigningServerCore } from "./signingservercore";

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
const ethereumUrl = "http://localhost:8545";
const ethereumChainId = "ethereum-eip155-5777" as ChainId;
const ganacheMnemonic = "oxygen fall sure lava energy veteran enroll frown question detail include maximum";

const defaultGetIdentitiesCallback: GetIdentitiesAuthorization = async (_, matching) => matching;
const defaultSignAndPostCallback: SignAndPostAuthorization = async (_1, _2) => true;

async function makeBnsEthereumSigningServer(): Promise<JsRpcSigningServer> {
  const profile = new UserProfile();
  const ed25519Wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(bnsdFaucetMnemonic));
  const secp256k1Wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(ganacheMnemonic));
  const signer = new MultiChainSigner(profile);

  // connect to chains
  const bnsConnection = (await signer.addChain(bnsConnector(bnsdUrl))).connection;
  const ethereumConnection = (await signer.addChain(ethereumConnector(ethereumUrl, {}))).connection;

  // faucet identity
  await profile.createIdentity(ed25519Wallet.id, bnsConnection.chainId(), HdPaths.simpleAddress(0));
  // ganache second identity
  await profile.createIdentity(secp256k1Wallet.id, ethereumConnection.chainId(), HdPaths.bip44(60, 0, 0, 1));

  const core = new SigningServerCore(
    profile,
    signer,
    defaultGetIdentitiesCallback,
    defaultSignAndPostCallback,
  );
  return new JsRpcSigningServer(core);
}

describe("JsRpcSigningServer", () => {
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
    pendingWithoutEthereum();

    const bnsConnection = await bnsConnector(bnsdUrl).client();

    const server = await makeBnsEthereumSigningServer();

    const response = await server.handleUnchecked({
      id: 123,
      method: "getIdentities",
      params: {
        reason: "Who are you?",
        chainIds: [bnsConnection.chainId()],
      },
    });
    expect(response.id).toEqual(123);
    if (isJsRpcErrorResponse(response)) {
      throw new Error(`Response must not be an error, but got '${response.error.message}'`);
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

    const server = await makeBnsEthereumSigningServer();

    const response = await server.handleChecked({
      id: 123,
      method: "getIdentities",
      params: {
        reason: "Who are you?",
        chainIds: [ethereumChainId],
      },
    });
    expect(response.id).toEqual(123);
    if (isJsRpcErrorResponse(response)) {
      throw new Error(`Response must not be an error, but got '${response.error.message}'`);
    }
    expect(response.result).toEqual(jasmine.any(Array));
    expect((response.result as ReadonlyArray<any>).length).toEqual(1);
    expect(response.result[0]).toEqual(ganacheSecondIdentity);

    server.shutdown();
  });

  it("can get BNS or Ethereum identities", async () => {
    pendingWithoutBnsd();
    pendingWithoutEthereum();

    const bnsConnection = await bnsConnector(bnsdUrl).client();

    const server = await makeBnsEthereumSigningServer();

    const response = await server.handleChecked({
      id: 123,
      method: "getIdentities",
      params: {
        reason: "Who are you?",
        chainIds: [ethereumChainId, bnsConnection.chainId()],
      },
    });
    expect(response.id).toEqual(123);
    if (isJsRpcErrorResponse(response)) {
      throw new Error(`Response must not be an error, but got '${response.error.message}'`);
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
    pendingWithoutEthereum();

    const bnsConnection = await bnsConnector(bnsdUrl).client();

    const server = await makeBnsEthereumSigningServer();

    const identitiesResponse = await server.handleChecked({
      id: 1,
      method: "getIdentities",
      params: {
        reason: "Who are you?",
        chainIds: [bnsConnection.chainId()],
      },
    });
    if (isJsRpcErrorResponse(identitiesResponse)) {
      throw new Error(`Response must not be an error, but got '${identitiesResponse.error.message}'`);
    }
    const signer: PublicIdentity = identitiesResponse.result[0];

    const send: SendTransaction = {
      kind: "bcp/send",
      creator: signer,
      memo: `Hello ${Math.random()}`,
      amount: defaultAmount,
      recipient: await randomBnsAddress(),
    };

    const signAndPostResponse = await server.handleChecked({
      id: 2,
      method: "signAndPost",
      params: {
        reason: "Please sign",
        // Cast needed since type of indices of transaction is not string at compile time.
        // see https://stackoverflow.com/a/37006179/2013738
        transaction: (send as unknown) as JsRpcCompatibleDictionary,
      },
    });
    if (isJsRpcErrorResponse(signAndPostResponse)) {
      throw new Error(`Response must not be an error, but got '${signAndPostResponse.error.message}'`);
    }
    const transactionId: TransactionId = signAndPostResponse.result;
    expect(transactionId).toMatch(/^[0-9A-F]+$/);

    const result = await firstEvent(bnsConnection.liveTx({ id: transactionId }));
    if (!isConfirmedTransaction(result)) {
      throw new Error("Confirmed transaction extected");
    }
    expect(result.transactionId).toEqual(transactionId);
    expect(result.transaction).toEqual(send);

    server.shutdown();
    bnsConnection.disconnect();
  });
});
