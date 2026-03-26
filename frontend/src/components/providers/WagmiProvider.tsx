'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider as WagmiConfig, createConfig, http } from 'wagmi';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';
import { ReactNode } from 'react';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [hardhat, sepolia, mainnet],
  connectors: [
    injected(),
  ],
  transports: {
    [hardhat.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

import { CryptoBotProvider } from './CryptoBotContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <CryptoBotProvider>
          {children}
        </CryptoBotProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
