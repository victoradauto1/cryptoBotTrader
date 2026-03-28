"use client";

import { useState } from "react";
import { Search, Bot, Activity, Calendar, Hash, ArrowUpRight } from "lucide-react";

// Frontend mock data
const MOCK_BOTS = [
  {
    id: "1",
    name: "ETH Alpha Scalper",
    config: "Mean Reversion",
    creationDate: "2026-03-10",
    performance: "+42.5%",
    address: "0x7a2...b9f4",
    status: "active"
  },
  {
    id: "2",
    name: "Arb Maestro",
    config: "Arbitrage",
    creationDate: "2026-02-15",
    performance: "+18.2%",
    address: "0x3f1...c2a1",
    status: "active"
  },
  {
    id: "3",
    name: "BTC Trend Rider",
    config: "Trend Following",
    creationDate: "2026-03-01",
    performance: "-4.1%",
    address: "0x8e5...d110",
    status: "paused"
  },
  {
    id: "4",
    name: "Sushi Rebalancer",
    config: "Grid Trading",
    creationDate: "2026-01-20",
    performance: "+65.8%",
    address: "0x9c4...e332",
    status: "active"
  }
];

export default function AllBotsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBots = MOCK_BOTS.filter(bot => {
    const term = searchTerm.toLowerCase();
    return (
      bot.address.toLowerCase().includes(term) ||
      bot.performance.toLowerCase().includes(term) ||
      bot.name.toLowerCase().includes(term)
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
      <div className="w-full relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search by bot name, wallet address, or performance..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:shadow-md transition-all text-lg"
        />
      </div>

      {/* BOT GRID */}
      {filteredBots.length === 0 ? (
        <div className="w-full py-20 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-2xl">
          <Bot className="w-16 h-16 opacity-30 mb-4" />
          <p className="text-xl font-medium">No bots found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBots.map((bot) => (
            <div key={bot.id} className="glass-panel p-6 flex flex-col gap-5 hover:scale-[1.02] transition-transform duration-300">
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{bot.name}</h3>
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
                  <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground text-xs flex items-center gap-1">
                    {bot.address} <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> 30D Return
                </span>
                <span className={`text-xl font-extrabold ${bot.performance.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {bot.performance}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
