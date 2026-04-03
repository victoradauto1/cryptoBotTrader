// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITradingBotManagerWithdrawTo {
    function createBot(string calldata cid) external returns (uint256);

    function deposit(uint256 botId) external payable;

    function withdraw(uint256 botId) external;

    function withdrawTo(uint256 botId, address to) external;
}

/// @dev Attacker contract that attempts reentrancy via withdrawTo.
/// On receiving ETH from withdraw, it tries to call withdrawTo reentrantly.
contract ReentrancyAttackerWithdrawTo {
    ITradingBotManagerWithdrawTo public immutable target;
    uint256 public botId;
    bool public attacking;

    constructor(address _target) {
        target = ITradingBotManagerWithdrawTo(_target);
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
            try target.withdrawTo(botId, address(this)) {} catch {}
        }
    }
}
