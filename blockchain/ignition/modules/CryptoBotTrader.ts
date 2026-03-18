import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "ethers";

const CryptoBotTraderModule = buildModule("CryptoBotTraderModule", (m) => {
  // 1. Deploy do token ERC-20
  const traderToken = m.contract("TraderToken");

  // 2. Deploy do cofre de bots (TradingBotManager)
  const botManager = m.contract("TradingBotManager");

  // 3. Define a taxa de assinatura padrão (ex: 50 TRD) que pode ser injetada via parâmetros
  const subscriptionFee = m.getParameter("subscriptionFee", parseEther("50"));
  
  // 4. Deploy da Plataforma injetando as dependências
  const platform = m.contract("Platform", [traderToken, botManager, subscriptionFee]);

  // 5. Transferência da propriedade do TradingBotManager para a Plataforma recém-criada
  // Isso é crucial pois o Platform precisa ser o "owner" do botManager para poder pausá-lo e alterar o executor.
  m.call(botManager, "transferOwnership", [platform]);

  return { traderToken, botManager, platform };
});

export default CryptoBotTraderModule;
