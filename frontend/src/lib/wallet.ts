import { Account, Client, createWalletClient, http, publicActions } from "viem";
import { arbitrumSepolia } from "viem/chains";

let client: Client | null = null;
function createClientFromAccount(account: Account) {
  if (!client) {
    client = createWalletClient({
      account,
      chain: arbitrumSepolia,
      transport: http(
        "https://arb-sepolia.g.alchemy.com/v2/jDR80Y23Gv4tPFHxHpPVwOK6PE4_a3kL"
      ),
    }).extend(publicActions);
  }
  return client;
}

export { createClientFromAccount };
export default client;
