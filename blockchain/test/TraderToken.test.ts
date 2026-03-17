import { expect } from "chai";
import { ethers } from "hardhat";
import { TraderToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TraderToken", function () {
  let traderToken: TraderToken;
  let owner: HardhatEthersSigner;
  let nonOwner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, nonOwner, user1] = await ethers.getSigners();
    const TraderTokenFactory = await ethers.getContractFactory("TraderToken");
    traderToken = await TraderTokenFactory.deploy();
    await traderToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await traderToken.name()).to.equal("TraderToken");
      expect(await traderToken.symbol()).to.equal("TRD");
    });

    it("Should set the right owner", async function () {
      expect(await traderToken.owner()).to.equal(owner.address);
    });

    it("Should have 0 total supply initially", async function () {
      expect(await traderToken.totalSupply()).to.equal(0n);
    });
  });

  describe("Minting", function () {
    it("Should allow the owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("100");
      await expect(traderToken.mint(user1.address, mintAmount))
        .to.emit(traderToken, "Transfer")
        .withArgs(ethers.ZeroAddress, user1.address, mintAmount);

      expect(await traderToken.balanceOf(user1.address)).to.equal(mintAmount);
      expect(await traderToken.totalSupply()).to.equal(mintAmount);
    });

    it("Should revert if a non-owner tries to mint", async function () {
      const mintAmount = ethers.parseEther("100");
      // O erro esperado para o modifier `onlyOwner` do OpenZeppelin 5.x Custom Error
      await expect(
        traderToken.connect(nonOwner).mint(user1.address, mintAmount)
      ).to.be.revertedWithCustomError(traderToken, "OwnableUnauthorizedAccount")
       .withArgs(nonOwner.address);
    });
  });
});
