"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  
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
        <div className="px-4 py-2 bg-card border border-border text-foreground font-medium rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <button 
          onClick={() => disconnect()}
          className="p-2.5 bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-all rounded-full flex items-center justify-center"
          title="Disconnect Wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
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
