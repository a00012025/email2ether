#!/bin/bash

# Change contract address and chain id before using it

STRING_UTILS_ADDRESS="0xFc201aE1649E3e297AB7C6487d7056206B30D352"
VERIFIER_ADDRESS="0xf08B61dCD4587162Dff301cCb3d8ff00d365a742"
ACCOUNT_FACTORY_ADDRESS="0x2ECC385Af1fb4C7b2f37ad0295e603ed619B7C70"
CHAIN_ID="421614"

B_stripped=${VERIFIER_ADDRESS:2} # Remove '0x'
B_padded=$(printf '%064s' "$B_stripped" | tr ' ' '0')

forge verify-contract --chain-id $CHAIN_ID $STRING_UTILS_ADDRESS src/utils/StringUtils.sol:StringUtils
forge verify-contract --chain-id $CHAIN_ID $VERIFIER_ADDRESS src/email-account/Verifier.sol:Verifier
forge verify-contract --constructor-args "0x0000000000000000000000005FF137D4b0FDCD49DcA30c7CF57E578a026d2789${B_padded}" --chain-id $CHAIN_ID $ACCOUNT_FACTORY_ADDRESS --libraries src/utils/StringUtils.sol:StringUtils:$STRING_UTILS_ADDRESS src/email-account/EmailAccountFactory.sol:EmailAccountFactory
