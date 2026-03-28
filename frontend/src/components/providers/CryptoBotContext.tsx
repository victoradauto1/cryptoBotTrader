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

  // Read current TRD Token balance from the connected wallet
  const { data: balanceData } = useReadContract({
    address: CONTRACT_ADDRESSES.TraderToken,
    abi: traderTokenAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
        enabled: !!address,
    }
  });

  // Check if the wallet has an active platform subscription
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

// Simple global hook to instantiate reads across the frontend
export function useCryptoBot() {
  return useContext(CryptoBotContext);
}
