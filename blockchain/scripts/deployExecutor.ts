import { ethers } from "hardhat";

async function main() {
  const botManagerAddress = "0xA653B0B6Ee70D11f6586Cd48076146B1c607842d"; // Deployed TradingBotManager
  const sepoliaEthUsdFeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Chainlink Sepolia ETH/USD

  console.log("Deploying TradeExecutor...");
  const TradeExecutor = await ethers.getContractFactory("TradeExecutor");
  const executor = await TradeExecutor.deploy(botManagerAddress, sepoliaEthUsdFeed);

  await executor.waitForDeployment();
  const address = await executor.getAddress();
  
  console.log("TradeExecutor deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
