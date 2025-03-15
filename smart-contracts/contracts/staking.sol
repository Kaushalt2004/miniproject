// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is ReentrancyGuard, Ownable {
    IERC20 public stakingToken; // MyCoin
    IERC20 public rewardToken;  // Could be MyCoin or another token
    uint256 public rewardRate;  // Rewards per second (in wei)
    uint256 public totalStaked;
    uint256 public lastUpdateTime;

    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 accumulatedReward;
    }

    mapping(address => Stake) public stakes;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

   constructor(address _stakingToken, address _rewardToken, uint256 _rewardRate) Ownable(msg.sender) {
    stakingToken = IERC20(_stakingToken);
    rewardToken = IERC20(_rewardToken);
    rewardRate = _rewardRate;
    lastUpdateTime = block.timestamp;
}

    // Update reward calculation
    modifier updateReward(address account) {
        if (block.timestamp > lastUpdateTime) {
            uint256 timeElapsed = block.timestamp - lastUpdateTime;
            if (totalStaked > 0) {
                uint256 reward = timeElapsed * rewardRate;
                stakes[account].accumulatedReward += (stakes[account].amount * reward) / totalStaked;
            }
            lastUpdateTime = block.timestamp;
        }
        _;
    }

    // Stake tokens
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Staking: amount must be greater than 0");
        stakingToken.transferFrom(msg.sender, address(this), amount);
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].timestamp = block.timestamp;
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    // Unstake tokens
    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0 && amount <= stakes[msg.sender].amount, "Staking: invalid amount");
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        stakingToken.transfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    // Claim accumulated rewards
    function claimReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = stakes[msg.sender].accumulatedReward;
        require(reward > 0, "Staking: no rewards to claim");
        stakes[msg.sender].accumulatedReward = 0;
        rewardToken.transfer(msg.sender, reward);
        emit RewardClaimed(msg.sender, reward);
    }

    // Update reward rate (only owner)
    function setRewardRate(uint256 _rewardRate) external onlyOwner {
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
    }

    // Emergency withdrawal (only owner)
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        stakingToken.transfer(owner(), amount);
    }
}