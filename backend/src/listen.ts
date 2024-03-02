import { generateInputs } from "./gen-input";
import { initEmailAuth, listenForNewEmails } from "./email";
import { generateProof } from "./gen-proof";
import {
  createEmailAccount,
  getEmailAccountAddress,
  initWallet,
  transferOwnership,
} from "./wallet";
require("dotenv").config();

async function main() {
  await initEmailAuth();
  await initWallet();
  await listenForNewEmails(async (email) => {
    const { circuitInputs: inputs, sender_email } = await generateInputs(email);
    console.log("Input generated. Email:", sender_email);

    const { emailHash, proof, publicSignals } = await generateProof(
      inputs,
      sender_email
    );
    console.log("Proof generated. Email hash:", emailHash);

    // create email account
    let txHashes = await createEmailAccount(emailHash);
    const accountAddresses = await getEmailAccountAddress(emailHash);
    console.log(
      `Contract account created. Address: ${JSON.stringify(accountAddresses)}, txHash: ${JSON.stringify(txHashes)}`
    );

    // send proof to chain
    txHashes = await transferOwnership(accountAddresses, proof, publicSignals);
    console.log("Ownership transferred. txHash:", JSON.stringify(txHashes));
  });
}

main().catch(console.error);
