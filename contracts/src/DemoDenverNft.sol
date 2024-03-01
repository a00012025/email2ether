// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

contract DemoDenverNft is ERC721 {
    constructor() ERC721('Email2Ether Denver', 'E2E-DENVER-NFT') {
        _mint(msg.sender, 0);
    }

    function tokenURI(uint256 /* tokenId */) public pure override returns (string memory) {
        return 'https://email2ether.com/denver-nft';
    }
}