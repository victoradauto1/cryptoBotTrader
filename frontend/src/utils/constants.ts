// src/utils/constants.ts
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'

// ==========================================
// 1. Contract Addresses (Sepolia Testnet)
// ==========================================
export const CONTRACT_ADDRESSES = {
  TraderToken: "0x99F6aBff7131c34E3206d20BdaE0A02cf6eBF6c5" as const,
  TradingBotManager: "0xA224670A454f0C8D8bC1189a9306BdaE7458B45F" as const,
  Platform: "0x49AE45684F0AdAC2b7F81e138bA66dA5A736613f" as const,
  TradeExecutor: "0xC2Ac246B227a80784879e19731eFD4Ff3d2eD3d3" as const,
}

// ==========================================
// 2. Static Web3 Provider (Public Client)
// ==========================================
// This client is used for static reads (e.g., fetching bot info) that DO NOT require the user to connect a wallet.
// It uses the standard public RPC for Sepolia, but you can replace it with Alchemy/Infura if you hit rate limits.
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
})
