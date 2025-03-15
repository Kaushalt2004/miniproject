// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyCoin is ERC20, Ownable {
    uint256 constant INITIAL_SUPPLY = 1000000 * 10**18; // 1M tokens with 18 decimals

  constructor() ERC20("MyCoin", "MYC") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // Mint new tokens (only owner)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Burn tokens from sender's balance
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    // Batch transfer for gas efficiency
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external {
        require(recipients.length == amounts.length, "MyCoin: mismatched arrays");
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
    }
}