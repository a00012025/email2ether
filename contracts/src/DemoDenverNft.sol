// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DemoDenverNft is ERC721, Ownable {
    using Strings for uint256;
    string public baseURI;
    uint256 _nextTokenId;

    constructor() ERC721("Email2Ether Denver", "E2E-DENVER") Ownable() {}

    mapping(address => bool) public hasMinted;
    mapping(uint256 => uint256) public tokenIdToImgIdx;

    function mint(address to, uint256 imgIdx) public {
        require(!hasMinted[to], "You have already minted");
        require(imgIdx < 6, "Invalid imgIdx");

        hasMinted[to] = true;
        _nextTokenId++;
        tokenIdToImgIdx[_nextTokenId] = imgIdx;

        _safeMint(to, _nextTokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory anbaseURI) public onlyOwner {
        baseURI = anbaseURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        uint256 imgIdx = tokenIdToImgIdx[tokenId];

        return
            bytes(baseURI).length > 0
                ? string.concat(baseURI, imgIdx.toString())
                : "";
    }
}
