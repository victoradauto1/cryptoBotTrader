import { expect } from "chai";
import { ethers } from "hardhat";
import { Platform, TraderToken, TradingBotManager } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Platform", function () {
  let platform: Platform;
  let traderToken: TraderToken;
  let botManager: TradingBotManager;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let newExecutor: HardhatEthersSigner;

  const subscriptionFee = ethers.parseEther("50");

  beforeEach(async function () {
    [owner, user, newExecutor] = await ethers.getSigners();

    // Deploy TraderToken
    const TraderTokenFactory = await ethers.getContractFactory("TraderToken");
    traderToken = await TraderTokenFactory.deploy();
    await traderToken.waitForDeployment();

    // Deploy TradingBotManager
    const BotManagerFactory = await ethers.getContractFactory("TradingBotManager");
    botManager = await BotManagerFactory.deploy();
    await botManager.waitForDeployment();

    // O Platform precisa ser dono do botManager para chamar funções de Owner
    // Depois do deploy do botManager, vamos transferir a propriedade para o Platform.
    // Primeiro vamos fazer deploy da Platform
    const PlatformFactory = await ethers.getContractFactory("Platform");
    platform = await PlatformFactory.deploy(
      await traderToken.getAddress(),
      await botManager.getAddress(),
      subscriptionFee
    );
    await platform.waitForDeployment();

    // Transfere o ownership do botManager para o Platform
    await botManager.transferOwnership(await platform.getAddress());

    // Mint some tokens to the user for testing
    await traderToken.mint(user.address, ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should deploy with correct parameters", async function () {
      expect(await platform.traderToken()).to.equal(await traderToken.getAddress());
      expect(await platform.botManager()).to.equal(await botManager.getAddress());
      expect(await platform.subscriptionFee()).to.equal(subscriptionFee);
    });

    it("Should revert on deployment with zero address for TraderToken", async function () {
      const PlatformFactory = await ethers.getContractFactory("Platform");
      await expect(
        PlatformFactory.deploy(ethers.ZeroAddress, await botManager.getAddress(), subscriptionFee)
      ).to.be.revertedWithCustomError(PlatformFactory, "ZeroAddress");
    });

    it("Should revert on deployment with zero address for BotManager", async function () {
      const PlatformFactory = await ethers.getContractFactory("Platform");
      await expect(
        PlatformFactory.deploy(await traderToken.getAddress(), ethers.ZeroAddress, subscriptionFee)
      ).to.be.revertedWithCustomError(PlatformFactory, "ZeroAddress");
    });
  });

  describe("Setters", function () {
    it("Should allow owner to update addresses", async function () {
      const newAddress = user.address;
      await expect(platform.setAddresses(newAddress, newAddress))
        .to.emit(platform, "AddressesUpdated")
        .withArgs(newAddress, newAddress);

      expect(await platform.traderToken()).to.equal(newAddress);
      expect(await platform.botManager()).to.equal(newAddress);
    });

    it("Should revert addresses update with zero address", async function () {
      await expect(
        platform.setAddresses(ethers.ZeroAddress, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(platform, "ZeroAddress");

      await expect(
        platform.setAddresses(await traderToken.getAddress(), ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(platform, "ZeroAddress");
    });

    it("Should not allow non-owner to update addresses", async function () {
      await expect(
        platform.connect(user).setAddresses(user.address, user.address)
      ).to.be.revertedWithCustomError(platform, "OwnableUnauthorizedAccount")
        .withArgs(user.address);
    });

    it("Should allow owner to update subscription fee", async function () {
      const newFee = ethers.parseEther("100");
      await expect(platform.setSubscriptionFee(newFee))
        .to.emit(platform, "FeeUpdated")
        .withArgs(newFee);

      expect(await platform.subscriptionFee()).to.equal(newFee);
    });

    it("Should not allow non-owner to update subscription fee", async function () {
      await expect(
        platform.connect(user).setSubscriptionFee(100)
      ).to.be.revertedWithCustomError(platform, "OwnableUnauthorizedAccount")
        .withArgs(user.address);
    });
  });

  describe("Pay Subscription", function () {
    it("Should allow user to pay subscription", async function () {
      // Approve platform to spend user's tokens
      await traderToken.connect(user).approve(await platform.getAddress(), subscriptionFee);

      await expect(platform.connect(user).paySubscription())
        .to.emit(platform, "SubscriptionPaid")
        .withArgs(user.address, subscriptionFee);

      expect(await platform.hasActiveSubscription(user.address)).to.equal(true);
      expect(await traderToken.balanceOf(await platform.getAddress())).to.equal(subscriptionFee);
    });

    it("Should revert if user has not approved enough tokens", async function () {
      // Failed transfer from causes an ERC20InsufficientAllowance in OZ 5.x
      await expect(
        platform.connect(user).paySubscription()
      ).to.be.revertedWithCustomError(traderToken, "ERC20InsufficientAllowance");
    });

    it("Should not transfer tokens if subscription fee is 0", async function () {
      await platform.setSubscriptionFee(0);
      
      // Should succeed without any approval because fee is 0
      await expect(platform.connect(user).paySubscription())
        .to.emit(platform, "SubscriptionPaid")
        .withArgs(user.address, 0);
        
      expect(await platform.hasActiveSubscription(user.address)).to.equal(true);
      expect(await traderToken.balanceOf(await platform.getAddress())).to.equal(0);
    });
  });

  describe("Orchestration (Bot Manager Commands)", function () {
    it("Should allow owner to update bot manager executor", async function () {
      await platform.updateBotManagerExecutor(newExecutor.address);
      expect(await botManager.tradeExecutor()).to.equal(newExecutor.address);
    });

    it("Should not allow non-owner to update bot manager executor", async function () {
      await expect(
        platform.connect(user).updateBotManagerExecutor(newExecutor.address)
      ).to.be.revertedWithCustomError(platform, "OwnableUnauthorizedAccount")
        .withArgs(user.address);
    });

    it("Should allow owner to pause bot manager", async function () {
      await platform.pauseBotManager();
      expect(await botManager.paused()).to.equal(true);
    });

    it("Should not allow non-owner to pause bot manager", async function () {
      await expect(
        platform.connect(user).pauseBotManager()
      ).to.be.revertedWithCustomError(platform, "OwnableUnauthorizedAccount")
        .withArgs(user.address);
    });

    it("Should allow owner to unpause bot manager", async function () {
      await platform.pauseBotManager();
      await platform.unpauseBotManager();
      expect(await botManager.paused()).to.equal(false);
    });

    it("Should not allow non-owner to unpause bot manager", async function () {
      await expect(
        platform.connect(user).unpauseBotManager()
      ).to.be.revertedWithCustomError(platform, "OwnableUnauthorizedAccount")
        .withArgs(user.address);
    });
  });

  describe("Withdraw Fees", function () {
    it("Should allow owner to withdraw accumulated fees", async function () {
      await traderToken.connect(user).approve(await platform.getAddress(), subscriptionFee);
      await platform.connect(user).paySubscription();

      const platformBalanceBefore = await traderToken.balanceOf(await platform.getAddress());
      const ownerBalanceBefore = await traderToken.balanceOf(owner.address);

      await platform.withdrawFees();

      expect(await traderToken.balanceOf(await platform.getAddress())).to.equal(0);
      expect(await traderToken.balanceOf(owner.address)).to.equal(ownerBalanceBefore + platformBalanceBefore);
    });

    it("Should not revert if fee balance is 0", async function () {
      await expect(platform.withdrawFees()).to.not.be.reverted;
    });

    it("Should not allow non-owner to withdraw fees", async function () {
      await expect(
        platform.connect(user).withdrawFees()
      ).to.be.revertedWithCustomError(platform, "OwnableUnauthorizedAccount")
        .withArgs(user.address);
    });
  });
});
