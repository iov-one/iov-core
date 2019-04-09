import { ContractAbi } from "web3x/contract";
export default new ContractAbi([
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "id",
        type: "bytes32",
      },
      {
        indexed: false,
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        name: "hash",
        type: "bytes32",
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        name: "timeout",
        type: "uint256",
      },
    ],
    name: "Opened",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "id",
        type: "bytes32",
      },
      {
        indexed: false,
        name: "preimage",
        type: "bytes32",
      },
    ],
    name: "Claimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "id",
        type: "bytes32",
      },
    ],
    name: "Aborted",
    type: "event",
  },
  {
    constant: false,
    inputs: [
      {
        name: "id",
        type: "bytes32",
      },
      {
        name: "recipient",
        type: "address",
      },
      {
        name: "hash",
        type: "bytes32",
      },
      {
        name: "timeout",
        type: "uint256",
      },
    ],
    name: "open",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "id",
        type: "bytes32",
      },
      {
        name: "preimage",
        type: "bytes32",
      },
    ],
    name: "claim",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "id",
        type: "bytes32",
      },
    ],
    name: "abort",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "id",
        type: "bytes32",
      },
    ],
    name: "get",
    outputs: [
      {
        name: "sender",
        type: "address",
      },
      {
        name: "recipient",
        type: "address",
      },
      {
        name: "hash",
        type: "bytes32",
      },
      {
        name: "timeout",
        type: "uint256",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "preimage",
        type: "bytes32",
      },
      {
        name: "state",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
]);
