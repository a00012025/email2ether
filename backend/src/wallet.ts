import {
  createPublicClient,
  http,
  getContract,
  createWalletClient,
} from "viem";
import EmailAccountAbi from "./abi/EmailAccount";
import { arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import EmailAccountFactoryAbi from "./abi/EmailAccountFactory";
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY || !RPC_URL) {
  throw new Error("PRIVATE_KEY or RPC_URL env variable is missing");
}

export const walletClient = createWalletClient({
  account: privateKeyToAccount(PRIVATE_KEY as `0x${string}`),
  chain: arbitrumSepolia,
  transport: http(),
});

const accountFactory = getContract({
  address: process.env.ACCOUNT_FACTORY_CONTRACT_ADDRESS! as `0x${string}`,
  abi: EmailAccountFactoryAbi,
  client: walletClient,
});

let currentNonce: number;

export async function initWallet() {
  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  });
  currentNonce = await publicClient.getTransactionCount({
    address: walletClient.account.address as `0x${string}`,
  });
}

export async function createEmailAccount(emailHash: string) {
  return accountFactory.write.createAccount([BigInt(emailHash), 0n] as const, {
    nonce: currentNonce++,
  });
}

export async function getEmailAccountAddress(emailHash: string) {
  return accountFactory.read.getAddress([BigInt(emailHash), 0n]);
}

export async function transferOwnership(
  accountAddress: `0x${string}`,
  proof: any,
  publicSignals: any
) {
  const emailAccount = getContract({
    address: accountAddress,
    abi: EmailAccountAbi,
    client: walletClient,
  });

  return await emailAccount.write.transferOwnership([proof, publicSignals], {
    nonce: currentNonce++,
  });
}
