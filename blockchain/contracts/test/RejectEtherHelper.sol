// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITradingBotManagerFull {
    function createBot(string calldata cid) external returns (uint256);

    function deposit(uint256 botId) external payable;

    function withdraw(uint256 botId) external;

    function withdrawTo(uint256 botId, address to) external;

    function emergencyWithdraw(uint256 botId) external;
}

/// @dev Helper contract that always rejects incoming ETH.
/// Used in tests to trigger the TransferFailed revert path
/// in withdraw, withdrawTo, and emergencyWithdraw.
contract RejectEtherHelper {
    ITradingBotManagerFull public immutable target;
    uint256 public botId;

    constructor(address _target) {
        target = ITradingBotManagerFull(_target);
    }

    function createAndFund() external payable {
        botId = target.createBot("test_cid");
        target.deposit{value: msg.value}(botId);
    }

    function doWithdraw() external {
        target.withdraw(botId);
    }

    function doEmergencyWithdraw() external {
        target.emergencyWithdraw(botId);
    }

    // No receive() or fallback() — any ETH transfer to this contract will revert
}
