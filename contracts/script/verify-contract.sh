#!/bin/bash

# Change contract address and chain id before using it

STRING_UTILS_ADDRESS="0xa0a9fA16177597945067B00a56dFf1D1565afA16"
VERIFIER_ADDRESS="0x8dD3302292800a21dabdEe618c92b5dd948C178e"
ACCOUNT_FACTORY_ADDRESS="0xaEB3816628ecE25adCD2b0762753065c1277a95D"
CHAIN_ID="421614"

B_stripped=${VERIFIER_ADDRESS:2} # Remove '0x'
B_padded=$(printf '%064s' "$B_stripped" | tr ' ' '0')

forge verify-contract --chain-id $CHAIN_ID $STRING_UTILS_ADDRESS src/utils/StringUtils.sol:StringUtils
forge verify-contract --chain-id $CHAIN_ID $VERIFIER_ADDRESS src/email-account/Verifier.sol:Verifier
forge verify-contract --constructor-args "0x0000000000000000000000005FF137D4b0FDCD49DcA30c7CF57E578a026d2789${B_padded}" --chain-id $CHAIN_ID $ACCOUNT_FACTORY_ADDRESS --libraries src/utils/StringUtils.sol:StringUtils:$STRING_UTILS_ADDRESS src/email-account/EmailAccountFactory.sol:EmailAccountFactory
