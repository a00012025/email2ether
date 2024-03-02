#!/bin/bash

# Change contract address and chain id before using it

STRING_UTILS_ADDRESS="0x61aE9259C8dc1Ad08C7786E6158733c42c250e77"
VERIFIER_ADDRESS="0x8b3340EFcB90e586Edf0790538c7f3730560D4b3"
ACCOUNT_FACTORY_ADDRESS="0xD570bF4598D3ccF214E288dd92222b8Bd3134984"
CHAIN_ID="84532"

B_stripped=${VERIFIER_ADDRESS:2} # Remove '0x'
B_padded=$(printf '%064s' "$B_stripped" | tr ' ' '0')

forge verify-contract --chain-id $CHAIN_ID $STRING_UTILS_ADDRESS src/utils/StringUtils.sol:StringUtils
forge verify-contract --chain-id $CHAIN_ID $VERIFIER_ADDRESS src/email-account/Verifier.sol:Verifier
forge verify-contract --constructor-args "0x0000000000000000000000005FF137D4b0FDCD49DcA30c7CF57E578a026d2789${B_padded}" --chain-id $CHAIN_ID $ACCOUNT_FACTORY_ADDRESS --libraries src/utils/StringUtils.sol:StringUtils:$STRING_UTILS_ADDRESS src/email-account/EmailAccountFactory.sol:EmailAccountFactory
