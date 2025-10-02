// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ProfileBadgeNFT is ERC721 {
    uint256 private _nextId;
    constructor() ERC721("ProfileBadge", "PBADGE") {}
    function mint(address to) external returns (uint256) {
        uint256 id = ++_nextId;
        _mint(to, id);
        return id;
    }
}
