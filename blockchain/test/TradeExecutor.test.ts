import { expect } from "chai";
import { ethers } from "hardhat";
import { TradeExecutor, TradingBotManager, MockV3Aggregator } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TradeExecutor", function () {
  let tradeExecutor: TradeExecutor;
  let botManager: TradingBotManager;
  let mockPriceFeed: MockV3Aggregator;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let otherAccount: HardhatEthersSigner;

  const INITIAL_PRICE = 3000n * 10n ** 8n; // Simula ETH a $3000 (com 8 decimais padrão da Chainlink)
  const depositAmount = ethers.parseEther("10");
  const tradeAmount = ethers.parseEther("2");

  beforeEach(async function () {
    [owner, user, otherAccount] = await ethers.getSigners();

    // Deploy TradingBotManager
    const BotManagerFactory = await ethers.getContractFactory("TradingBotManager");
    botManager = await BotManagerFactory.deploy();
    await botManager.waitForDeployment();

    // Deploy MockV3Aggregator
    const MockPriceFeedFactory = await ethers.getContractFactory("MockV3Aggregator");
    mockPriceFeed = await MockPriceFeedFactory.deploy(INITIAL_PRICE);
    await mockPriceFeed.waitForDeployment();

    // Deploy TradeExecutor
    const TradeExecutorFactory = await ethers.getContractFactory("TradeExecutor");
    tradeExecutor = await TradeExecutorFactory.deploy(
      await botManager.getAddress(),
      await mockPriceFeed.getAddress()
    );
    await tradeExecutor.waitForDeployment();

    // Set Executor on BotManager
    await botManager.setTradeExecutor(await tradeExecutor.getAddress());

    // Fazer a injeção inicial de liquidez no TradeExecutor (10 ETH) para que ele pague lucros
    await owner.sendTransaction({
      to: await tradeExecutor.getAddress(),
      value: ethers.parseEther("10"),
    });

    // Cria e deposita em um bot para o 'user'
    await botManager.connect(user).createBot(); // BotId 0
    await botManager.connect(user).deposit(0, { value: depositAmount });
  });

  describe("Deployment & Configuration", function () {
    it("Should set the right botManager and priceFeed", async function () {
      expect(await tradeExecutor.botManager()).to.equal(await botManager.getAddress());
      expect(await tradeExecutor.priceFeed()).to.equal(await mockPriceFeed.getAddress());
    });

    it("Should revert on deployment with zero address", async function () {
      const Factory = await ethers.getContractFactory("TradeExecutor");
      await expect(Factory.deploy(ethers.ZeroAddress, await mockPriceFeed.getAddress())).to.be.revertedWithCustomError(Factory, "ZeroAddress");
      await expect(Factory.deploy(await botManager.getAddress(), ethers.ZeroAddress)).to.be.revertedWithCustomError(Factory, "ZeroAddress");
    });

    it("Should allow owner to update addresses", async function () {
      await expect(tradeExecutor.setAddresses(user.address, user.address))
        .to.emit(tradeExecutor, "AddressesUpdated")
        .withArgs(user.address, user.address);
      
      expect(await tradeExecutor.botManager()).to.equal(user.address);
    });

    it("Should prevent non-owner from updating addresses", async function () {
      await expect(tradeExecutor.connect(user).setAddresses(user.address, user.address))
        .to.be.revertedWithCustomError(tradeExecutor, "OwnableUnauthorizedAccount");
    });

    it("Should revert setAddresses with zero address", async function () {
      await expect(tradeExecutor.setAddresses(ethers.ZeroAddress, ethers.ZeroAddress)).to.be.revertedWithCustomError(tradeExecutor, "ZeroAddress");
      await expect(tradeExecutor.setAddresses(user.address, ethers.ZeroAddress)).to.be.revertedWithCustomError(tradeExecutor, "ZeroAddress");
    });
  });

  describe("Oracle Reading", function () {
    it("Should fetch latest price correctly", async function () {
      const price = await tradeExecutor.getLatestPrice();
      expect(price).to.equal(INITIAL_PRICE);
    });
  });

  describe("Trade Execution", function () {
    it("Should revert if called by non-owner", async function () {
      await expect(tradeExecutor.connect(user).executeSimulatedTrade(0, tradeAmount, true, INITIAL_PRICE))
        .to.be.revertedWithCustomError(tradeExecutor, "OwnableUnauthorizedAccount");
    });

    it("Should revert if bot does not exist or has insufficient balance", async function () {
      await expect(tradeExecutor.executeSimulatedTrade(999, tradeAmount, true, INITIAL_PRICE))
        .to.be.revertedWithCustomError(tradeExecutor, "InvalidBot");

      await expect(tradeExecutor.executeSimulatedTrade(0, ethers.parseEther("100"), true, INITIAL_PRICE))
        .to.be.revertedWithCustomError(tradeExecutor, "InvalidBot");
        
      await expect(tradeExecutor.executeSimulatedTrade(0, 0, true, INITIAL_PRICE))
        .to.be.revertedWithCustomError(tradeExecutor, "InvalidBot");
        
      await botManager.connect(user).withdraw(0);
      await botManager.connect(user).deactivateBot(0);
      await expect(tradeExecutor.executeSimulatedTrade(0, tradeAmount, true, INITIAL_PRICE))
        .to.be.revertedWithCustomError(tradeExecutor, "InvalidBot");
    });

    it("Should revert if price from oracle is <= 0", async function () {
      await mockPriceFeed.updateAnswer(0);
      await expect(tradeExecutor.executeSimulatedTrade(0, tradeAmount, true, INITIAL_PRICE))
        .to.be.revertedWithCustomError(tradeExecutor, "InvalidPrice");
    });

    it("Should execute WIN for LONG (price current > reference)", async function () {
      const referencePrice = 2900n * 10n ** 8n; // Preço antigo era $2900
      // Preço atual $3000 (INITIAL_PRICE) -> ETH subiu, Long GANHA!
      
      const profit = (tradeAmount * 5n) / 100n;

      await expect(tradeExecutor.executeSimulatedTrade(0, tradeAmount, true, referencePrice))
        .to.emit(tradeExecutor, "TradeExecuted")
        .withArgs(0, INITIAL_PRICE, true, profit);

      const bot = await botManager.bots(0);
      expect(bot.balance).to.equal(depositAmount + profit);
    });

    it("Should execute WIN for SHORT (price current < reference)", async function () {
      const referencePrice = 3100n * 10n ** 8n; // Preço antigo era $3100
      // Preço atual $3000 -> ETH desceu, Short GANHA!

      const profit = (tradeAmount * 5n) / 100n;

      await expect(tradeExecutor.executeSimulatedTrade(0, tradeAmount, false, referencePrice))
        .to.emit(tradeExecutor, "TradeExecuted")
        .withArgs(0, INITIAL_PRICE, true, profit);

      const bot = await botManager.bots(0);
      expect(bot.balance).to.equal(depositAmount + profit);
    });

    it("Should execute LOSS for LONG (price current < reference)", async function () {
      const referencePrice = 3100n * 10n ** 8n; // Entrada em $3100
      // Atual $3000 -> Subiu? Não. Long PERDE.

      const loss = (tradeAmount * 5n) / 100n;

      await expect(tradeExecutor.executeSimulatedTrade(0, tradeAmount, true, referencePrice))
        .to.emit(tradeExecutor, "TradeExecuted")
        .withArgs(0, INITIAL_PRICE, false, loss);

      const bot = await botManager.bots(0);
      expect(bot.balance).to.equal(depositAmount - loss);
    });

    it("Should execute LOSS for SHORT (price current > reference)", async function () {
      const referencePrice = 2900n * 10n ** 8n; // Entrada em $2900
      // Atual $3000 -> Desceu? Não. Short PERDE.

      const loss = (tradeAmount * 5n) / 100n;

      await expect(tradeExecutor.executeSimulatedTrade(0, tradeAmount, false, referencePrice))
        .to.emit(tradeExecutor, "TradeExecuted")
        .withArgs(0, INITIAL_PRICE, false, loss);

      const bot = await botManager.bots(0);
      expect(bot.balance).to.equal(depositAmount - loss);
    });

    it("Should revert WIN if Executor does not have enough ETH liquidity", async function () {
      const emptyExecutor = await (await ethers.getContractFactory("TradeExecutor")).deploy(
        await botManager.getAddress(),
        await mockPriceFeed.getAddress()
      );
      await emptyExecutor.waitForDeployment();
      await botManager.setTradeExecutor(await emptyExecutor.getAddress());

      const referencePrice = 2900n * 10n ** 8n;
      // Irá falhar pois emptyExecutor.balance = 0
      await expect(emptyExecutor.executeSimulatedTrade(0, tradeAmount, true, referencePrice))
        .to.be.revertedWithCustomError(emptyExecutor, "InsufficientExecutorBalance");
    });
  });

  describe("Liquidity Management", function () {
    it("Should allow owner to withdraw liquidity", async function () {
      const executorBalanceBefore = await ethers.provider.getBalance(await tradeExecutor.getAddress());
      const withdrawAmount = ethers.parseEther("5");

      await expect(tradeExecutor.withdrawLiquidity(withdrawAmount))
        .to.changeEtherBalances([tradeExecutor, owner], [-withdrawAmount, withdrawAmount]);
    });

    it("Should revert withdrawLiquidity if insufficient balance", async function () {
      const excessAmount = ethers.parseEther("100");
      await expect(tradeExecutor.withdrawLiquidity(excessAmount))
        .to.be.revertedWith("Saldo insuficiente");
    });
    
    it("Should prevent non-owner from withdrawing liquidity", async function () {
      await expect(tradeExecutor.connect(user).withdrawLiquidity(ethers.parseEther("1")))
        .to.be.revertedWithCustomError(tradeExecutor, "OwnableUnauthorizedAccount");
    });
  });
});
