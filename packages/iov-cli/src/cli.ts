// tslint:disable:no-console
import { ArgumentParser } from "argparse";
// tslint:disable-next-line:no-submodule-imports
import colors = require("colors/safe");
import { join } from "path";

import { TsRepl } from "./tsrepl";

export function main(originalArgs: ReadonlyArray<string>): void {
  const parser = new ArgumentParser({ description: "The IOV-Core REPL" });
  parser.addArgument("--version", {
    action: "storeTrue",
    help: "Print version and exit",
  });

  const maintainerGroup = parser.addArgumentGroup({
    title: "Maintainer options",
    description: "Don't use those unless a maintainer tells you to.",
  });
  maintainerGroup.addArgument("--selftest", {
    action: "storeTrue",
    help: "Run a selftext and exit",
  });
  maintainerGroup.addArgument("--debug", {
    action: "storeTrue",
    help: "Enable debugging",
  });
  const args = parser.parseArgs([...originalArgs]);

  if (args.version) {
    const version = require(join(__dirname, "..", "package.json")).version;
    console.log(version);
    return;
  }

  // console.log("Called main with:", args);
  console.log(colors.green("Initializing session for you. Have fun!"));
  console.log(colors.yellow("Available imports:"));
  console.log(colors.yellow("  * http"));
  console.log(colors.yellow("  * https"));
  console.log(colors.yellow("  * leveldown"));
  console.log(colors.yellow("  * levelup"));
  console.log(colors.yellow("  * from long"));
  console.log(colors.yellow("    - Long"));
  console.log(colors.yellow("  * from @iov/bns"));
  console.log(colors.yellow("    - bnsCodec"));
  console.log(colors.yellow("    - bnsConnector"));
  console.log(colors.yellow("  * from @iov/core"));
  console.log(colors.yellow("    - Address"));
  console.log(colors.yellow("    - ChainId"));
  console.log(colors.yellow("    - Ed25519HdWallet"));
  console.log(colors.yellow("    - HdPaths"));
  console.log(colors.yellow("    - Keyring"));
  console.log(colors.yellow("    - MultiChainSigner"));
  console.log(colors.yellow("    - Nonce"));
  console.log(colors.yellow("    - UserProfile"));
  console.log(colors.yellow("    - Secp256k1HdWallet"));
  console.log(colors.yellow("    - SendTransaction"));
  console.log(colors.yellow("    - TokenTicker"));
  console.log(colors.yellow("    - Wallet"));
  console.log(colors.yellow("    - WalletId"));
  console.log(colors.yellow("    - WalletImplementationIdString"));
  console.log(colors.yellow("    - WalletSerializationString"));
  console.log(colors.yellow("  * from @iov/crypto"));
  console.log(colors.yellow("    - Bip39"));
  console.log(colors.yellow("    - Ed25519"));
  console.log(colors.yellow("    - Ed25519Keypair"));
  console.log(colors.yellow("    - Random"));
  console.log(colors.yellow("    - Sha256"));
  console.log(colors.yellow("    - Sha512"));
  console.log(colors.yellow("  * from @iov/encoding"));
  console.log(colors.yellow("    - Bech32"));
  console.log(colors.yellow("    - Encoding"));
  console.log(colors.yellow("  * from @iov/faucets"));
  console.log(colors.yellow("    - IovFaucet"));
  console.log(colors.yellow("  * helper functions"));
  console.log(colors.yellow("    - toAscii"));
  console.log(colors.yellow("    - fromHex"));
  console.log(colors.yellow("    - toHex"));

  let init = `
    import leveldown = require('leveldown');
    import levelup from "levelup";
    import * as http from 'http';
    import * as https from 'https';
    import Long from "long";
    import {
      bnsCodec,
      bnsConnector,
    } from '@iov/bns';
    import {
      Address,
      ChainId,
      Ed25519HdWallet,
      HdPaths,
      Keyring,
      MultiChainSigner,
      Nonce,
      Secp256k1HdWallet,
      SendTransaction,
      TokenTicker,
      UserProfile,
      Wallet,
      WalletId,
      WalletImplementationIdString,
      WalletSerializationString,
    } from "@iov/core";
    import { Bip39, Ed25519, Ed25519Keypair, Random, Sha256, Sha512 } from '@iov/crypto';
    import { Bech32, Encoding } from '@iov/encoding';
    import { IovFaucet } from '@iov/faucets';
    const { toAscii, fromHex, toHex } = Encoding;
  `;

  if (args.selftest) {
    // execute some trival stuff and exit
    init += `
      const hash = new Sha512(new Uint8Array([])).digest();
      const hexHash = toHex(hash);
      export class NewDummyClass {};

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic("degree tackle suggest window test behind mesh extra cover prepare oak script"));
      const db = levelup(leveldown('./selftest_userprofile_db'));
      await profile.storeIn(db, "secret passwd");
      const profileFromDb = await UserProfile.loadFrom(db, "secret passwd");

      console.log("Done testing, will exit now.");
      process.exit(0);
    `;
  }

  const tsconfigPath = join(__dirname, "..", "tsconfig_repl.json");
  const installationDir = join(__dirname, "..");
  new TsRepl(tsconfigPath, init, !!args.debug, installationDir).start().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
