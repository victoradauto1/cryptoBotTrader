import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TradeExecutorModule = buildModule("TradeExecutorModule", (m) => {
  const botManagerAddress = "0xA653B0B6Ee70D11f6586Cd48076146B1c607842d"; // Deployed TradingBotManager
  const sepoliaEthUsdFeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Chainlink Sepolia ETH/USD

  const tradeExecutor = m.contract("TradeExecutor", [botManagerAddress, sepoliaEthUsdFeed]);

  return { tradeExecutor };
});

export default TradeExecutorModule;
