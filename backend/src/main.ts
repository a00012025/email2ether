import { generateInputs } from "./gen-input";
import { getOneEmail, initEmailAuth } from "./email";
import { generateProof } from "./gen-proof";
import {
  createEmailAccount,
  getEmailAccountAddress,
  initWallet,
  transferOwnership,
} from "./wallet";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  await initEmailAuth();
  await initWallet();

  const email = await getOneEmail();
  const { circuitInputs: inputs, sender_email } = await generateInputs(email);
  console.log("Input generated. Email:", sender_email);

  const { emailHash, proof, publicSignals } = await generateProof(
    inputs,
    sender_email
  );
  console.log("Proof generated. Email hash:", emailHash);

  // create email account
  await createEmailAccount(emailHash);
  const accountAddress = await getEmailAccountAddress(emailHash);
  console.log("Contract account created. Address:", accountAddress);

  // send proof to chain
  const res = await transferOwnership(accountAddress, proof, publicSignals);
  console.log("Ownership transferred", res);
}

main().catch(console.error);
