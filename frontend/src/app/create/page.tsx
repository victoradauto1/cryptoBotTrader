"use client";

import { useState, useEffect } from "react";
import { useCryptoBot } from "@/components/providers/CryptoBotContext";
import { Bot, UploadCloud, ArrowRight, Loader2, Home, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/utils/constants";
import TradingBotManagerABI from "@/abi/TradingBotManager.json";
import { useRouter } from "next/navigation";

export default function CreateBot() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [strategy, setStrategy] = useState("Mean Reversion");
  const [isUploading, setIsUploading] = useState(false);
  const [cid, setCid] = useState("");
  
  const { isConnected, hasActiveSubscription } = useCryptoBot();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const { data: hash, writeContractAsync, isPending: isTxPending } = useWriteContract();
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isTxSuccess) {
      const timer = setTimeout(() => router.push("/dashboard"), 2000);
      return () => clearTimeout(timer);
    }
  }, [isTxSuccess, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setCid("");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          strategy,
          timestamp: Date.now(),
        }),
      });
      const data = await response.json();
      if (data.IpfsHash) {
        setCid(data.IpfsHash);
        
        await writeContractAsync({
          address: CONTRACT_ADDRESSES.TradingBotManager,
          abi: TradingBotManagerABI,
          functionName: "createBot",
          args: [data.IpfsHash],
        });
      } else {
        alert("Upload failed: " + (data.error || "Unknown Error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred during bot creation process.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in duration-700">

      <header className="flex flex-col gap-2 mb-4 text-center">
        <h1 className="text-4xl font-extrabold">
          Create New Bot
        </h1>
        <p className="text-muted-foreground text-lg">Define your strategy parameters and save them immutably to IPFS.</p>
      </header>

      <form onSubmit={handleCreate} className="glass-panel p-8 flex flex-col gap-6">
        
        {mounted && !isConnected && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-xl text-center font-medium">
            Please connect your wallet to create a bot.
          </div>
        )}

        {mounted && isConnected && !hasActiveSubscription && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-center font-medium">
            You need an active PRO subscription to deploy a bot.
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-foreground">Bot Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
            placeholder="e.g. ETH Alpha Scalper"
            required
            disabled={!mounted || !isConnected || !hasActiveSubscription}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-foreground">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[100px] disabled:opacity-50"
            placeholder="Describe the bot's strategy and risk profile..."
            required
            disabled={!mounted || !isConnected || !hasActiveSubscription}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-foreground">Strategy Type</label>
          <select 
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="w-full bg-black/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none disabled:opacity-50"
            disabled={!mounted || !isConnected || !hasActiveSubscription}
          >
            <option value="Mean Reversion">Mean Reversion</option>
            <option value="Trend Following">Trend Following</option>
            <option value="Arbitrage">Arbitrage</option>
            <option value="Grid Trading">Grid Trading</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isUploading || isTxPending || isTxConfirming || isTxSuccess || !mounted || !isConnected || !hasActiveSubscription}
          className="mt-4 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {isUploading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Uploading to IPFS...</>
          ) : isTxPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Confirm in Wallet...</>
          ) : isTxConfirming ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Confirming Transaction...</>
          ) : isTxSuccess ? (
            <><CheckCircle className="w-5 h-5" /> Bot Created Successfully!</>
          ) : (
            <><UploadCloud className="w-5 h-5" /> Create Bot & Deploy <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>

        {cid && (
          <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-xl flex flex-col gap-2 animate-in slide-in-from-bottom-2">
            <h3 className="text-accent font-bold flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Metadata Pinned Successfully
            </h3>
            <p className="text-sm text-muted-foreground break-all">
              <strong>CID:</strong> {cid}
            </p>
            {hash && (
              <p className="text-sm text-muted-foreground mt-2 break-all">
                <strong>Transaction:</strong> {hash}
              </p>
            )}
            {isTxSuccess && (
              <p className="text-sm text-green-500 font-semibold mt-2">
                Transaction confirmed. Redirecting to dashboard...
              </p>
            )}
          </div>
        )}
      </form>
    </main>
  );
}
