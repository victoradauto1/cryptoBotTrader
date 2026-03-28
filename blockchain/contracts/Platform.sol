// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface ITradingBotManager {
    function setTradeExecutor(address executor) external;
    function pause() external;
    function unpause() external;
}

contract Platform is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public traderToken;
    ITradingBotManager public botManager;
    
    uint256 public subscriptionFee;
    
    mapping(address => bool) public hasActiveSubscription;

    event SubscriptionPaid(address indexed user, uint256 amount);
    event FeeUpdated(uint256 newFee);
    event AddressesUpdated(address token, address manager);

    error ZeroAddress();

    constructor(
        address _traderToken, 
        address _botManager,
        uint256 _subscriptionFee
    ) Ownable(msg.sender) {
        if (_traderToken == address(0) || _botManager == address(0)) revert ZeroAddress();
        traderToken = IERC20(_traderToken);
        botManager = ITradingBotManager(_botManager);
        subscriptionFee = _subscriptionFee;
    }

    function setAddresses(address _traderToken, address _botManager) external onlyOwner {
        if (_traderToken == address(0) || _botManager == address(0)) revert ZeroAddress();
        traderToken = IERC20(_traderToken);
        botManager = ITradingBotManager(_botManager);
        emit AddressesUpdated(_traderToken, _botManager);
    }

    function setSubscriptionFee(uint256 _fee) external onlyOwner {
        subscriptionFee = _fee;
        emit FeeUpdated(_fee);
    }

    function paySubscription() external {
        if (subscriptionFee > 0) {
            traderToken.safeTransferFrom(msg.sender, address(this), subscriptionFee);
        }
        
        hasActiveSubscription[msg.sender] = true;
        
        emit SubscriptionPaid(msg.sender, subscriptionFee);
    }

    // --- Bot Manager Orchestration Controls ---

    function updateBotManagerExecutor(address _newExecutor) external onlyOwner {
        botManager.setTradeExecutor(_newExecutor);
    }

    function pauseBotManager() external onlyOwner {
        botManager.pause();
    }

    function unpauseBotManager() external onlyOwner {
        botManager.unpause();
    }
    
    // --- Collected Fees Withdrawal ---

    function withdrawFees() external onlyOwner {
        uint256 balance = traderToken.balanceOf(address(this));
        if (balance > 0) {
            traderToken.safeTransfer(owner(), balance);
        }
    }
}
