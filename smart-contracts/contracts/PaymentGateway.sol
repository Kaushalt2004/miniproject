// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PaymentGateway is Ownable {
    IERC20 public paymentToken; // MyCoin
    address public merchantAddress; // Where payments are sent

    event PaymentProcessed(address indexed payer, uint256 amount, bytes32 orderId);
    event MerchantAddressUpdated(address newMerchant);

   constructor(address _paymentToken, address _merchantAddress) Ownable(msg.sender) {
    paymentToken = IERC20(_paymentToken);
    merchantAddress = _merchantAddress;
}

    // Process payment
    function processPayment(uint256 amount, bytes32 orderId) external {
        require(amount > 0, "PaymentGateway: amount must be greater than 0");
        require(paymentToken.transferFrom(msg.sender, merchantAddress, amount), "PaymentGateway: transfer failed");
        emit PaymentProcessed(msg.sender, amount, orderId);
    }

    // Batch process payments
    function batchProcessPayments(uint256[] calldata amounts, bytes32[] calldata orderIds) external {
        require(amounts.length == orderIds.length, "PaymentGateway: mismatched arrays");
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            require(amounts[i] > 0, "PaymentGateway: amount must be greater than 0");
            totalAmount += amounts[i];
            emit PaymentProcessed(msg.sender, amounts[i], orderIds[i]);
        }
        require(paymentToken.transferFrom(msg.sender, merchantAddress, totalAmount), "PaymentGateway: batch transfer failed");
    }

    // Update merchant address
    function setMerchantAddress(address _merchantAddress) external onlyOwner {
        require(_merchantAddress != address(0), "PaymentGateway: invalid address");
        merchantAddress = _merchantAddress;
        emit MerchantAddressUpdated(_merchantAddress);
    }

    // Emergency withdrawal (only owner)
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        paymentToken.transfer(owner(), amount);
    }
}