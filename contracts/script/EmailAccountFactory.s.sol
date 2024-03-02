// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/email-account/EmailAccountFactory.sol";
import "../src/email-account/EmailAccountDeployer.sol";

contract Deployer is Script {
    IEntryPoint public entryPoint =
        IEntryPoint(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789);

    function run() external {
        vm.startBroadcast();

        bytes32 salt = "123";

        EmailAccountDeployer deployer = new EmailAccountDeployer();
        console.log("Deployer address: ", address(deployer));

        Verifier verifier = Verifier(deployer.deployVerifier(salt));
        console.log("Verifier address: ", address(verifier));

        EmailAccount accountImpl = EmailAccount(
            payable(deployer.deployEmailAccountImpl(salt, entryPoint, verifier))
        );
        console.log("Account Impl address: ", address(accountImpl));

        EmailAccountFactory factory = EmailAccountFactory(
            deployer.deployEmailAccountFactory(
                salt,
                entryPoint,
                verifier,
                accountImpl
            )
        );
        console.log("Factory address: ", address(factory));

        vm.stopBroadcast();
    }
}
