import { UserOperation } from "./../../contracts/lib/account-abstraction/test/UserOperation";
import {
  createPublicClient,
  http,
  getContract,
  createWalletClient,
  Chain,
  WalletClient,
  TransactionExecutionError,
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
import EntryPointAbi from "./abi/EntryPoint";
import { getUserOpHash } from "@account-abstraction/utils";

require("dotenv").config();

const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY env variable is missing");
}

const networks: { [key: string]: Chain } = {
  "421614": arbitrumSepolia,
  // "80001": polygonMumbai,
  // "84532": baseSepolia,
  // "59140": lineaTestnet,
  // "11155111": sepolia,
  // "48899": zircuitTestnet,
};
const accountFactoryContractAddrs: { [key: string]: `0x${string}` } = {
  "421614": "0x2ECC385Af1fb4C7b2f37ad0295e603ed619B7C70",
  // "80001": "0xD570bF4598D3ccF214E288dd92222b8Bd3134984",
  // "84532": "0xD570bF4598D3ccF214E288dd92222b8Bd3134984",
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
const walletAddress = walletClients["421614"].account!.address as `0x${string}`;
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
  const results: { [key: string]: string } = {};
  for (const chainId of Object.keys(networks)) {
    for (let i = 0; i < 3; i++) {
      try {
        const result = await accountFactories[chainId].write.createAccount(
          [BigInt(emailHash), 0n] as const,
          {
            nonce: currentNonces[chainId]++,
          }
        );
        results[chainId] = result;
        break;
      } catch (error: unknown) {
        if (
          error instanceof TransactionExecutionError &&
          error.details.includes("nonce too low")
        ) {
          console.log(
            "Caught nonce too low error in create email acc. Retrying..."
          );
          currentNonces[chainId] = await publicClients[
            chainId
          ].getTransactionCount({
            address: walletAddress,
          });
          if (i === 2) {
            throw new Error("Failed to create email account after 3 retries");
          }
          continue;
        } else {
          // unknown error
          console.log("Caught unknown error in create email acc!", error);
          throw error;
        }
      }
    }
  }
  return results;
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
  const results: { [key: string]: string } = {};
  for (const chainId of Object.keys(networks)) {
    const emailAccount = getContract({
      address: accountAddresses[chainId],
      abi: EmailAccountAbi,
      client: walletClients[chainId],
    });
    for (let i = 0; i < 3; i++) {
      try {
        const result = await emailAccount.write.transferOwnership(
          [proof, publicSignals],
          {
            account: privateKeyToAccount(PRIVATE_KEY as `0x${string}`),
            chain: networks[chainId],
            nonce: currentNonces[chainId]++,
            gas: 800000n,
          }
        );
        results[chainId] = result;
        break;
      } catch (error: unknown) {
        if (
          error instanceof TransactionExecutionError &&
          error.details.includes("nonce too low")
        ) {
          console.log(
            "Caught nonce too low error in transfer ownership. Retrying..."
          );
          currentNonces[chainId] = await publicClients[
            chainId
          ].getTransactionCount({
            address: walletAddress,
          });
          if (i === 2) {
            throw new Error("Failed to transfer ownership after 3 retries");
          }
          continue;
        } else {
          // unknown error
          console.log("Caught unknown error in create email acc!", error);
          throw error;
        }
      }
    }
  }
  return results;
}

export async function handleOpsRaw(
  userOp: any,
  chainId: string
): Promise<string> {
  const entryPoint = getContract({
    address: ENTRYPOINT_ADDRESS,
    abi: EntryPointAbi,
    client: walletClients[chainId]!,
  });

  console.log("Full user op:", userOp);
  for (let i = 0; i < 3; i++) {
    try {
      const txHash = await entryPoint.write.handleOps(
        [[userOp], walletAddress],
        {
          account: privateKeyToAccount(PRIVATE_KEY as `0x${string}`),
          chain: networks[chainId],
          nonce: currentNonces[chainId]++,
          gas: 800000n,
          maxFeePerGas: BigInt(2e8),
          maxPriorityFeePerGas: BigInt(2e8),
        }
      );
      return txHash;
    } catch (error: unknown) {
      if (
        error instanceof TransactionExecutionError &&
        error.details.includes("nonce too low")
      ) {
        console.log("Caught nonce too low error. Retrying...");
        currentNonces[chainId] = await publicClients[
          chainId
        ].getTransactionCount({
          address: walletAddress,
        });
        if (i === 2) {
          throw new Error("Failed to handle ops after 3 retries");
        }
        continue;
      } else {
        // unknown error
        console.log("Caught unknown error!", error);
        throw error;
      }
    }
  }
  throw new Error("Failed!");
}

export async function handleOps(chainId: string) {
  const entryPoint = getContract({
    address: ENTRYPOINT_ADDRESS,
    abi: EntryPointAbi,
    client: walletClients[chainId]!,
  });
  const userOp = {
    sender: "0x3730a6137887C55D6D1871A91500a64EF649F8B7" as const,
    nonce: 2n,
    initCode: "0x" as const,
    callData:
      "0xb61d27f60000000000000000000000000000007eabfc2e6a6b33b21d2f73d58941bab574000000000000000000000000000000000000000000000000000000003b9aca0000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000" as const,
    callGasLimit: 50000n,
    verificationGasLimit: 100000n,
    preVerificationGas: 100000n,
    maxFeePerGas: BigInt(2e8),
    maxPriorityFeePerGas: BigInt(2e8),
    paymasterAndData: "0xFB0AD3C188DC1D3D490C4e00aBF261Aa5613a25b" as const,
    signature: "0x" as `0x${string}`,
  };

  const userOpHash = getUserOpHash(
    userOp,
    ENTRYPOINT_ADDRESS,
    Number.parseInt(chainId)
  );
  console.log("userOpHash", userOpHash);
  userOp.signature = (await privateKeyToAccount(
    PRIVATE_KEY as `0x${string}`
  ).signMessage({
    message: {
      raw: userOpHash as `0x${string}`,
    },
  })) as `0x${string}`;
  console.log("Full user op:", userOp);
  return entryPoint.write.handleOps([[userOp], walletAddress], {
    account: privateKeyToAccount(PRIVATE_KEY as `0x${string}`),
    chain: networks[chainId],
    nonce: currentNonces[chainId]++,
    gas: 800000n,
    maxFeePerGas: BigInt(2e8),
    maxPriorityFeePerGas: BigInt(2e8),
  });
}
