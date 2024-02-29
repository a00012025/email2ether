import { buildPoseidon } from "circomlibjs";

const CIRCOM_ARRAY_PARTITION = 31;

function partitionArray<T>(array: T[], partitionSize: number): T[][] {
  const partitionedArray: T[][] = [];

  for (let i = 0; i < array.length; i += partitionSize) {
    const chunk = array.slice(i, i + partitionSize);
    partitionedArray.push(chunk);
  }

  return partitionedArray;
}

function stringToCircomArray(input: string, maxLength: number = 16): bigint[] {
  const asciiArray = Array.from(input).map((char) => char.charCodeAt(0));

  const partitionedArray = partitionArray(asciiArray, CIRCOM_ARRAY_PARTITION);

  const circomArray: bigint[] = partitionedArray.map((partition) => {
    const paddedPartition = partition.concat(
      new Array(CIRCOM_ARRAY_PARTITION - partition.length).fill(0)
    );

    return arrayToBase256Number(paddedPartition);
  });

  return circomArray;
}

function arrayToBase256Number(arr: number[]): bigint {
  let number: bigint = BigInt(0);

  for (let i = 0; i < arr.length; i++) {
    number += BigInt(arr[i]) * BigInt(256 ** i);
  }

  return number;
}

async function poseidonCircom(circomArray: bigint[]) {
  const poseidon = await buildPoseidon();

  const res = poseidon(circomArray);

  return poseidon.F.toString(res);
}

export { poseidonCircom, stringToCircomArray };
