import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "ethers";

const CryptoBotTraderModule = buildModule("CryptoBotTraderModule", (m) => {
  // 1. Deploy ERC-20 token
  const traderToken = m.contract("TraderToken");

  // 2. Deploy bot manager vault (TradingBotManager)
  const botManager = m.contract("TradingBotManager");

  // 3. Define default subscription fee (e.g. 50 TRD) that can be overridden via parameters
  const subscriptionFee = m.getParameter("subscriptionFee", parseEther("50"));
  
  // 4. Deploy Platform with dependencies injected
  const platform = m.contract("Platform", [traderToken, botManager, subscriptionFee]);

  // 5. Transfer TradingBotManager ownership to the newly created Platform
  // This is crucial because Platform needs to be the "owner" to pause it and change its executor.
  const transferFuture = m.call(botManager, "transferOwnership", [platform]);

  // 6. Deploy TradeExecutor
  const sepoliaEthUsdFeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Chainlink Sepolia ETH/USD
  const tradeExecutor = m.contract("TradeExecutor", [botManager, sepoliaEthUsdFeed]);

  // 7. Update Platform with TradeExecutor
  m.call(platform, "updateBotManagerExecutor", [tradeExecutor], {
    id: "UpdatePlatformWithExecutor",
    after: [transferFuture]
  });

  return { traderToken, botManager, platform, tradeExecutor };
});

export default CryptoBotTraderModule;
