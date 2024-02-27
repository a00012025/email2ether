import { program } from "commander";

import { poseidonCircom } from "../utils/poseidon-circom";

program
  .name("Poseidon email Hasher")
  .description("CLI tool to hash an email using Poseidon hash function")
  .version("1.0.0")
  .requiredOption("-e, --email <email>", "Email to hash");

program.parse(process.argv);

const options = program.opts();

if (options.email) {
  poseidonCircom(options.email).catch(console.error);
}
