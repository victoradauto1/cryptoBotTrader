"use client";

import { useState, useEffect } from "react";
import { Activity, Play, Pause, Settings, ExternalLink, Home, Loader2 } from "lucide-react";
import Link from "next/link";
import { useConnection } from "wagmi";
import { publicClient, CONTRACT_ADDRESSES } from "@/utils/constants";
import TradingBotManagerABI from "@/abi/TradingBotManager.json";

interface BotData {
  id: number;
  name: string;
  strategy: string;
  apy: string;
  status: string;
  cid: string;
  balance: string;
}

export default function Dashboard() {
  const { address } = useConnection();
  const [userBots, setUserBots] = useState<BotData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBots() {
      if (!address) {
        setUserBots([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const botIds = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.TradingBotManager,
          abi: TradingBotManagerABI,
          functionName: "getUserBots",
          args: [address],
        }) as bigint[];

        const botsData = [];
        for (const id of botIds) {
          const botInfo: any = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.TradingBotManager,
            abi: TradingBotManagerABI,
            functionName: "bots",
            args: [id],
          });
          
          const [owner, configCid, balance, active] = botInfo;
          
          let metadata = { name: `Bot #${id.toString()}`, strategy: "UnknownStrategy" };
          if (configCid) {
            try {
              const res = await fetch(`https://gateway.pinata.cloud/ipfs/${configCid}`);
              if (res.ok) {
                metadata = await res.json();
              }
            } catch (e) {
              console.error("Failed to fetch IPFS:", e);
            }
          }

          botsData.push({
            id: Number(id),
            name: metadata.name || `Bot #${id.toString()}`,
            strategy: metadata.strategy || "Unknown",
            apy: "N/A", 
            status: active ? "Active" : "Paused",
            cid: configCid,
            balance: balance.toString()
          });
        }
        setUserBots(botsData);
      } catch (e) {
        console.error("Failed to load user bots:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadBots();
  }, [address]);

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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <span className="text-muted-foreground font-semibold animate-pulse">Fetching your bots from the blockchain...</span>
        </div>
      ) : userBots.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 glass-panel border border-border/50 text-center gap-4">
          <Activity className="w-16 h-16 text-muted-foreground opacity-50 mb-2" />
          <h2 className="text-2xl font-bold">No bots found</h2>
          <p className="text-muted-foreground">It looks like you haven't deployed any trading bots yet.</p>
          <Link href="/create" className="mt-4 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            Create Your First Bot
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pb-20">
          {userBots.map(bot => (
            <div key={bot.id} className="glass-panel p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold truncate max-w-[200px]" title={bot.name}>{bot.name}</h3>
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
                 <a href={`https://gateway.pinata.cloud/ipfs/${bot.cid}`} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
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
      )}
    </main>
  );
}
