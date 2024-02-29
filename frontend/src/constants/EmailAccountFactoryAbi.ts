export default [
  {
    type: "function",
    name: "createAccount",
    inputs: [
      {
        name: "emailHash",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "salt",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "ret",
        type: "address",
        internalType: "contract EmailAccount",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAddress",
    inputs: [
      {
        name: "emailHash",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "salt",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
] as const;
