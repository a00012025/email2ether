import { handleOps, initWallet } from "./wallet";
require("dotenv").config();

async function main() {
  await initWallet();
  const txHash = await handleOps("421614");
  console.log("txHash:", txHash);
}

main().catch(console.error);
