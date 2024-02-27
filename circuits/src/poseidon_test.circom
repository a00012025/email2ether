pragma circom 2.1.5;

include "@zk-email/circuits/helpers/utils.circom";
include "circomlib/circuits/poseidon.circom";

template PoseidonTest() {
  signal input in[31];
  signal output out;

  component b2p = Bytes2Packed(31);
  component pos = Poseidon(1);

  for (var j = 0; j < 31; j++) {
    b2p.in[j] <== in[j];
  }
  pos.inputs[0] <== b2p.out;
  out <== pos.out;
}

component main = PoseidonTest();
