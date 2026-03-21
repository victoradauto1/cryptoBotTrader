"use client";

import { useState } from "react";
import { Bot, UploadCloud, ArrowRight, Loader2, Home } from "lucide-react";
import Link from "next/link";

export default function CreateBot() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [strategy, setStrategy] = useState("Mean Reversion");
  const [isUploading, setIsUploading] = useState(false);
  const [cid, setCid] = useState("");

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
      } else {
        alert("Upload failed: " + (data.error || "Unknown Error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in duration-700">

      <header className="flex flex-col gap-2 mb-4">
        <h1 className="text-4xl font-extrabold flex items-center gap-3">
          <Bot className="w-10 h-10 text-primary" /> Create New Bot
        </h1>
        <p className="text-muted-foreground text-lg">Define your strategy parameters and save them immutably to IPFS.</p>
      </header>

      <form onSubmit={handleCreate} className="glass-panel p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-foreground">Bot Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="e.g. ETH Alpha Scalper"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-foreground">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[100px]"
            placeholder="Describe the bot's strategy and risk profile..."
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-foreground">Strategy Type</label>
          <select 
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="w-full bg-black/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
          >
            <option value="Mean Reversion">Mean Reversion</option>
            <option value="Trend Following">Trend Following</option>
            <option value="Arbitrage">Arbitrage</option>
            <option value="Grid Trading">Grid Trading</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isUploading}
          className="mt-4 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {isUploading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Uploading to IPFS...</>
          ) : (
            <><UploadCloud className="w-5 h-5" /> Save Metadata & Get CID <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
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
            <p className="text-sm text-muted-foreground mt-2">
              Next step: This CID will be passed to your `createBot()` smart contract transaction.
            </p>
          </div>
        )}
      </form>
    </main>
  );
}
