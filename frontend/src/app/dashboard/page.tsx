"use client";

import { Activity, Play, Pause, Settings, ExternalLink, Home } from "lucide-react";
import Link from "next/link";

const mockBots = [
  { id: 1, name: "ETH Alpha Scalper", strategy: "Mean Reversion", apy: "+45.2%", status: "Active", cid: "Qm...abc" },
  { id: 2, name: "WBTC Trend Follower", strategy: "Trend Following", apy: "+12.8%", status: "Paused", cid: "Qm...def" },
  { id: 3, name: "Stablecoin Arbitrage", strategy: "Arbitrage", apy: "+8.4%", status: "Active", cid: "Qm...ghi" },
];

export default function Dashboard() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-700">
      <nav className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-4">
        <Home className="w-4 h-4" />
        <Link href="/" className="font-medium">Back to Home</Link>
      </nav>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold flex items-center gap-3">
            <Activity className="w-10 h-10 text-primary" /> My Trading Bots
          </h1>
          <p className="text-muted-foreground text-lg mt-2">Manage your active strategies and track on-chain performance.</p>
        </div>
        <Link href="/create" className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
          + New Bot
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pb-20">
        {mockBots.map(bot => (
          <div key={bot.id} className="glass-panel p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{bot.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{bot.strategy}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${bot.status === 'Active' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-muted text-muted-foreground border-border'}`}>
                {bot.status}
              </div>
            </div>
            
            <div className="py-4 border-y border-border/50 flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Est. APY</span>
              <span className="text-3xl font-bold text-green-400">{bot.apy}</span>
            </div>

            <div className="flex justify-between items-center mt-2">
               <a href={`https://ipfs.io/ipfs/${bot.cid}`} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                 IPFS Config <ExternalLink className="w-3 h-3" />
               </a>
               <div className="flex gap-2">
                 <button className="p-2 bg-card border border-border rounded-lg hover:bg-white/5 transition-all">
                   <Settings className="w-4 h-4" />
                 </button>
                 <button className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all shadow-[0_0_10px_rgba(79,70,229,0.3)]">
                   {bot.status === 'Active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
