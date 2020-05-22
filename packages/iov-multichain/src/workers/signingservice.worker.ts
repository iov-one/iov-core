/// <reference lib="webworker" />

// A proof-of-work RPC server implementation for the out of process signer.
// This file belongs to the test code but is compiled separately to be usable in a WebWorker.

import { createBnsConnector } from "@iov/bns";
import { createEthereumConnector } from "@iov/ethereum";
import { Ed25519HdWallet, HdPaths, Secp256k1HdWallet, UserProfile } from "@iov/keycontrol";
import { sleep } from "@iov/utils";

import { JsonRpcSigningServer } from "../jsonrpcsigningserver";
import { MultiChainSigner } from "../multichainsigner";
import { SigningServerCore } from "../signingservercore";

const bnsdUrl = "ws://localhost:23456";
// Dev faucet
// path: m/1229936198'/1'/0'/0'
// pubkey: e05f47e7639b47625c23738e2e46d092819abd6039c5fc550d9aa37f1a2556a1
// IOV address: tiov1q5lyl7asgr2dcweqrhlfyexqpkgcuzrm4e0cku
// This account has money in the genesis file (see scripts/bnsd/README.md).
const bnsdFaucetMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
// tslint:disable-next-line: deprecation
const bnsdFaucetPath = HdPaths.iovFaucet();
const ethereumUrl = "http://localhost:8545";
const ganacheMnemonic = "oxygen fall sure lava energy veteran enroll frown question detail include maximum";

async function main(): Promise<void> {
  const profile = new UserProfile();
  const ed25519Wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(bnsdFaucetMnemonic));
  const secp256k1Wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(ganacheMnemonic));
  const signer = new MultiChainSigner(profile);

  const bnsdConnection = (await signer.addChain(createBnsConnector(bnsdUrl))).connection;
  const bnsdChainId = bnsdConnection.chainId;
  const ethereumConnection = (await signer.addChain(createEthereumConnector(ethereumUrl, {}))).connection;
  const ethereumChainId = ethereumConnection.chainId;

  // faucet identity
  await profile.createIdentity(ed25519Wallet.id, bnsdChainId, bnsdFaucetPath);
  // ganache second identity
  await profile.createIdentity(secp256k1Wallet.id, ethereumChainId, HdPaths.ethereum(1));

  const core = new SigningServerCore(
    profile,
    signer,
    async (_, matchingIdentities) => {
      await sleep(500);
      return matchingIdentities;
    },
    async () => {
      await sleep(500);
      return true;
    },
  );
  const server = new JsonRpcSigningServer(core);

  onmessage = async (event) => {
    // filter out empty {"isTrusted":true} events
    if (!event.data) {
      return;
    }

    const response = await server.handleUnchecked(event.data);
    postMessage(response);
  };
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
