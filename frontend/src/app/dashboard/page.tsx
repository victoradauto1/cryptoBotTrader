"use client";

import { useState, useEffect } from "react";
import { Activity, ExternalLink, Home, Loader2, Wallet, ArrowDownToLine, ArrowUpFromLine, PowerOff, X } from "lucide-react";
import Link from "next/link";
import { useConnection, useWriteContract } from "wagmi";
import { parseEther, formatEther } from "viem";
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
  rawBalance: bigint;
}

export default function Dashboard() {
  const { address } = useConnection();
  const { writeContractAsync } = useWriteContract();
  
  const [userBots, setUserBots] = useState<BotData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Modal / Interaction states
  const [selectedBotForDeposit, setSelectedBotForDeposit] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [isTxPending, setIsTxPending] = useState(false);

  const fetchBots = async () => {
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
          status: active ? "Active" : "Deactivated",
          cid: configCid,
          balance: formatEther(balance),
          rawBalance: balance
        });
      }
      setUserBots(botsData);
    } catch (e) {
      console.error("Failed to load user bots:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, [address, refreshTrigger]);

  const handleDeposit = async (botId: number) => {
    if (!depositAmount || isNaN(Number(depositAmount))) return;
    setIsTxPending(true);
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.TradingBotManager,
        abi: TradingBotManagerABI,
        functionName: "deposit",
        args: [BigInt(botId)],
        value: parseEther(depositAmount)
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setDepositAmount("");
      setSelectedBotForDeposit(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (e) {
      console.error("Deposit failed", e);
    } finally {
      setIsTxPending(false);
    }
  };

  const handleWithdraw = async (botId: number) => {
    setIsTxPending(true);
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.TradingBotManager,
        abi: TradingBotManagerABI,
        functionName: "withdraw",
        args: [BigInt(botId)],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setRefreshTrigger(prev => prev + 1);
    } catch (e) {
      console.error("Withdraw failed", e);
    } finally {
      setIsTxPending(false);
    }
  };

  const handleDeactivate = async (botId: number) => {
    setIsTxPending(true);
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.TradingBotManager,
        abi: TradingBotManagerABI,
        functionName: "deactivateBot",
        args: [BigInt(botId)],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setRefreshTrigger(prev => prev + 1);
    } catch (e) {
      console.error("Deactivate failed", e);
      alert("Failed to deactivate. Make sure the bot balance is 0 before deactivating.");
    } finally {
      setIsTxPending(false);
    }
  };

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
            <div key={bot.id} className={`glass-panel p-6 flex flex-col gap-4 relative overflow-hidden ${bot.status === 'Deactivated' ? 'opacity-70 grayscale' : ''}`}>
              
              {/* Deposit Overlay */}
              {selectedBotForDeposit === bot.id && (
                <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex flex-col justify-center items-center p-6 gap-4 animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={() => setSelectedBotForDeposit(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="font-bold text-lg">Deposit ETH</h3>
                  <p className="text-sm text-muted-foreground text-center">Enter amount of ETH to fund this bot for trading.</p>
                  <input 
                    type="number" 
                    step="0.001"
                    placeholder="0.01" 
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-black/50 border border-border/50 rounded-lg p-3 text-center text-xl font-mono focus:outline-none focus:border-primary transition-colors"
                  />
                  <button 
                    onClick={() => handleDeposit(bot.id)}
                    disabled={!depositAmount || isTxPending}
                    className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isTxPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
                    Confirm Deposit
                  </button>
                </div>
              )}

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold truncate max-w-[180px]" title={bot.name}>{bot.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{bot.strategy}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${bot.status === 'Active' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                  {bot.status}
                </div>
              </div>
              
              <div className="py-2 flex flex-col gap-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1"><Wallet className="w-3 h-3"/> Allocated Balance</span>
                <span className="text-2xl font-mono font-bold">{Number(bot.balance).toFixed(4)} ETH</span>
              </div>

              <div className="flex gap-2 w-full mt-2">
                <button 
                  disabled={bot.status === 'Deactivated' || isTxPending}
                  onClick={() => setSelectedBotForDeposit(bot.id)}
                  className="flex-1 py-2 bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-50 border border-accent/20 text-sm font-bold rounded-lg transition-all flex justify-center items-center gap-1"
                >
                  <ArrowDownToLine className="w-3 h-3" /> Deposit
                </button>
                <button 
                  disabled={bot.rawBalance === BigInt(0) || isTxPending}
                  onClick={() => handleWithdraw(bot.id)}
                  className="flex-1 py-2 bg-secondary/50 text-secondary-foreground hover:bg-secondary disabled:opacity-50 border border-border text-sm font-bold rounded-lg transition-all flex justify-center items-center gap-1"
                >
                  <ArrowUpFromLine className="w-3 h-3" /> Withdraw
                </button>
              </div>

              <div className="flex justify-between items-center mt-2 pt-4 border-t border-border/50">
                 <a href={`https://gateway.pinata.cloud/ipfs/${bot.cid}`} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                   IPFS Config <ExternalLink className="w-3 h-3" />
                 </a>
                 <button 
                   disabled={bot.status === 'Deactivated' || bot.rawBalance > BigInt(0) || isTxPending}
                   onClick={() => handleDeactivate(bot.id)}
                   title={bot.rawBalance > BigInt(0) ? "Withdraw funds first to deactivate" : "Deactivate bot"}
                   className="p-2 bg-destructive/20 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive hover:text-destructive-foreground disabled:opacity-30 disabled:hover:bg-destructive/20 disabled:hover:text-destructive transition-all"
                 >
                   <PowerOff className="w-4 h-4" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
