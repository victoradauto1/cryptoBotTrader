// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TradingBotManager {

    struct Bot {
        address owner;
        uint96 balance;
        bool active;
    }

    uint256 public botCount;

    mapping(uint256 => Bot) public bots;

    mapping(address => uint256[]) private userBots;

    bool public paused;

    address public owner;

    address public tradeExecutor;

    uint256 public totalFunds;

    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private status = NOT_ENTERED;

    event BotCreated(uint256 indexed botId, address indexed owner);
    event BotDeactivated(uint256 indexed botId);

    event Deposited(
        uint256 indexed botId,
        address indexed owner,
        uint256 amount,
        uint256 newBalance
    );

    event Withdrawn(
        uint256 indexed botId,
        address indexed receiver,
        uint256 amount
    );

    event EmergencyWithdraw(
        uint256 indexed botId,
        address indexed owner,
        uint256 amount
    );

    event BotDebited(uint256 indexed botId, uint256 amount);
    event BotCredited(uint256 indexed botId, uint256 amount);

    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);
    event TradeExecutorUpdated(address indexed executor);

    event Paused();
    event Unpaused();

    error BotDoesNotExist();
    error Unauthorized();
    error OwnerOnly();
    error InvalidAmount();
    error BotInactive();
    error BotAlreadyInactive();
    error TransferFailed();
    error Reentrancy();
    error ContractPaused();
    error ExecutorNotSet();
    error BalanceOverflow();
    error Insolvent();

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert OwnerOnly();
        _;
    }

    modifier onlyExecutor() {
        if (tradeExecutor == address(0)) revert ExecutorNotSet();
        if (msg.sender != tradeExecutor) revert Unauthorized();
        _;
    }

    modifier botExists(uint256 botId) {
        if (botId >= botCount) revert BotDoesNotExist();
        _;
    }

    modifier onlyBotOwner(uint256 botId) {
        if (bots[botId].owner != msg.sender) revert Unauthorized();
        _;
    }

    modifier botActive(uint256 botId) {
        if (!bots[botId].active) revert BotInactive();
        _;
    }

    modifier nonReentrant() {
        if (status == ENTERED) revert Reentrancy();
        status = ENTERED;
        _;
        status = NOT_ENTERED;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert Unauthorized();

        address oldOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function setTradeExecutor(address executor) external onlyOwner {
        if (executor == address(0)) revert Unauthorized();

        tradeExecutor = executor;

        emit TradeExecutorUpdated(executor);
    }

    function createBot()
        external
        whenNotPaused
        returns (uint256 botId)
    {
        botId = botCount;

        bots[botId] = Bot({
            owner: msg.sender,
            balance: 0,
            active: true
        });

        userBots[msg.sender].push(botId);

        emit BotCreated(botId, msg.sender);

        unchecked {
            botCount++;
        }
    }

    function deactivateBot(uint256 botId)
        external
        whenNotPaused
        botExists(botId)
        onlyBotOwner(botId)
    {
        Bot storage bot = bots[botId];

        if (!bot.active) revert BotAlreadyInactive();
        if (bot.balance != 0) revert InvalidAmount();

        bot.active = false;

        emit BotDeactivated(botId);
    }

    function deposit(uint256 botId)
        external
        payable
        whenNotPaused
        botExists(botId)
        onlyBotOwner(botId)
        botActive(botId)
    {
        uint256 amount = msg.value;

        if (amount == 0) revert InvalidAmount();

        Bot storage bot = bots[botId];

        uint256 newBalance = bot.balance + amount;

        if (newBalance > type(uint96).max) revert BalanceOverflow();

        bot.balance = uint96(newBalance);

        totalFunds += amount;

        emit Deposited(botId, msg.sender, amount, newBalance);
    }

    function withdraw(uint256 botId)
        external
        botExists(botId)
        onlyBotOwner(botId)
        nonReentrant
    {
        Bot storage bot = bots[botId];

        uint256 amount = bot.balance;

        if (amount == 0) revert InvalidAmount();

        bot.balance = 0;

        totalFunds -= amount;

        (bool success,) = payable(msg.sender).call{value: amount}("");

        if (!success) revert TransferFailed();

        emit Withdrawn(botId, msg.sender, amount);
    }

    function withdrawTo(uint256 botId, address to)
        external
        botExists(botId)
        onlyBotOwner(botId)
        nonReentrant
    {
        if (to == address(0)) revert Unauthorized();

        Bot storage bot = bots[botId];

        uint256 amount = bot.balance;

        if (amount == 0) revert InvalidAmount();

        bot.balance = 0;

        totalFunds -= amount;

        (bool success,) = payable(to).call{value: amount}("");

        if (!success) revert TransferFailed();

        emit Withdrawn(botId, to, amount);
    }

    function emergencyWithdraw(uint256 botId)
        external
        botExists(botId)
        onlyBotOwner(botId)
        nonReentrant
    {
        Bot storage bot = bots[botId];

        uint256 amount = bot.balance;

        if (amount == 0) revert InvalidAmount();

        bot.balance = 0;
        bot.active = false;

        totalFunds -= amount;

        (bool success,) = payable(msg.sender).call{value: amount}("");

        if (!success) revert TransferFailed();

        emit EmergencyWithdraw(botId, msg.sender, amount);
    }

    function debitBot(uint256 botId, uint256 amount)
        external
        onlyExecutor
        botExists(botId)
    {
        Bot storage bot = bots[botId];

        if (!bot.active) revert BotInactive();
        if (bot.balance < amount) revert InvalidAmount();

        bot.balance -= uint96(amount);

        totalFunds -= amount;

        emit BotDebited(botId, amount);
    }

    function creditBot(uint256 botId)
        external
        payable
        onlyExecutor
        botExists(botId)
    {
        uint256 amount = msg.value;

        if (amount == 0) revert InvalidAmount();

        Bot storage bot = bots[botId];

        uint256 newBalance = bot.balance + amount;

        if (newBalance > type(uint96).max) revert BalanceOverflow();

        bot.balance = uint96(newBalance);

        totalFunds += amount;

        emit BotCredited(botId, amount);
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused();
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused();
    }

    function getUserBots(address user)
        external
        view
        returns (uint256[] memory)
    {
        return userBots[user];
    }

    function isSolvent() external view returns (bool) {
        return address(this).balance >= totalFunds;
    }

    receive() external payable {
        revert();
    }
}