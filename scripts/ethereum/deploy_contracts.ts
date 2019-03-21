// tslint:disable: no-submodule-imports
import { Address } from 'web3x/address';
import { Eth } from 'web3x/eth';
import { WebsocketProvider } from 'web3x/providers';

import { AshToken } from "../../packages/iov-ethereum/src/contracts/AshToken";

const ganacheHost = `localhost:${process.env.GANACHE_PORT}`;
const ganacheGasPrice = 50000;

// From README.md
const mainIdentity = Address.fromString("0x88F3b5659075D0E06bB1004BE7b1a7E66F452284");
const secondIdentity = Address.fromString("0x0A65766695A712Af41B5cfECAaD217B1a11CB22A");

function debugAddress(address: Address | undefined): string | undefined {
  return address ? address.toString() : undefined;
}

async function main(): Promise<void> {
  const provider = new WebsocketProvider(`ws://${ganacheHost}/ws`);
  const eth = new Eth(provider);

  // Order matters to get reproducible contract addresses
  const contracts = new Map([
    ["AshToken", new AshToken(eth)],
  ]);

  for (const [name, contract] of contracts) {
    const deploymentTransaction = contract.deploy();

    const estimatedGas = await deploymentTransaction.estimateGas();
    const gasLimit = Math.round(estimatedGas * 1.5);

    const receipt = await deploymentTransaction.send({ from: mainIdentity, gas: gasLimit }).getReceipt();
    console.log(`${name} deployed to`, debugAddress(receipt.contractAddress));

    if (typeof contract.methods.mint !== "undefined") {
      const quantity = "33445566";
      console.log(`Minting ${quantity} atomic units for ${secondIdentity} ...`);
      await contract.methods.mint(secondIdentity, quantity)
        .send({ from: mainIdentity, gasPrice: ganacheGasPrice })
        .getReceipt();
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
