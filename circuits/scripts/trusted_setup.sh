#!/bin/bash

set -e

mkdir -p setup

# phase 1
if [ ! -f setup/pot22_0000.ptau ]; then
  snarkjs powersoftau new bn128 22 setup/pot22_0000.ptau
fi
if [ ! -f setup/pot22_0001.ptau ]; then
  snarkjs powersoftau contribute setup/pot22_0000.ptau setup/pot22_0001.ptau --name="First contribution" -e="ds982JDiubv2"
fi
if [ ! -f setup/pot22_final.ptau ]; then
  snarkjs powersoftau prepare phase2 setup/pot22_0001.ptau setup/pot22_final.ptau
fi

# phase 2
snarkjs groth16 setup build/email_change_owner.r1cs setup/pot22_final.ptau setup/email_change_owner_0000.zkey
snarkjs zkey contribute setup/email_change_owner_0000.zkey setup/email_change_owner_0001.zkey --name="1st Contributor Name" -e="v93iUFDIU87t3vl"

# export
snarkjs zkey export verificationkey setup/email_change_owner_0001.zkey setup/verification_key.json
