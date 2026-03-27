"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCryptoBot } from '@/components/providers/CryptoBotContext';
import { formatEther } from 'viem';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const { traderTokenBalance, hasActiveSubscription } = useCryptoBot();

  // Prevent hydration mismatch by checking if mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <button className="px-6 py-2.5 bg-primary/50 text-primary-foreground font-medium rounded-full flex items-center gap-2 opacity-50 cursor-not-allowed">
      <Wallet className="w-4 h-4" />
      Loading...
    </button>
  );

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col items-end mr-1">
          <span className="text-xs text-muted-foreground font-semibold">Balance</span>
          <span className="text-sm font-bold text-accent">{formatEther(traderTokenBalance)} TRD</span>
        </div>
        
        {hasActiveSubscription && (
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-primary/20 text-primary border border-primary/50">
            PRO
          </span>
        )}

        <div className="relative group">
          <div className="px-4 py-2 bg-card border border-border text-foreground font-medium rounded-full flex items-center gap-2 cursor-pointer hover:bg-muted transition-colors">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          
          {/* Hover Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
            <button 
              onClick={() => disconnect()}
              className="w-full px-4 py-3 text-left text-sm font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={() => connect({ connector: connectors[0] })}
      className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-full hover:opacity-90 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center gap-2"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
}
