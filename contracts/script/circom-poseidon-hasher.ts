import { program } from "commander";

import { poseidonCircom, stringToCircomArray } from "../utils/poseidon-circom";

program
  .name("Poseidon circom Hasher")
  .description(
    "CLI tool to hash any string using Poseidon circom hash function"
  )
  .version("1.0.0")
  .requiredOption("-i, --input <input>", "String to hash")
  .option("-si, --show-input", "Show input uint256 array", false);

program.parse(process.argv);

const options = program.opts();

if (options.input) {
  const circomArray = stringToCircomArray(options.input);

  options.showInput && console.log(`Circom array input: ${circomArray}`);

  poseidonCircom(circomArray)
    .catch(console.error)
    .then((res) => {
      console.log(`Hashed email: ${res}`);
    });
}
