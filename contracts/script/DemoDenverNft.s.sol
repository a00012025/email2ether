// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/DemoDenverNft.sol";

contract Deployer is Script {
    function run() external {
        vm.startBroadcast();
        
        DemoDenverNft nft = new DemoDenverNft(0xd24eF9076De2b69A51F54042831403651D3ac980);
        console.log("NFT address: ", address(nft));

        vm.stopBroadcast();
    }
}
