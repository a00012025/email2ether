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
import {
  MAX_BODY_PADDED_BYTES,
  MAX_HEADER_PADDED_BYTES,
} from "@/helpers/constants";
// const snarkjs = require("snarkjs");

type ChangeOwnerCircuitInput = {
  in_padded: string[];
  pubkey: string[];
  signature: string[];
  in_len_padded_bytes: string;
  sender_email_idx: string;
  owner_address_idx: string;
};

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
    maxMessageLength: MAX_HEADER_PADDED_BYTES, // Maximum allowed length of the message in circuit
    maxBodyLength: MAX_BODY_PADDED_BYTES, // Maximum allowed length of the body in circuit
    ignoreBodyHashCheck: false, // To be used when ignore_body_hash_check is true in circuit
  });

  const in_padded_buf = emailVerifierInputs.in_padded.map((c) => Number(c));
  const in_padded_str = in_padded_buf
    .map((c) => String.fromCharCode(c))
    .join("");

  // get sender email index
  const re_from =
    /(?:(?:\r\n)|^)from:(?:[^\r\n]+<)?([A-Za-z0-9!#$%&'\\*\\+-/=\\?^_`{\\|}~\\.]+@[A-Za-z0-9\\.-]+)/gm;
  const match_from = Array.from(in_padded_str.matchAll(re_from))[0];
  const sender_email = match_from[1];
  const sender_email_idx =
    match_from.index! +
    in_padded_str.substring(match_from.index!).indexOf(sender_email);

  const re_subject = /\r\nsubject:Change owner to 0x([a-fA-F0-9]+)/gm;
  const match_subject = Array.from(in_padded_str.matchAll(re_subject))[0];
  const owner_address = match_subject[1];
  const owner_address_idx =
    match_subject.index! +
    in_padded_str.substring(match_subject.index!).indexOf(owner_address);

  // not using body hash here
  const circuitInputs: ChangeOwnerCircuitInput = {
    in_padded: emailVerifierInputs.in_padded,
    pubkey: emailVerifierInputs.pubkey,
    signature: emailVerifierInputs.signature,
    in_len_padded_bytes: emailVerifierInputs.in_len_padded_bytes,
    sender_email_idx: sender_email_idx.toString(),
    owner_address_idx: owner_address_idx.toString(),
  };

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
