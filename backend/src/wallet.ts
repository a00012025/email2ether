import {
  createPublicClient,
  http,
  getContract,
  createWalletClient,
  Chain,
  WalletClient,
} from "viem";
import EmailAccountAbi from "./abi/EmailAccount";
import {
  sepolia,
  arbitrumSepolia,
  polygonMumbai,
  baseSepolia,
  lineaTestnet,
} from "viem/chains";
import { zircuitTestnet } from "./utils/zircuit";
import { privateKeyToAccount } from "viem/accounts";
import EmailAccountFactoryAbi from "./abi/EmailAccountFactory";
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY env variable is missing");
}

const networks: { [key: string]: Chain } = {
  "42161": arbitrumSepolia,
  "80001": polygonMumbai,
  "84532": baseSepolia,
  // "59140": lineaTestnet,
  // "11155111": sepolia,
  // "48899": zircuitTestnet,
};
const accountFactoryContractAddrs: { [key: string]: `0x${string}` } = {
  "42161": "0x763c0B996E6C931e828974b87Dcf455c0F3D49e7",
  "80001": "0xD570bF4598D3ccF214E288dd92222b8Bd3134984",
  "84532": "0xD570bF4598D3ccF214E288dd92222b8Bd3134984",
  // "59140": "0x0",
  // "11155111": "0x0",
  // "48899": "0x0",
};

const walletClients: { [key: string]: WalletClient } = {};
const accountFactories: { [key: string]: any } = {};
for (const [chainId, network] of Object.entries(networks)) {
  walletClients[chainId] = createWalletClient({
    account: privateKeyToAccount(PRIVATE_KEY as `0x${string}`),
    chain: network,
    transport: http(),
  });
  accountFactories[chainId] = getContract({
    address: accountFactoryContractAddrs[chainId],
    abi: EmailAccountFactoryAbi,
    client: walletClients[chainId],
  });
}
const walletAddress = walletClients["42161"].account!.address as `0x${string}`;
const publicClients: { [key: string]: any } = {};
const currentNonces: { [key: string]: number } = {};

export async function initWallet() {
  for (const [chainId, network] of Object.entries(networks)) {
    publicClients[chainId] = createPublicClient({
      chain: network,
      transport: http(),
    });
    currentNonces[chainId] = await publicClients[chainId].getTransactionCount({
      address: walletAddress,
    });
  }
}

export async function createEmailAccount(emailHash: string) {
  return Promise.all(
    Object.keys(networks).map(async (chainId) => {
      try {
        return accountFactories[chainId].write.createAccount(
          [BigInt(emailHash), 0n] as const,
          {
            nonce: currentNonces[chainId]++,
          }
        );
      } catch (error: any) {
        if (error.message.includes("nonce too low")) {
          console.log(
            `nonce too low for ${chainId}. Retrying createEmailAccount`
          );
          currentNonces[chainId] = await publicClients[
            chainId
          ].getTransactionCount({
            address: walletAddress,
          });
          return accountFactories[chainId].write.createAccount(
            [BigInt(emailHash), 0n] as const,
            {
              nonce: currentNonces[chainId]++,
            }
          );
        }
      }
    })
  );
}

export async function getEmailAccountAddress(emailHash: string): Promise<{
  [ket: string]: `0x${string}`;
}> {
  const results = await Promise.all(
    Object.keys(networks).map(async (chainId) => {
      const address: `0x${string}` = await accountFactories[
        chainId
      ].read.getAddress([BigInt(emailHash), 0n]);
      return { [chainId]: address };
    })
  );
  return Object.assign({}, ...results);
}

export async function transferOwnership(
  accountAddresses: { [key: string]: `0x${string}` },
  proof: any,
  publicSignals: any
) {
  return Promise.all(
    Object.keys(networks).map((chainId) => {
      const emailAccount = getContract({
        address: accountAddresses[chainId],
        abi: EmailAccountAbi,
        client: walletClients[chainId],
      });
      try {
        return emailAccount.write.transferOwnership([proof, publicSignals], {
          account: privateKeyToAccount(PRIVATE_KEY as `0x${string}`),
          chain: networks[chainId],
          nonce: currentNonces[chainId]++,
          gas: 800000n,
        });
      } catch (error: any) {
        if (error.message.includes("nonce too low")) {
          console.log(
            `nonce too low for ${chainId}. Retrying transferOwnership`
          );
          currentNonces[chainId] = publicClients[chainId].getTransactionCount({
            address: walletAddress,
          });
          return emailAccount.write.transferOwnership([proof, publicSignals], {
            account: privateKeyToAccount(PRIVATE_KEY as `0x${string}`),
            chain: networks[chainId],
            nonce: currentNonces[chainId]++,
            gas: 800000n,
          });
        }
      }
    })
  );
}
