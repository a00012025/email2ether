#!/bin/bash

forge script --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" --broadcast script/EmailAccountFactory.s.sol:Deployer
