// tslint:disable: no-submodule-imports
import { Address } from "web3x/address";
import { Contract, TxSend } from "web3x/contract";
import { Eth } from "web3x/eth";
import { WebsocketProvider } from "web3x/providers";

import { AshToken } from "./AshToken";
import { AtomicSwapErc20 } from "./AtomicSwapErc20";
import { AtomicSwapEther } from "./AtomicSwapEther";
import { TrashToken } from "./TrashToken";

const ganacheGasPrice = 50000;

// From README.md
const mainIdentity = Address.fromString("0x88F3b5659075D0E06bB1004BE7b1a7E66F452284");
const secondIdentity = Address.fromString("0x0A65766695A712Af41B5cfECAaD217B1a11CB22A");
const noEthAddress = Address.fromString("0x0000000000111111111122222222223333333333");

function debugAddress(address: Address | undefined): string | undefined {
  return address ? address.toString() : undefined;
}

interface DeployableContract extends Contract<any> {
  readonly deploy: () => TxSend<any>;
}

interface DeploymentJob {
  readonly name: string;
  readonly contract: DeployableContract;
}

interface MintingJob {
  readonly name: string;
  readonly contract: DeployableContract;
  readonly recipient: Address;
  readonly quantity: string;
}

export async function main(args: ReadonlyArray<string>): Promise<void> {
  const ganacheUrl = args[0];

  const provider = new WebsocketProvider(ganacheUrl);
  const eth = new Eth(provider);

  const mintingJobs = new Array<MintingJob>();

  // Order matters to get reproducible contract addresses
  const deploymentJobs: ReadonlyArray<DeploymentJob> = [
    { name: "AshToken", contract: new AshToken(eth) },
    { name: "TrashToken", contract: new TrashToken(eth) },
    { name: "AtomicSwapEther", contract: new AtomicSwapEther(eth) },
    { name: "AtomicSwapErc20", contract: new AtomicSwapErc20(eth) },
  ];

  for (const { name, contract } of deploymentJobs) {
    const deploymentTransaction = contract.deploy();

    const estimatedGas = await deploymentTransaction.estimateGas();
    const gasLimit = Math.round(estimatedGas * 1.5);

    const receipt = await deploymentTransaction.send({ from: mainIdentity, gas: gasLimit }).getReceipt();
    console.info(`${name} deployed to`, debugAddress(receipt.contractAddress));

    if (typeof contract.methods.mint !== "undefined") {
      mintingJobs.push(
        { name: name, contract: contract, recipient: mainIdentity, quantity: "100000000" /* 100 million atomics */ },
        { name: name, contract: contract, recipient: secondIdentity, quantity: "33445566" },
        { name: name, contract: contract, recipient: noEthAddress, quantity: "38" },
      );
    }
  }

  // Perform minting jobs after all deployments so that deployment nonces stay constant
  for (const { name, contract, recipient, quantity } of mintingJobs) {
    console.info(`Minting ${quantity} atomic units of ${name} for ${recipient} ...`);
    await contract.methods
      .mint(recipient, quantity)
      .send({ from: mainIdentity, gasPrice: ganacheGasPrice })
      .getReceipt();
  }
}
