// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITradingBotManager {
    function createBot() external returns (uint256);
    function deposit(uint256 botId) external payable;
    function withdraw(uint256 botId) external;
}

/// @dev Helper contract used exclusively in tests to verify reentrancy protection.
/// The receive() swallows the inner revert so the outer withdraw still completes,
/// but the balance check in the test confirms only one withdrawal went through.
contract ReentrancyAttackerBotManager {
    ITradingBotManager public immutable target;
    uint256 public botId;
    bool public attacking;

    constructor(address _target) {
        target = ITradingBotManager(_target);
    }

    function createBot() external payable {
        botId = target.createBot();
        target.deposit{value: msg.value}(botId);
    }

    function attack() external {
        attacking = true;
        target.withdraw(botId);
        attacking = false;
    }

    receive() external payable {
        if (attacking) {
            // Attempt reentrant withdrawal — the nonReentrant guard will revert this.
            // We swallow the revert so the outer call can complete normally,
            // proving only one withdrawal went through.
            try target.withdraw(botId) {} catch {}
        }
    }
}
