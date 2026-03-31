"use client";

import { useState, useEffect } from "react";
import { Search, Bot, Activity, Calendar, Hash, ArrowUpRight, Loader2 } from "lucide-react";
import { publicClient, CONTRACT_ADDRESSES } from "@/utils/constants";
import TradingBotManagerABI from "@/abi/TradingBotManager.json";

interface GlobalBotData {
  id: number;
  name: string;
  config: string;
  creationDate: string;
  performance: string;
  address: string;
  status: string;
  cid: string;
}

export default function AllBotsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allBots, setAllBots] = useState<GlobalBotData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAllBots() {
      setIsLoading(true);
      try {
        const botCount = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.TradingBotManager,
          abi: TradingBotManagerABI,
          functionName: "botCount",
        }) as bigint;

        const count = Number(botCount);
        const promises = [];

        for (let i = 0; i < count; i++) {
          promises.push(
            publicClient.readContract({
              address: CONTRACT_ADDRESSES.TradingBotManager,
              abi: TradingBotManagerABI,
              functionName: "bots",
              args: [BigInt(i)],
            }).then(async (botInfo: any) => {
              const [owner, configCid, balance, active] = botInfo;
              let metadata = { name: `Bot #${i}`, strategy: "Unknown" };
              if (configCid) {
                try {
                  const res = await fetch(`https://gateway.pinata.cloud/ipfs/${configCid}`);
                  if (res.ok) {
                    metadata = await res.json();
                  }
                } catch (e) {
                  // ignore
                }
              }

              return {
                id: i,
                name: metadata.name || `Bot #${i}`,
                config: metadata.strategy || "Unknown Strategy",
                creationDate: "Recently", 
                performance: "0.0%",
                address: owner,
                status: active ? "active" : "paused",
                cid: configCid
              } as GlobalBotData;
            })
          );
        }

        const results = await Promise.all(promises);
        setAllBots(results.reverse()); 
      } catch (error) {
        console.error("Failed to load global bots:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllBots();
  }, []);

  const filteredBots = allBots.filter(bot => {
    const term = searchTerm.toLowerCase();
    return (
      bot.address.toLowerCase().includes(term) ||
      bot.performance.toLowerCase().includes(term) ||
      bot.name.toLowerCase().includes(term) ||
      bot.config.toLowerCase().includes(term)
    );
  });

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-2 mb-2 text-center">
        <h1 className="text-4xl font-extrabold text-foreground">
          Explore All Bots
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover, analyze, and track decentralized trading bots running on-chain.
        </p>
      </header>

      {/* SEARCH BAR */}
      <div className="w-full relative max-w-2xl mx-auto flex gap-4 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search by bot name, wallet address, or performance..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:shadow-md transition-all text-lg disabled:opacity-50"
            disabled={isLoading}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <span className="text-muted-foreground font-semibold animate-pulse">Loading all bots from the blockchain...</span>
        </div>
      ) : filteredBots.length === 0 ? (
        <div className="w-full py-20 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-2xl">
          <Bot className="w-16 h-16 opacity-30 mb-4" />
          <p className="text-xl font-medium">No bots found {searchTerm ? 'matching your search' : ''}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBots.map((bot) => (
            <div key={bot.id} className="glass-panel p-6 flex flex-col gap-5 hover:scale-[1.02] transition-transform duration-300">
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-foreground truncate max-w-[200px]" title={bot.name}>{bot.name}</h3>
                  <p className="text-sm font-medium text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full mt-1">
                    {bot.config}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${bot.status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_theme(colors.emerald.400)]' : 'bg-yellow-400'}`} title={bot.status} />
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Created</span>
                  <span className="font-semibold text-foreground">{bot.creationDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Hash className="w-4 h-4" /> Address</span>
                  <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground text-xs flex items-center gap-1" title={bot.address}>
                    {bot.address.substring(0, 6)}...{bot.address.substring(bot.address.length - 4)}
                    <a href={`https://sepolia.arbiscan.io/address/${bot.address}`} target="_blank" rel="noreferrer" className="hover:text-primary"><ArrowUpRight className="w-3 h-3" /></a>
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> Est. 30D Return
                </span>
                <span className={`text-xl font-extrabold ${bot.performance.startsWith('-') ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {bot.performance !== "0.0%" ? bot.performance : "N/A"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
