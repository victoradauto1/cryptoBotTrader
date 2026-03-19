// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Interface mínima para interação com o Cofre
interface ITradingBotManager {
    function debitBot(uint256 botId, uint256 amount) external;
    function creditBot(uint256 botId) external payable;
    function bots(uint256 botId) external view returns (address owner, uint96 balance, bool active);
}

contract TradeExecutor is Ownable {
    ITradingBotManager public botManager;
    AggregatorV3Interface public priceFeed;
    
    // Taxas de Lucro e Perda (em porcentagem simples para a simulação)
    uint256 public rewardPercentage = 5; // Lucro de 5% sobre a banca apostada
    uint256 public lossPercentage = 5;   // Perda de 5% sobre a banca apostada
    
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
     * @dev Consulta a cotação mais recente do provedor de dados oracle (Chainlink ETH/USD)
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
     * @dev Simulação da execução de um trade utilizando dados de mercado.
     * Na prática, uma automação chamaria isso avaliando indicadores técnicos.
     * @param botId O ID do bot executando o trade.
     * @param tradeAmount O tamanho da posição (banca arriscada).
     * @param direction Aposta: true = LONG (espera subir), false = SHORT (espera cair).
     * @param referencePrice O preço do momento que o bot entrou no trade.
     */
    function executeSimulatedTrade(
        uint256 botId, 
        uint256 tradeAmount, 
        bool direction, 
        int256 referencePrice
    ) external onlyOwner {
        // Validação da titularidade e capacidade do bot
        (, uint96 balance, bool active) = botManager.bots(botId);
        if (!active || balance < tradeAmount || tradeAmount == 0) revert InvalidBot();

        // Extrai o preço do ativo em tempo real
        int256 currentPrice = getLatestPrice();
        if (currentPrice <= 0) revert InvalidPrice();

        // Lógica de mercado otimizada:
        // LONG (true) vence se o Preço Atual > Preço de Entrada
        // SHORT (false) vence se o Preço Atual < Preço de Entrada
        bool isWin = direction ? (currentPrice > referencePrice) : (currentPrice < referencePrice);

        // Resolução Financeira no TradingBotManager
        if (isWin) {
            uint256 profit = (tradeAmount * rewardPercentage) / 100;
            
            // O executor (nós) precisa ter ETH suficiente no contrato para pagar os lucros
            if (address(this).balance < profit) revert InsufficientExecutorBalance();
            
            // Credita o bot via payable com fundos próprios do executor (Liquidez das taxas)
            botManager.creditBot{value: profit}(botId);
            
            emit TradeExecuted(botId, currentPrice, true, profit);
        } else {
            uint256 loss = (tradeAmount * lossPercentage) / 100;
            
            // Debita a perda do controle do bot. O TradingBotManager guarda o saldo,
            // que fisicamente fica "solto" no cofre por enquanto.
            botManager.debitBot(botId, loss);
            
            emit TradeExecuted(botId, currentPrice, false, loss);
        }
    }

    /**
     * @dev Permite injeção de liquidez no executor para que ele possa pagar vencimentos.
     */
    receive() external payable {}
    
    /**
     * @dev Permite ao Owner retirar a liquidez do pool do executor se necessário.
     */
    function withdrawLiquidity(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Saldo insuficiente");
        payable(owner()).transfer(amount);
    }
}
