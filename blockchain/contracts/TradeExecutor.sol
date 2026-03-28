// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Minimal interface for interaction with the Vault
interface ITradingBotManager {
    function debitBot(uint256 botId, uint256 amount) external;
    function creditBot(uint256 botId) external payable;
    function bots(uint256 botId) external view returns (address owner, uint96 balance, bool active);
}

contract TradeExecutor is Ownable {
    ITradingBotManager public botManager;
    AggregatorV3Interface public priceFeed;
    
    uint256 public rewardPercentage = 5;
    uint256 public lossPercentage = 5;
    
    event TradeExecuted(uint256 indexed botId, int256 currentPrice, bool isWin, uint256 impactAmount);
    event AddressesUpdated(address botManager, address priceFeed);

    error InvalidBot();
    error ZeroAddress();
    error InvalidPrice();
    error InsufficientExecutorBalance();

    constructor(
        address _botManager,
        address _priceFeed
    ) Ownable(msg.sender) {
        if (_botManager == address(0) || _priceFeed == address(0)) revert ZeroAddress();
        botManager = ITradingBotManager(_botManager);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function setAddresses(address _botManager, address _priceFeed) external onlyOwner {
        if (_botManager == address(0) || _priceFeed == address(0)) revert ZeroAddress();
        botManager = ITradingBotManager(_botManager);
        priceFeed = AggregatorV3Interface(_priceFeed);
        emit AddressesUpdated(_botManager, _priceFeed);
    }

    /**
     * @dev Fetches the latest price from the oracle data provider (Chainlink ETH/USD)
     */
    function getLatestPrice() public view returns (int256) {
        (
            /* uint80 roundID */,
            int256 price,
            /* uint startedAt */,
            /* uint timeStamp */,
            /* uint80 answeredInRound */
        ) = priceFeed.latestRoundData();
        return price;
    }

    /**
     * @dev Simulates a trade execution using market data.
     * @param botId The ID of the bot executing the trade.
     * @param tradeAmount Position size (risked balance).
     * @param direction Trade direction: true = LONG, false = SHORT.
     * @param referencePrice The market price when the bot entered the trade.
     */
    function executeSimulatedTrade(
        uint256 botId, 
        uint256 tradeAmount, 
        bool direction, 
        int256 referencePrice
    ) external onlyOwner {
        (, uint96 balance, bool active) = botManager.bots(botId);
        if (!active || balance < tradeAmount || tradeAmount == 0) revert InvalidBot();

        int256 currentPrice = getLatestPrice();
        if (currentPrice <= 0) revert InvalidPrice();

        // Market logic: LONG (true) wins if Current Price > Entry Price, SHORT (false) wins otherwise
        bool isWin = direction ? (currentPrice > referencePrice) : (currentPrice < referencePrice);

        if (isWin) {
            uint256 profit = (tradeAmount * rewardPercentage) / 100;
            
            // The executor must have enough ETH to pay profits
            if (address(this).balance < profit) revert InsufficientExecutorBalance();
            
            botManager.creditBot{value: profit}(botId);
            
            emit TradeExecuted(botId, currentPrice, true, profit);
        } else {
            uint256 loss = (tradeAmount * lossPercentage) / 100;
            
            botManager.debitBot(botId, loss);
            
            emit TradeExecuted(botId, currentPrice, false, loss);
        }
    }

    /**
     * @dev Allows liquidity injection into the executor to pay for winnings.
     */
    receive() external payable {}
    
    /**
     * @dev Allows the Owner to withdraw liquidity from the executor pool if necessary.
     */
    function withdrawLiquidity(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
}
