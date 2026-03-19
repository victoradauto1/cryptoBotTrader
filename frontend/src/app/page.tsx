import { Bot, Activity, Wallet, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ConnectWallet } from "@/components/ConnectWallet";

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-12">
      <header className="flex justify-between items-center py-5 glass-panel px-8 sticky top-6 z-50">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-accent" />
          <h1 className="text-2xl font-bold tracking-tight">CryptoBot<span className="text-primary text-blue-500">Trader</span></h1>
        </div>
        <nav className="flex items-center gap-6">
          <ConnectWallet />
        </nav>
      </header>

      <section className="flex flex-col items-center text-center mt-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-sm text-accent mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          Protocol Live on Arbitrum
        </div>
        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/30 max-w-4xl leading-tight">
          Automate Your Edge <br/> With Smart Contracts
        </h2>
        <p className="text-muted-foreground max-w-2xl text-lg md:text-xl leading-relaxed">
          Deploy invincible trading strategies stored on IPFS. Non-custodial, fully decentralized, and blazing fast.
        </p>
        <div className="flex gap-4 mt-4">
          <Link href="/create" className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center gap-2 text-lg group">
            Create New Bot <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/dashboard" className="px-8 py-4 bg-card border border-border text-foreground font-semibold rounded-full hover:bg-white/5 transition-all text-lg">
            View Analytics
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pb-20">
        {[
          { icon: Bot, title: "Autonomous Execution", desc: "Bots execute trades seamlessly without centralized server pinging, using network keep-alives." },
          { icon: Activity, title: "On-Chain Analytics", desc: "Verifiable PnL, historical trades, and real-time execution speeds pulled right from the source." },
          { icon: Wallet, title: "Non-Custodial", desc: "Your keys, your yield. Only your approved strategies can access your liquidity pools." }
        ].map((feature, i) => (
          <div key={i} className="glass-panel p-8 flex flex-col gap-5 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
               <feature.icon className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold">{feature.title}</h3>
            <p className="text-muted-foreground text-base leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
