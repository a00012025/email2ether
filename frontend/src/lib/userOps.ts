import { getUserOpHash } from "@account-abstraction/utils";
import {
  PrivateKeyAccount,
  createWalletClient,
  encodeFunctionData,
  getContract,
  http,
} from "viem";
import { arbitrumSepolia } from "viem/chains";

import demoNftAbi from "../constants/DemoNftAbi.json";
import emailAccountAbi from "../constants/EmailAccountAbi";
import entryPointAbi from "../constants/EntryPointAbi";

const DEMO_NFT_ADDRESS = "0x31055ED712eE29841f09D5F9a46964581829f15e";
const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PAYMASTER_ADDRESS = "0xFB0AD3C188DC1D3D490C4e00aBF261Aa5613a25b";
const CHAIN_ID = "421614";

export const generateNftMintingCalldata = (
  recipient: string,
  imgIdx: number
) => {
  const data = encodeFunctionData({
    abi: demoNftAbi.abi,
    functionName: "mint",
    args: [recipient, imgIdx],
  });

  const calldata = encodeFunctionData({
    abi: emailAccountAbi,
    functionName: "execute",
    args: [DEMO_NFT_ADDRESS, 0n, data],
  });

  return calldata;
};

const getCurrentNonce = async (address: string) => {
  const walletClient = createWalletClient({
    chain: arbitrumSepolia,
    transport: http(),
  });
  const entrypoint = getContract({
    address: ENTRYPOINT_ADDRESS,
    abi: entryPointAbi,
    client: walletClient,
  });
  const nonce = await entrypoint.read.nonceSequenceNumber([
    address as `0x${string}`,
    0n,
  ]);
  return nonce;
};

export const generateUserOps = async (sender: string, calldata: string) => {
  const nonce = await getCurrentNonce(sender);

  return {
    sender,
    nonce,
    callData: calldata,
    initCode: "0x",
    callGasLimit: 200000n,
    verificationGasLimit: 100000n,
    preVerificationGas: 100000n,
    maxFeePerGas: BigInt(2e8),
    maxPriorityFeePerGas: BigInt(2e8),
    paymasterAndData: PAYMASTER_ADDRESS,
    signature: "0x",
  };
};

export const signUserOps = async (userOp: any, account: PrivateKeyAccount) => {
  const userOpHash = getUserOpHash(
    userOp,
    ENTRYPOINT_ADDRESS,
    Number.parseInt(CHAIN_ID)
  );
  console.log("userOpHash", userOpHash);

  userOp.signature = (await account.signMessage({
    message: {
      raw: userOpHash as `0x${string}`,
    },
  })) as `0x${string}`;
  console.log("Full user op:", userOp);

  return userOp;
};
