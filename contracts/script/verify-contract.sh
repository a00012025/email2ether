#!/bin/bash

# Change contract address and chain id before using it

A="0x61aE9259C8dc1Ad08C7786E6158733c42c250e77"
B="0x8b3340EFcB90e586Edf0790538c7f3730560D4b3"
C="0xD570bF4598D3ccF214E288dd92222b8Bd3134984"
chain_id="80001"

B_stripped=${B:2} # Remove '0x'
B_padded=$(printf '%064s' "$B_stripped" | tr ' ' '0')

forge verify-contract --chain-id $chain_id $A src/utils/StringUtils.sol:StringUtils
forge verify-contract --chain-id $chain_id $B src/email-account/Verifier.sol:Verifier
forge verify-contract --constructor-args "0x0000000000000000000000005FF137D4b0FDCD49DcA30c7CF57E578a026d2789${B_padded}" --chain-id $chain_id $C --libraries src/utils/StringUtils.sol:StringUtils:$A src/email-account/EmailAccountFactory.sol:EmailAccountFactory
