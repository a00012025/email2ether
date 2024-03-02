// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/email-account/GeneralPaymaster.sol";

contract Deployer is Script {
    address public entryPoint = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;

    function run() external {
        vm.startBroadcast();
        GeneralPaymaster paymaster = new GeneralPaymaster(
            IEntryPoint(entryPoint)
        );
        console.log("paymaster address: ", address(paymaster));
        vm.stopBroadcast();
    }
}
