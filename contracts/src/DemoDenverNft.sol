// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

contract DemoDenverNft is ERC721 {
    using Strings for uint256;
    string public baseURI;
    uint256 _nextTokenId;

    constructor(string memory anBaseURI) ERC721('Email2Ether Denver', 'E2E-DENVER') {
        baseURI = anBaseURI;
    }

    mapping(address => bool) public hasMinted;
    mapping(uint256 => uint256) public tokenIdToImgIdx;

    function mint(address to, uint256 imgIdx) public {
        require(!hasMinted[to], 'You have already minted');
        require(imgIdx < 6, 'Invalid imgIdx');

        hasMinted[to] = true;
        _nextTokenId++;
        tokenIdToImgIdx[_nextTokenId] = imgIdx;

        _safeMint(to, _nextTokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI; 
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        uint256 imgIdx = tokenIdToImgIdx[tokenId];

        return string.concat(baseURI, imgIdx.toString());
    }
}