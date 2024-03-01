import { defineChain } from "viem";

export const zircuitTestnet = /*#__PURE__*/ defineChain({
  id: 48899,
  name: "Zircuit Testnet",
  nativeCurrency: { name: "Zircuit Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://zircuit1.p2pify.com/"],
      webSocket: ["wss://zircuit1.p2pify.com/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://explorer.zircuit.com",
      apiUrl: "https://explorer.zircuit.com/api",
    },
  },
  testnet: true,
});
