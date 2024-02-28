import * as fs from "fs";
import shelljs from "shelljs";
import { poseidonCircom, stringToCircomArray } from "./utils/poseidon-circom";
import { generateWitness } from "./gen-witness";

export async function generateProof(inputs: any, sender_email: string) {
  const witness = await generateWitness(
    inputs,
    "./src/witness/email_change_owner.wasm"
  );

  const uid = Math.random().toString(36).substring(7);
  const witnessFile = `files/witness-${uid}.wtns`;
  const proofFile = `files/proof-${uid}.json`;
  const publicFile = `files/public-${uid}.json`;
  fs.writeFileSync(witnessFile, witness);
  console.log("Witness file written to", witnessFile);

  shelljs.exec(
    `./rapidsnark ../circuits/setup/email_change_owner_0001.zkey ${witnessFile} ${proofFile} ${publicFile}`
  );

  // calculate email hash
  const circomArray = stringToCircomArray(sender_email);
  const emailHash: string = await poseidonCircom(circomArray);

  // convert json
  const proofJSON = JSON.parse(fs.readFileSync(proofFile, "utf-8"));
  const publicSignalsJSON = JSON.parse(fs.readFileSync(publicFile, "utf-8"));
  const proof = [
    BigInt(proofJSON.pi_a[0]),
    BigInt(proofJSON.pi_a[1]),
    BigInt(proofJSON.pi_b[0][1]),
    BigInt(proofJSON.pi_b[0][0]),
    BigInt(proofJSON.pi_b[1][1]),
    BigInt(proofJSON.pi_b[1][0]),
    BigInt(proofJSON.pi_c[0]),
    BigInt(proofJSON.pi_c[1]),
  ] as const;
  const publicSignals: [bigint, bigint, bigint, bigint, bigint] =
    publicSignalsJSON.map((x: string) => BigInt(x));

  return { emailHash, proof, publicSignals };
}
