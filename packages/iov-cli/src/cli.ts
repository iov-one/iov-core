import { ArgumentParser } from "argparse";
// tslint:disable-next-line:no-submodule-imports
import colors = require("colors/safe");
import { join } from "path";

import { TsRepl } from "./tsrepl";

export function main(originalArgs: readonly string[]): void {
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
    console.info(version);
    return;
  }

  const imports = new Map<string, readonly string[]>([
    [
      "@iov/bcp",
      [
        "Address",
        "Algorithm",
        "ChainId",
        "Nonce",
        "PubkeyBytes",
        "SendTransaction",
        "TokenTicker",
        "TransactionId",
        "WithChainId",
        // block info
        "BlockInfoPending",
        "BlockInfoSucceeded",
        "BlockInfoFailed",
        "BlockInfo",
        "isBlockInfoPending",
        "isBlockInfoSucceeded",
        "isBlockInfoFailed",
      ],
    ],
    [
      "@iov/bns",
      [
        "bnsCodec",
        "BnsConnection",
        "createBnsConnector",
        // Conditions
        "electionRuleIdToAddress",
        "escrowIdToAddress",
        "multisignatureIdToAddress",
        "swapToAddress",
        // Usernames
        "ChainAddressPair",
        "BnsUsernamesByOwnerQuery",
        "BnsUsernamesByUsernameQuery",
        "BnsUsernamesQuery",
        "BnsUsernameNft",
        "RegisterUsernameTx",
        "isRegisterUsernameTx",
        "UpdateTargetsOfUsernameTx",
        "isUpdateTargetsOfUsernameTx",
        "TransferUsernameTx",
        "isTransferUsernameTx",
        // Multisignature contracts
        "Participant",
        "CreateMultisignatureTx",
        "isCreateMultisignatureTx",
        "UpdateMultisignatureTx",
        "isUpdateMultisignatureTx",
        "MultisignatureTx",
        "isMultisignatureTx",
        // Escrows
        "CreateEscrowTx",
        "isCreateEscrowTx",
        "ReleaseEscrowTx",
        "isReleaseEscrowTx",
        "ReturnEscrowTx",
        "isReturnEscrowTx",
        "UpdateEscrowPartiesTx",
        "isUpdateEscrowPartiesTx",
      ],
    ],
    [
      "@iov/crypto",
      [
        "Bip39",
        "Ed25519",
        "Ed25519Keypair",
        "EnglishMnemonic",
        "Random",
        "Secp256k1",
        "Sha256",
        "Sha512",
        "Slip10",
        "Slip10Curve",
        "Slip10RawIndex",
      ],
    ],
    [
      "@iov/encoding",
      [
        "Bech32",
        "Encoding",
        // integers
        "Int53",
        "Uint32",
        "Uint53",
        "Uint64",
      ],
    ],
    [
      "@iov/ethereum",
      [
        "EthereumConnection",
        "EthereumConnectionOptions",
        "createEthereumConnector",
        "ethereumCodec",
        "pubkeyToAddress as ethereumPubkeyToAddress",
      ],
    ],
    ["@iov/faucets", ["IovFaucet"]],
    [
      "@iov/keycontrol",
      [
        "Ed25519HdWallet",
        "HdPaths",
        "Keyring",
        "Secp256k1HdWallet",
        "UserProfile",
        "Wallet",
        "WalletId",
        "WalletImplementationIdString",
        "WalletSerializationString",
      ],
    ],
    ["@iov/lisk", ["liskCodec", "LiskConnection", "createLiskConnector"]],
    ["@iov/multichain", ["MultiChainSigner"]],
  ]);

  console.info(colors.green("Initializing session for you. Have fun!"));
  console.info(colors.yellow("Available imports:"));
  console.info(colors.yellow("  * http"));
  console.info(colors.yellow("  * https"));
  console.info(colors.yellow("  * leveldown"));
  console.info(colors.yellow("  * levelup"));
  console.info(colors.yellow("  * from long"));
  console.info(colors.yellow("    - Long"));
  for (const moduleName of imports.keys()) {
    console.info(colors.yellow(`  * from ${moduleName}`));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    for (const symbol of imports.get(moduleName)!) {
      console.info(colors.yellow(`    - ${symbol}`));
    }
  }
  console.info(colors.yellow("  * helper functions"));
  console.info(colors.yellow("    - toAscii"));
  console.info(colors.yellow("    - fromHex"));
  console.info(colors.yellow("    - toHex"));

  let init = `
    import leveldown = require('leveldown');
    import levelup from "levelup";
    import * as http from 'http';
    import * as https from 'https';
    import Long from "long";
  `;
  for (const moduleName of imports.keys()) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    init += `import { ${imports.get(moduleName)!.join(", ")} } from "${moduleName}";\n`;
  }
  init += `const { toAscii, fromHex, toHex } = Encoding;\n`;

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

      console.info("Done testing, will exit now.");
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
