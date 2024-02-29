import { createConfig, http } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";

export const config = createConfig({
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(
      "https://arb-sepolia.g.alchemy.com/v2/jDR80Y23Gv4tPFHxHpPVwOK6PE4_a3kL"
    ),
  },
});
