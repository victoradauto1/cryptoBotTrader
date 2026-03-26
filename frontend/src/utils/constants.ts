// src/utils/constants.ts
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'

// ==========================================
// 1. Contract Addresses (Sepolia Testnet)
// ==========================================
export const CONTRACT_ADDRESSES = {
  TraderToken: "0xF4810c04136F1920C1603B4543ceaeB8178b59A6" as const,
  TradingBotManager: "0xA653B0B6Ee70D11f6586Cd48076146B1c607842d" as const,
  Platform: "0xD478367Aa81A3ddfF1973738cc90f12F56e7294c" as const,
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
