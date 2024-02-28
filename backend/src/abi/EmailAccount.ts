export default [
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "proof",
        type: "uint256[8]",
        internalType: "uint256[8]",
      },
      {
        name: "signals",
        type: "uint256[5]",
        internalType: "uint256[5]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
