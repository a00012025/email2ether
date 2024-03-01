import {
  createPublicClient,
  http,
  getContract,
  createWalletClient,
  Chain,
} from "viem";
import EmailAccountAbi from "./abi/EmailAccount";
import {
  arbitrumSepolia,
  polygonMumbai,
  baseSepolia,
  lineaTestnet,
} from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import EmailAccountFactoryAbi from "./abi/EmailAccountFactory";
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CHAIN_ID = process.env.CHAIN_ID;
if (!PRIVATE_KEY || !CHAIN_ID) {
  throw new Error("PRIVATE_KEY or RPC_URL or CHAIN_ID env variable is missing");
}
let network: Chain;
let accountFactoryContractAddr: string;
if (CHAIN_ID === "42161") {
  network = arbitrumSepolia;
  accountFactoryContractAddr = "0x763c0B996E6C931e828974b87Dcf455c0F3D49e7";
} else if (CHAIN_ID === "80001") {
  network = polygonMumbai;
  accountFactoryContractAddr = "0xD570bF4598D3ccF214E288dd92222b8Bd3134984";
} else if (CHAIN_ID === "84532") {
  network = baseSepolia;
  accountFactoryContractAddr = "";
} else if (CHAIN_ID === "59140") {
  network = lineaTestnet;
  accountFactoryContractAddr = "";
} else {
  throw new Error("Invalid CHAIN_ID");
}

export const walletClient = createWalletClient({
  account: privateKeyToAccount(PRIVATE_KEY as `0x${string}`),
  chain: arbitrumSepolia,
  transport: http(),
});

const accountFactory = getContract({
  address: accountFactoryContractAddr as `0x${string}`,
  abi: EmailAccountFactoryAbi,
  client: walletClient,
});

let currentNonce: number;

export async function initWallet() {
  const publicClient = createPublicClient({
    chain: network,
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
