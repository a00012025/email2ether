import { readFileSync } from "fs";
const wc = require("./witness/witness_calculator.js");

export async function generateWitness(
  input: any,
  wasmPath: string
): Promise<Buffer> {
  const buffer = readFileSync(wasmPath);
  const wtnsCalculator = await wc(buffer);
  return await wtnsCalculator.calculateWTNSBin(input, 0);
}
