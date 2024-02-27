#!/bin/bash

set -e

mkdir -p setup

# phase 1
if [ ! -f setup/powersOfTau28_hez_final_22.ptau ]; then
  curl https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_22.ptau -o setup/powersOfTau28_hez_final_22.ptau
fi

# phase 2
snarkjs groth16 setup build/email_change_owner.r1cs setup/powersOfTau28_hez_final_22.ptau setup/email_change_owner_0000.zkey
snarkjs zkey contribute setup/email_change_owner_0000.zkey setup/email_change_owner_0001.zkey --name="1st Contributor Name" -e="v93iUFDIU87t3vl"

# export
snarkjs zkey export verificationkey setup/email_change_owner_0001.zkey setup/verification_key.json
