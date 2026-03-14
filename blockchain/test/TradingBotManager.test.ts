const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("TradingBotManager", function () {
  // ─────────────────────────────────────────────
  // Fixture
  // ─────────────────────────────────────────────
  async function deployFixture() {
    const [owner, executor, user1, user2, attacker] = await ethers.getSigners();

    const TradingBotManager = await ethers.getContractFactory("TradingBotManager");
    const contract = await TradingBotManager.deploy();

    return { contract, owner, executor, user1, user2, attacker };
  }

  async function deployWithExecutorFixture() {
    const base = await deployFixture();
    await base.contract.connect(base.owner).setTradeExecutor(base.executor.address);
    return base;
  }

  async function deployWithBotFixture() {
    const base = await deployWithExecutorFixture();
    await base.contract.connect(base.user1).createBot();
    return base; // bot 0 belongs to user1
  }

  async function deployWithFundedBotFixture() {
    const base = await deployWithBotFixture();
    await base.contract
      .connect(base.user1)
      .deposit(0, { value: ethers.parseEther("1") });
    return base; // bot 0 has 1 ETH
  }

  // ─────────────────────────────────────────────
  // Deployment
  // ─────────────────────────────────────────────
  describe("Deployment", function () {
    it("sets the deployer as owner", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("starts unpaused", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.paused()).to.be.false;
    });

    it("starts with botCount = 0", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.botCount()).to.equal(0);
    });

    it("starts with totalFunds = 0", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.totalFunds()).to.equal(0);
    });

    it("starts with tradeExecutor as zero address", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.tradeExecutor()).to.equal(ethers.ZeroAddress);
    });
  });

  // ─────────────────────────────────────────────
  // Ownership & Administration
  // ─────────────────────────────────────────────
  describe("transferOwnership", function () {
    it("transfers ownership to a new address", async function () {
      const { contract, owner, user1 } = await loadFixture(deployFixture);
      await contract.connect(owner).transferOwnership(user1.address);
      expect(await contract.owner()).to.equal(user1.address);
    });

    it("emits OwnershipTransferred event", async function () {
      const { contract, owner, user1 } = await loadFixture(deployFixture);
      await expect(contract.connect(owner).transferOwnership(user1.address))
        .to.emit(contract, "OwnershipTransferred")
        .withArgs(owner.address, user1.address);
    });

    it("reverts if called by non-owner", async function () {
      const { contract, user1, user2 } = await loadFixture(deployFixture);
      await expect(
        contract.connect(user1).transferOwnership(user2.address)
      ).to.be.revertedWithCustomError(contract, "OwnerOnly");
    });

    it("reverts when new owner is zero address", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await expect(
        contract.connect(owner).transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });
  });

  describe("setTradeExecutor", function () {
    it("sets the trade executor", async function () {
      const { contract, owner, executor } = await loadFixture(deployFixture);
      await contract.connect(owner).setTradeExecutor(executor.address);
      expect(await contract.tradeExecutor()).to.equal(executor.address);
    });

    it("emits TradeExecutorUpdated event", async function () {
      const { contract, owner, executor } = await loadFixture(deployFixture);
      await expect(contract.connect(owner).setTradeExecutor(executor.address))
        .to.emit(contract, "TradeExecutorUpdated")
        .withArgs(executor.address);
    });

    it("reverts if called by non-owner", async function () {
      const { contract, user1, executor } = await loadFixture(deployFixture);
      await expect(
        contract.connect(user1).setTradeExecutor(executor.address)
      ).to.be.revertedWithCustomError(contract, "OwnerOnly");
    });

    it("reverts when executor is zero address", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await expect(
        contract.connect(owner).setTradeExecutor(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });
  });

  describe("pause / unpause", function () {
    it("owner can pause the contract", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await contract.connect(owner).pause();
      expect(await contract.paused()).to.be.true;
    });

    it("emits Paused event", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await expect(contract.connect(owner).pause()).to.emit(contract, "Paused");
    });

    it("owner can unpause the contract", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await contract.connect(owner).pause();
      await contract.connect(owner).unpause();
      expect(await contract.paused()).to.be.false;
    });

    it("emits Unpaused event", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await contract.connect(owner).pause();
      await expect(contract.connect(owner).unpause()).to.emit(contract, "Unpaused");
    });

    it("reverts pause if called by non-owner", async function () {
      const { contract, user1 } = await loadFixture(deployFixture);
      await expect(contract.connect(user1).pause()).to.be.revertedWithCustomError(
        contract,
        "OwnerOnly"
      );
    });

    it("reverts unpause if called by non-owner", async function () {
      const { contract, owner, user1 } = await loadFixture(deployFixture);
      await contract.connect(owner).pause();
      await expect(contract.connect(user1).unpause()).to.be.revertedWithCustomError(
        contract,
        "OwnerOnly"
      );
    });
  });

  // ─────────────────────────────────────────────
  // createBot
  // ─────────────────────────────────────────────
  describe("createBot", function () {
    it("creates a bot and increments botCount", async function () {
      const { contract, user1 } = await loadFixture(deployFixture);
      await contract.connect(user1).createBot();
      expect(await contract.botCount()).to.equal(1);
    });

    it("assigns correct owner to bot", async function () {
      const { contract, user1 } = await loadFixture(deployFixture);
      await contract.connect(user1).createBot();
      const bot = await contract.bots(0);
      expect(bot.owner).to.equal(user1.address);
    });

    it("creates bot as active with zero balance", async function () {
      const { contract, user1 } = await loadFixture(deployFixture);
      await contract.connect(user1).createBot();
      const bot = await contract.bots(0);
      expect(bot.active).to.be.true;
      expect(bot.balance).to.equal(0);
    });

    it("emits BotCreated event", async function () {
      const { contract, user1 } = await loadFixture(deployFixture);
      await expect(contract.connect(user1).createBot())
        .to.emit(contract, "BotCreated")
        .withArgs(0, user1.address);
    });

    it("tracks bot in userBots mapping", async function () {
      const { contract, user1 } = await loadFixture(deployFixture);
      await contract.connect(user1).createBot();
      const bots = await contract.getUserBots(user1.address);
      expect(bots.length).to.equal(1);
      expect(bots[0]).to.equal(0);
    });

    it("multiple bots are tracked per user", async function () {
      const { contract, user1 } = await loadFixture(deployFixture);
      await contract.connect(user1).createBot();
      await contract.connect(user1).createBot();
      const bots = await contract.getUserBots(user1.address);
      expect(bots.length).to.equal(2);
    });

    it("reverts when contract is paused", async function () {
      const { contract, owner, user1 } = await loadFixture(deployFixture);
      await contract.connect(owner).pause();
      await expect(
        contract.connect(user1).createBot()
      ).to.be.revertedWithCustomError(contract, "ContractPaused");
    });
  });

  // ─────────────────────────────────────────────
  // deactivateBot
  // ─────────────────────────────────────────────
  describe("deactivateBot", function () {
    it("deactivates a bot with zero balance", async function () {
      const { contract, user1 } = await loadFixture(deployWithBotFixture);
      await contract.connect(user1).deactivateBot(0);
      const bot = await contract.bots(0);
      expect(bot.active).to.be.false;
    });

    it("emits BotDeactivated event", async function () {
      const { contract, user1 } = await loadFixture(deployWithBotFixture);
      await expect(contract.connect(user1).deactivateBot(0))
        .to.emit(contract, "BotDeactivated")
        .withArgs(0);
    });

    it("reverts if bot does not exist", async function () {
      const { contract, user1 } = await loadFixture(deployWithBotFixture);
      await expect(
        contract.connect(user1).deactivateBot(99)
      ).to.be.revertedWithCustomError(contract, "BotDoesNotExist");
    });

    it("reverts if caller is not bot owner", async function () {
      const { contract, user2 } = await loadFixture(deployWithBotFixture);
      await expect(
        contract.connect(user2).deactivateBot(0)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("reverts if bot already inactive", async function () {
      const { contract, user1 } = await loadFixture(deployWithBotFixture);
      await contract.connect(user1).deactivateBot(0);
      await expect(
        contract.connect(user1).deactivateBot(0)
      ).to.be.revertedWithCustomError(contract, "BotAlreadyInactive");
    });

    it("reverts if bot has non-zero balance", async function () {
      const { contract, user1 } = await loadFixture(deployWithFundedBotFixture);
      await expect(
        contract.connect(user1).deactivateBot(0)
      ).to.be.revertedWithCustomError(contract, "InvalidAmount");
    });

    it("reverts when contract is paused", async function () {
      const { contract, owner, user1 } = await loadFixture(deployWithBotFixture);
      await contract.connect(owner).pause();
      await expect(
        contract.connect(user1).deactivateBot(0)
      ).to.be.revertedWithCustomError(contract, "ContractPaused");
    });
  });

  // ─────────────────────────────────────────────
  // deposit
  // ─────────────────────────────────────────────
  describe("deposit", function () {
    it("increases bot balance", async function () {
      const { contract, user1 } = await loadFixture(deployWithBotFixture);
      await contract.connect(user1).deposit(0, { value: ethers.parseEther("1") });
      const bot = await contract.bots(0);
      expect(bot.balance).to.equal(ethers.parseEther("1"));
    });

    it("increases totalFunds", async function () {
      const { contract, user1 } = await loadFixture(deployWithBotFixture);
      await contract.connect(user1).deposit(0, { value: ethers.parseEther("1") });
      expect(await contract.totalFunds()).to.equal(ethers.parseEther("1"));
    });

    it("emits Deposited event", async function () {
      const { contract, user1 } = await loadFixture(deployWithBotFixture);
      const amount = ethers.parseEther("1");
      await expect(
        contract.connect(user1).deposit(0, { value: amount })
      )
        .to.emit(contract, "Deposited")
        .withArgs(0, user1.address, amount, amount);
    });

    it("accumulates multiple deposits", async function () {
      const { contract, user1 } = await loadFixture(deployWithBotFixture);
      await contract.connect(user1).deposit(0, { value: ethers.parseEther("1") });
      await contract.connect(user1).deposit(0, { value: ethers.parseEther("0.5") });
      const bot = await contract.bots(0);
      expect(bot.balance).to.equal(ethers.parseEther("1.5"));
    });

    it("reverts with zero value", async function () {
      const { contract, user1 } = await loadFixture(deployWithBotFixture);
      await expect(
        contract.connect(user1).deposit(0, { value: 0 })
      ).to.be.revertedWithCustomError(contract, "InvalidAmount");
    });

    it("reverts if bot does not exist", async function () {
      const { contract, user1 } = await loadFixture(deployWithBotFixture);
      await expect(
        contract.connect(user1).deposit(99, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(contract, "BotDoesNotExist");
    });

    it("reverts if caller is not bot owner", async function () {
      const { contract, user2 } = await loadFixture(deployWithBotFixture);
      await expect(
        contract.connect(user2).deposit(0, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("reverts if bot is inactive", async function () {
      const { contract, user1 } = await loadFixture(deployWithBotFixture);
      await contract.connect(user1).deactivateBot(0);
      await expect(
        contract.connect(user1).deposit(0, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(contract, "BotInactive");
    });

    it("reverts when contract is paused", async function () {
      const { contract, owner, user1 } = await loadFixture(deployWithBotFixture);
      await contract.connect(owner).pause();
      await expect(
        contract.connect(user1).deposit(0, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(contract, "ContractPaused");
    });

    it("reverts on balance overflow (uint96 max)", async function () {
      const { contract, user1 } = await loadFixture(deployWithBotFixture);
      // Use a value just below uint96 max that is still reachable:
      // set balance to (uint96.max - 5 wei) via the storage override trick,
      // then deposit 10 wei to trigger overflow.
      // Since we can't fund that much ETH in tests, we manipulate storage directly.
      const maxUint96 = BigInt(2) ** BigInt(96) - BigInt(1);

      // Slot layout for bots mapping: keccak256(botId . 1) where 1 is the slot of `bots`
      // Bot struct packs: owner (20 bytes) | balance uint96 (12 bytes) | active bool (1 byte)
      // All fit in one 32-byte slot (owner 20 + balance 12 = 32 bytes, active in next slot)
      // Actually: owner=20B, balance=12B → 32B tight pack in slot 0 of the struct
      // active (bool) → slot 1 of the struct

      const botId = 0n;
      const mappingSlot = 1n; // `bots` is the 2nd state variable (slot 1)
      const structSlot = ethers.solidityPackedKeccak256(
        ["uint256", "uint256"],
        [botId, mappingSlot]
      );

      // Pack: balance (uint96, 12 bytes, offset 20) | owner (address, 20 bytes, offset 0)
      // Slot value (big-endian 32 bytes): [balance 12B][owner 20B]
      const ownerAddr = await user1.getAddress();
      const ownerHex = ownerAddr.slice(2).toLowerCase().padStart(40, "0");
      const balanceHex = (maxUint96 - 5n).toString(16).padStart(24, "0");
      const slotValue = "0x" + balanceHex + ownerHex;

      await ethers.provider.send("hardhat_setStorageAt", [
        await contract.getAddress(),
        structSlot,
        slotValue,
      ]);

      // Now depositing 10 wei pushes balance over uint96 max
      await expect(
        contract.connect(user1).deposit(0, { value: 10n })
      ).to.be.revertedWithCustomError(contract, "BalanceOverflow");
    });
  });

  // ─────────────────────────────────────────────
  // withdraw
  // ─────────────────────────────────────────────
  describe("withdraw", function () {
    it("sends full balance to owner", async function () {
      const { contract, user1 } = await loadFixture(deployWithFundedBotFixture);
      const amount = ethers.parseEther("1");
      await expect(
        contract.connect(user1).withdraw(0)
      ).to.changeEtherBalance(user1, amount);
    });

    it("sets bot balance to 0 after withdrawal", async function () {
      const { contract, user1 } = await loadFixture(deployWithFundedBotFixture);
      await contract.connect(user1).withdraw(0);
      const bot = await contract.bots(0);
      expect(bot.balance).to.equal(0);
    });

    it("decreases totalFunds", async function () {
      const { contract, user1 } = await loadFixture(deployWithFundedBotFixture);
      await contract.connect(user1).withdraw(0);
      expect(await contract.totalFunds()).to.equal(0);
    });

    it("emits Withdrawn event", async function () {
      const { contract, user1 } = await loadFixture(deployWithFundedBotFixture);
      const amount = ethers.parseEther("1");
      await expect(contract.connect(user1).withdraw(0))
        .to.emit(contract, "Withdrawn")
        .withArgs(0, user1.address, amount);
    });

    it("reverts if bot does not exist", async function () {
      const { contract, user1 } = await loadFixture(deployWithFundedBotFixture);
      await expect(
        contract.connect(user1).withdraw(99)
      ).to.be.revertedWithCustomError(contract, "BotDoesNotExist");
    });

    it("reverts if caller is not bot owner", async function () {
      const { contract, user2 } = await loadFixture(deployWithFundedBotFixture);
      await expect(
        contract.connect(user2).withdraw(0)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("reverts if bot has zero balance", async function () {
      const { contract, user1 } = await loadFixture(deployWithBotFixture);
      await expect(
        contract.connect(user1).withdraw(0)
      ).to.be.revertedWithCustomError(contract, "InvalidAmount");
    });

    it("allows withdrawal even when contract is paused", async function () {
      const { contract, owner, user1 } = await loadFixture(deployWithFundedBotFixture);
      await contract.connect(owner).pause();
      // withdraw does NOT have whenNotPaused modifier — should succeed
      await expect(contract.connect(user1).withdraw(0)).not.to.be.reverted;
    });
  });

  // ─────────────────────────────────────────────
  // withdrawTo
  // ─────────────────────────────────────────────
  describe("withdrawTo", function () {
    it("sends full balance to specified address", async function () {
      const { contract, user1, user2 } = await loadFixture(deployWithFundedBotFixture);
      const amount = ethers.parseEther("1");
      await expect(
        contract.connect(user1).withdrawTo(0, user2.address)
      ).to.changeEtherBalance(user2, amount);
    });

    it("emits Withdrawn event with correct recipient", async function () {
      const { contract, user1, user2 } = await loadFixture(deployWithFundedBotFixture);
      const amount = ethers.parseEther("1");
      await expect(contract.connect(user1).withdrawTo(0, user2.address))
        .to.emit(contract, "Withdrawn")
        .withArgs(0, user2.address, amount);
    });

    it("reverts if to is zero address", async function () {
      const { contract, user1 } = await loadFixture(deployWithFundedBotFixture);
      await expect(
        contract.connect(user1).withdrawTo(0, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("reverts if caller is not bot owner", async function () {
      const { contract, user2 } = await loadFixture(deployWithFundedBotFixture);
      await expect(
        contract.connect(user2).withdrawTo(0, user2.address)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("reverts if bot has zero balance", async function () {
      const { contract, user1, user2 } = await loadFixture(deployWithBotFixture);
      await expect(
        contract.connect(user1).withdrawTo(0, user2.address)
      ).to.be.revertedWithCustomError(contract, "InvalidAmount");
    });
  });

  // ─────────────────────────────────────────────
  // emergencyWithdraw
  // ─────────────────────────────────────────────
  describe("emergencyWithdraw", function () {
    it("withdraws funds and deactivates bot", async function () {
      const { contract, user1 } = await loadFixture(deployWithFundedBotFixture);
      await contract.connect(user1).emergencyWithdraw(0);
      const bot = await contract.bots(0);
      expect(bot.balance).to.equal(0);
      expect(bot.active).to.be.false;
    });

    it("sends full balance to owner", async function () {
      const { contract, user1 } = await loadFixture(deployWithFundedBotFixture);
      const amount = ethers.parseEther("1");
      await expect(
        contract.connect(user1).emergencyWithdraw(0)
      ).to.changeEtherBalance(user1, amount);
    });

    it("emits EmergencyWithdraw event", async function () {
      const { contract, user1 } = await loadFixture(deployWithFundedBotFixture);
      const amount = ethers.parseEther("1");
      await expect(contract.connect(user1).emergencyWithdraw(0))
        .to.emit(contract, "EmergencyWithdraw")
        .withArgs(0, user1.address, amount);
    });

    it("reverts if bot has zero balance", async function () {
      const { contract, user1 } = await loadFixture(deployWithBotFixture);
      await expect(
        contract.connect(user1).emergencyWithdraw(0)
      ).to.be.revertedWithCustomError(contract, "InvalidAmount");
    });

    it("reverts if caller is not bot owner", async function () {
      const { contract, user2 } = await loadFixture(deployWithFundedBotFixture);
      await expect(
        contract.connect(user2).emergencyWithdraw(0)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("reverts if bot does not exist", async function () {
      const { contract, user1 } = await loadFixture(deployWithFundedBotFixture);
      await expect(
        contract.connect(user1).emergencyWithdraw(99)
      ).to.be.revertedWithCustomError(contract, "BotDoesNotExist");
    });

    it("works even when contract is paused", async function () {
      const { contract, owner, user1 } = await loadFixture(deployWithFundedBotFixture);
      await contract.connect(owner).pause();
      await expect(contract.connect(user1).emergencyWithdraw(0)).not.to.be.reverted;
    });
  });

  // ─────────────────────────────────────────────
  // debitBot
  // ─────────────────────────────────────────────
  describe("debitBot", function () {
    it("reduces bot balance and totalFunds", async function () {
      const { contract, executor, user1 } = await loadFixture(deployWithFundedBotFixture);
      const debitAmount = ethers.parseEther("0.4");
      await contract.connect(executor).debitBot(0, debitAmount);
      const bot = await contract.bots(0);
      expect(bot.balance).to.equal(ethers.parseEther("0.6"));
      expect(await contract.totalFunds()).to.equal(ethers.parseEther("0.6"));
    });

    it("emits BotDebited event", async function () {
      const { contract, executor } = await loadFixture(deployWithFundedBotFixture);
      const amount = ethers.parseEther("0.5");
      await expect(contract.connect(executor).debitBot(0, amount))
        .to.emit(contract, "BotDebited")
        .withArgs(0, amount);
    });

    it("reverts if called by non-executor", async function () {
      const { contract, user1 } = await loadFixture(deployWithFundedBotFixture);
      await expect(
        contract.connect(user1).debitBot(0, ethers.parseEther("0.1"))
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("reverts if executor not set", async function () {
      const { contract, owner, user1 } = await loadFixture(deployWithBotFixture);
      // executor not set yet — deploy fresh without executor
      const TradingBotManager = await ethers.getContractFactory("TradingBotManager");
      const c2 = await TradingBotManager.deploy();
      await c2.connect(user1).createBot();
      await c2.connect(user1).deposit(0, { value: ethers.parseEther("1") });
      await expect(
        c2.connect(user1).debitBot(0, ethers.parseEther("0.1"))
      ).to.be.revertedWithCustomError(c2, "ExecutorNotSet");
    });

    it("reverts if bot is inactive", async function () {
      const { contract, executor, user1 } = await loadFixture(deployWithFundedBotFixture);
      await contract.connect(user1).withdraw(0);
      await contract.connect(user1).deactivateBot(0);
      await expect(
        contract.connect(executor).debitBot(0, 1n)
      ).to.be.revertedWithCustomError(contract, "BotInactive");
    });

    it("reverts if amount exceeds bot balance", async function () {
      const { contract, executor } = await loadFixture(deployWithFundedBotFixture);
      await expect(
        contract.connect(executor).debitBot(0, ethers.parseEther("2"))
      ).to.be.revertedWithCustomError(contract, "InvalidAmount");
    });

    it("reverts if bot does not exist", async function () {
      const { contract, executor } = await loadFixture(deployWithFundedBotFixture);
      await expect(
        contract.connect(executor).debitBot(99, 1n)
      ).to.be.revertedWithCustomError(contract, "BotDoesNotExist");
    });
  });

  // ─────────────────────────────────────────────
  // creditBot
  // ─────────────────────────────────────────────
  describe("creditBot", function () {
    it("increases bot balance and totalFunds", async function () {
      const { contract, executor } = await loadFixture(deployWithBotFixture);
      const amount = ethers.parseEther("0.5");
      await contract.connect(executor).creditBot(0, { value: amount });
      const bot = await contract.bots(0);
      expect(bot.balance).to.equal(amount);
      expect(await contract.totalFunds()).to.equal(amount);
    });

    it("emits BotCredited event", async function () {
      const { contract, executor } = await loadFixture(deployWithBotFixture);
      const amount = ethers.parseEther("0.5");
      await expect(contract.connect(executor).creditBot(0, { value: amount }))
        .to.emit(contract, "BotCredited")
        .withArgs(0, amount);
    });

    it("reverts if called by non-executor", async function () {
      const { contract, user1 } = await loadFixture(deployWithBotFixture);
      await expect(
        contract.connect(user1).creditBot(0, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("reverts with zero value", async function () {
      const { contract, executor } = await loadFixture(deployWithBotFixture);
      await expect(
        contract.connect(executor).creditBot(0, { value: 0 })
      ).to.be.revertedWithCustomError(contract, "InvalidAmount");
    });

    it("reverts if bot does not exist", async function () {
      const { contract, executor } = await loadFixture(deployWithBotFixture);
      await expect(
        contract.connect(executor).creditBot(99, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWithCustomError(contract, "BotDoesNotExist");
    });

    it("reverts on balance overflow", async function () {
      const { contract, executor, user1 } = await loadFixture(deployWithBotFixture);
      // Same storage manipulation trick: set bot balance to (uint96.max - 5)
      const maxUint96 = BigInt(2) ** BigInt(96) - BigInt(1);
      const botId = 0n;
      const mappingSlot = 1n;
      const structSlot = ethers.solidityPackedKeccak256(
        ["uint256", "uint256"],
        [botId, mappingSlot]
      );
      const ownerAddr = await user1.getAddress();
      const ownerHex = ownerAddr.slice(2).toLowerCase().padStart(40, "0");
      const balanceHex = (maxUint96 - 5n).toString(16).padStart(24, "0");
      const slotValue = "0x" + balanceHex + ownerHex;
      await ethers.provider.send("hardhat_setStorageAt", [
        await contract.getAddress(),
        structSlot,
        slotValue,
      ]);
      // Crediting 10 wei overflows uint96
      await expect(
        contract.connect(executor).creditBot(0, { value: 10n })
      ).to.be.revertedWithCustomError(contract, "BalanceOverflow");
    });
  });

  // ─────────────────────────────────────────────
  // isSolvent
  // ─────────────────────────────────────────────
  describe("isSolvent", function () {
    it("returns true when contract balance equals totalFunds", async function () {
      const { contract } = await loadFixture(deployWithFundedBotFixture);
      expect(await contract.isSolvent()).to.be.true;
    });

    it("returns true when no funds are held", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.isSolvent()).to.be.true;
    });
  });

  // ─────────────────────────────────────────────
  // getUserBots
  // ─────────────────────────────────────────────
  describe("getUserBots", function () {
    it("returns empty array for a user with no bots", async function () {
      const { contract, user1 } = await loadFixture(deployFixture);
      const bots = await contract.getUserBots(user1.address);
      expect(bots.length).to.equal(0);
    });

    it("returns correct bot IDs for a user", async function () {
      const { contract, user1 } = await loadFixture(deployFixture);
      await contract.connect(user1).createBot(); // id 0
      await contract.connect(user1).createBot(); // id 1
      const bots = await contract.getUserBots(user1.address);
      expect(bots.map(Number)).to.deep.equal([0, 1]);
    });

    it("does not mix bots from different users", async function () {
      const { contract, user1, user2 } = await loadFixture(deployFixture);
      await contract.connect(user1).createBot(); // id 0
      await contract.connect(user2).createBot(); // id 1
      const user1Bots = await contract.getUserBots(user1.address);
      const user2Bots = await contract.getUserBots(user2.address);
      expect(user1Bots.map(Number)).to.deep.equal([0]);
      expect(user2Bots.map(Number)).to.deep.equal([1]);
    });
  });

  // ─────────────────────────────────────────────
  // receive() – direct ETH transfers
  // ─────────────────────────────────────────────
  describe("receive()", function () {
    it("reverts on direct ETH transfer", async function () {
      const { contract, user1 } = await loadFixture(deployFixture);
      await expect(
        user1.sendTransaction({ to: await contract.getAddress(), value: ethers.parseEther("1") })
      ).to.be.reverted;
    });
  });

  // ─────────────────────────────────────────────
  // Reentrancy protection
  // ─────────────────────────────────────────────
  describe("Reentrancy protection", function () {
    it("prevents double-withdrawal via reentrant attack", async function () {
      const AttackerFactory = await ethers.getContractFactory("ReentrancyAttackerBotManager");
      const { contract } = await loadFixture(deployWithExecutorFixture);
      const attacker = await AttackerFactory.deploy(await contract.getAddress());

      const depositAmount = ethers.parseEther("1");

      // Attacker creates and funds a bot
      await attacker.createBot({ value: depositAmount });

      const attackerAddress = await attacker.getAddress();
      const balanceBefore = await ethers.provider.getBalance(attackerAddress);

      // attack() triggers withdraw → receive() tries reentrant withdraw → blocked by guard
      // The attacker's receive() swallows the revert, so the outer call succeeds
      // but only one withdrawal goes through
      await attacker.attack();

      const balanceAfter = await ethers.provider.getBalance(attackerAddress);

      // Attacker should have received exactly depositAmount — not double
      expect(balanceAfter - balanceBefore).to.equal(depositAmount);

      // Bot balance must now be 0 (only one withdrawal happened)
      const bot = await contract.bots(0);
      expect(bot.balance).to.equal(0);
    });
  });
});