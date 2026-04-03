// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITradingBotManagerEmergency {
    function createBot(string calldata cid) external returns (uint256);

    function deposit(uint256 botId) external payable;

    function withdraw(uint256 botId) external;

    function emergencyWithdraw(uint256 botId) external;
}

/// @dev Attacker contract that attempts reentrancy via emergencyWithdraw.
/// On receiving ETH from withdraw, it tries to call emergencyWithdraw reentrantly.
contract ReentrancyAttackerEmergencyWithdraw {
    ITradingBotManagerEmergency public immutable target;
    uint256 public botId;
    bool public attacking;

    constructor(address _target) {
        target = ITradingBotManagerEmergency(_target);
    }

    function createBot() external payable {
        botId = target.createBot("test_cid");
        target.deposit{value: msg.value}(botId);
    }

    function attack() external {
        attacking = true;
        target.withdraw(botId);
        attacking = false;
    }

    receive() external payable {
        if (attacking) {
            try target.emergencyWithdraw(botId) {} catch {}
        }
    }
}
