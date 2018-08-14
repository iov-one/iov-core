import { ArgumentParser } from "argparse";
import colors = require("colors/safe");
import { join } from "path";

import { TsRepl } from "./tsrepl";

export const main = (originalArgs: string[]): void => {
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
  const args = parser.parseArgs(originalArgs);

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
  console.log(colors.yellow("  * from @iov/core"));
  console.log(colors.yellow("    - Address"));
  console.log(colors.yellow("    - bnsConnector"));
  console.log(colors.yellow("    - bnsFromOrToTag"));
  console.log(colors.yellow("    - ChainId"));
  console.log(colors.yellow("    - Ed25519SimpleAddressKeyringEntry"));
  console.log(colors.yellow("    - Keyring"));
  console.log(colors.yellow("    - KeyringEntry"));
  console.log(colors.yellow("    - KeyringEntryImplementationIdString"));
  console.log(colors.yellow("    - KeyringEntrySerializationString"));
  console.log(colors.yellow("    - Nonce"));
  console.log(colors.yellow("    - UserProfile"));
  console.log(colors.yellow("    - SendTx"));
  console.log(colors.yellow("    - TokenTicker"));
  console.log(colors.yellow("    - TransactionKind"));
  console.log(colors.yellow("    - IovWriter"));
  console.log(colors.yellow("    - withConnectors"));
  console.log(colors.yellow("  * from @iov/crypto"));
  console.log(colors.yellow("    - Bip39"));
  console.log(colors.yellow("    - Ed25519"));
  console.log(colors.yellow("    - Ed25519Keypair"));
  console.log(colors.yellow("    - Random"));
  console.log(colors.yellow("    - Sha256"));
  console.log(colors.yellow("    - Sha512"));
  console.log(colors.yellow("  * from @iov/encoding"));
  console.log(colors.yellow("    - Encoding"));
  console.log(colors.yellow("  * helper functions"));
  console.log(colors.yellow("    - wait"));
  console.log(colors.yellow("    - toAscii"));
  console.log(colors.yellow("    - fromHex"));
  console.log(colors.yellow("    - toHex"));

  let init = `
    import leveldown = require('leveldown');
    import levelup = require('levelup');
    import * as http from 'http';
    import * as https from 'https';
    import Long from "long";
    import { Address, bnsConnector, bnsFromOrToTag, ChainId, Ed25519SimpleAddressKeyringEntry, Keyring, KeyringEntry, KeyringEntryImplementationIdString, KeyringEntrySerializationString, Nonce, SendTx, TokenTicker, TransactionKind, UserProfile, IovWriter, withConnectors } from "@iov/core";
    import { bnsCodec } from '@iov/bns';
    import { Bip39, Ed25519, Ed25519Keypair, Random, Sha256, Sha512 } from '@iov/crypto';
    import { Encoding } from '@iov/encoding';
    const { toAscii, fromHex, toHex } = Encoding;
    function wait<T>(promise: Promise<T>): T { return require('deasync2').await(promise); }
  `;

  if (args.selftest) {
    // execute some trival stuff and exit
    init += `
      const hash = new Sha512(new Uint8Array([])).digest();
      const hexHash = toHex(hash);
      export class NewDummyClass {};
      console.log("Done testing, will exit now.");
      process.exit(0);
    `;
  }

  new TsRepl(join(__dirname, "..", "tsconfig_repl.json"), init, !!args.debug).start();
};
