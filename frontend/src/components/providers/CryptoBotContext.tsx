'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useConnection, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/utils/constants';

import traderTokenAbi from '@/abi/TraderToken.json';
import platformAbi from '@/abi/Platform.json';

interface CryptoBotState {
  userAddress?: `0x${string}`;
  isConnected: boolean;
  traderTokenBalance: bigint;
  hasActiveSubscription: boolean;
}

const CryptoBotContext = createContext<CryptoBotState>({
  isConnected: false,
  traderTokenBalance: BigInt(0),
  hasActiveSubscription: false,
});

export function CryptoBotProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useConnection();

  // Lê o saldo atual de TRD Token da carteira logada
  const { data: balanceData } = useReadContract({
    address: CONTRACT_ADDRESSES.TraderToken,
    abi: traderTokenAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
        enabled: !!address,
    }
  });

  // Consulta se a carteira tem uma assinatura ativa na plataforma
  const { data: subData } = useReadContract({
    address: CONTRACT_ADDRESSES.Platform,
    abi: platformAbi,
    functionName: 'hasActiveSubscription',
    args: address ? [address] : undefined,
    query: {
        enabled: !!address,
    }
  });

  return (
    <CryptoBotContext.Provider value={{
      userAddress: address,
      isConnected,
      traderTokenBalance: (balanceData as bigint) || BigInt(0),
      hasActiveSubscription: (subData as boolean) || false,
    }}>
      {children}
    </CryptoBotContext.Provider>
  );
}

// Hook Global super simples para instanciar as leituras onde você quiser no front
export function useCryptoBot() {
  return useContext(CryptoBotContext);
}
