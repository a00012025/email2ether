/**
 *
 * This script is for generating input for the change owner circuit.
 *
 */

import { program } from "commander";
import fs from "fs";
import { promisify } from "util";
import { verifyDKIMSignature } from "@/helpers/dkim";
import { generateCircuitInputs } from "@/helpers/input-helpers";
import path from "path";
const snarkjs = require("snarkjs");

type ChangeOwnerCircuitInput = {
  in_padded: string[];
  pubkey: string[];
  signature: string[];
  in_len_padded_bytes: string;
  precomputed_sha?: string[];
  in_body_padded?: string[];
  in_body_len_padded_bytes?: string;
  body_hash_idx?: string;
  wallet_address_idx?: string;
};

const STRING_PRESELECTOR = "Please change my wallet owner address to =\r\n";
const MAX_HEADER_PADDED_BYTES = 1024;
const MAX_BODY_PADDED_BYTES = 192;

program
  .requiredOption("--email-file <string>", "Path to an email file")
  .requiredOption(
    "--input-file <string>",
    "Path of a json file to write the generated input"
  )
  .option("--silent", "No console logs")
  .option("--prove", "Also generate proof");

program.parse();
const args = program.opts();

function log(...message: any) {
  if (!args.silent) {
    console.log(...message);
  }
}

async function generate() {
  if (!args.inputFile.endsWith(".json")) {
    throw new Error("--input-file path arg must end with .json");
  }

  log("Generating Inputs for:", args);

  const rawEmail = Buffer.from(fs.readFileSync(args.emailFile, "utf8"));
  const dkimResult = await verifyDKIMSignature(rawEmail);
  const emailVerifierInputs = generateCircuitInputs({
    rsaSignature: dkimResult.signature, // The RSA signature of the email
    rsaPublicKey: dkimResult.publicKey, // The RSA public key used for verification
    body: dkimResult.body, // body of the email
    bodyHash: dkimResult.bodyHash, // hash of the email body
    message: dkimResult.message, // the message that was signed (header + bodyHash)
    //Optional to verify regex in the body of email
    shaPrecomputeSelector: STRING_PRESELECTOR, // String to split the body for SHA pre computation
    maxMessageLength: MAX_HEADER_PADDED_BYTES, // Maximum allowed length of the message in circuit
    maxBodyLength: MAX_BODY_PADDED_BYTES, // Maximum allowed length of the body in circuit
    ignoreBodyHashCheck: false, // To be used when ignore_body_hash_check is true in circuit
  });

  const bodyRemaining = emailVerifierInputs.in_body_padded!.map((c) =>
    Number(c)
  ); // Char array to Uint8Array
  const selectorBuffer = Buffer.from(STRING_PRESELECTOR);
  const walletAddressIndex =
    Buffer.from(bodyRemaining).indexOf(selectorBuffer) + selectorBuffer.length;

  const circuitInputs: ChangeOwnerCircuitInput = {
    ...emailVerifierInputs,
    wallet_address_idx: walletAddressIndex.toString(),
  };
  log("\n\nGenerated Inputs:", circuitInputs, "\n\n");
  await promisify(fs.writeFile)(
    args.inputFile,
    JSON.stringify(circuitInputs, null, 2)
  );

  log("Inputs written to", args.inputFile);

  // if (args.prove) {
  //   const dir = path.dirname(args.inputFile);
  //   const { proof, publicSignals } = await snarkjs.groth16.fullProve(
  //     circuitInputs,
  //     path.join(dir, "email_sender.wasm"),
  //     path.join(dir, "email_sender.zkey"),
  //     console
  //   );
  //   await promisify(fs.writeFile)(
  //     path.join(dir, "email_sender_proof.json"),
  //     JSON.stringify(proof, null, 2)
  //   );
  //   await promisify(fs.writeFile)(
  //     path.join(dir, "email_sender_public.json"),
  //     JSON.stringify(publicSignals, null, 2)
  //   );
  //   log("✓ Proof for email sender circuit generated");
  // }
  process.exit(0);
}

generate().catch((err) => {
  console.error("Error generating inputs", err);
  process.exit(1);
});
