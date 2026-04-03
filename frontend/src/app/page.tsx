import { Activity, Wallet, ChevronRight, Trophy, TrendingUp, Zap, Star } from "lucide-react";
import Link from "next/link";
import CryptoTicker from "@/components/CryptoTicker";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      {/* TICKER */}
      <CryptoTicker />

      {/* SPLIT HERO SECTION */}
      <section className="w-full max-w-7xl px-6 mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-stretch animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* LEFT: VALUE PROPOSITION */}
        <div className="flex flex-col text-left gap-6 h-full justify-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-sm text-primary mb-2 font-semibold w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Protocol Live on Sepolia
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground leading-[1.1]">
            Automate your <br className="hidden md:block" /> 
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">cryptocurrency trading.</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mt-2 max-w-xl">
            Non-custodial smart contract automation for simulated market trading.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <Link href="/create" className="px-8 py-4 bg-linear-to-r from-primary to-pink-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_4px_20px_rgba(250,82,160,0.4)] flex items-center gap-2 text-lg group cursor-pointer">
              Create New Bot 
            </Link>
            <Link href="/dashboard" className="px-8 py-4 glass-panel border border-border text-foreground font-bold rounded-xl hover:bg-muted transition-all text-lg shadow-sm cursor-pointer">
              View Analytics
            </Link>
          </div>
        </div>

        <div className="glass-panel p-8 flex flex-col gap-6 relative overflow-hidden group h-full justify-center">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 group-hover:bg-primary/20 transition-all duration-700"></div>
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="text-accent w-6 h-6" /> Top Performing Bots
            </h3>
            <span className="text-xs font-semibold px-2 py-1 bg-accent/20 text-accent rounded-md">Live 30D APY</span>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { name: "Alpha Sniper V2", pair: "WETH/USDC", apy: "+142.5%", rank: 1, trades: 1240 },
              { name: "Arb Maestro", pair: "ARB/USDC", apy: "+98.2%", rank: 2, trades: 892 },
              { name: "Sushi Rebalancer", pair: "SUSHI/WETH", apy: "+76.8%", rank: 3, trades: 415 },
            ].map((bot, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-muted transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-500/20 text-yellow-600' : i === 1 ? 'bg-zinc-300/20 text-zinc-500' : 'bg-orange-400/20 text-orange-600'}`}>
                    #{bot.rank}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-foreground">{bot.name}</h4>
                    <p className="text-xs text-muted-foreground">{bot.pair} • {bot.trades} trades</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600 flex items-center justify-end gap-1">
                    <TrendingUp className="w-4 h-4" /> {bot.apy}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard" className="text-sm text-center text-primary mt-2 hover:underline font-semibold block cursor-pointer">
            View full rankings
          </Link>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="w-full max-w-7xl px-6 mt-32 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            The Power of Our Ecosystem
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover how our platform empowers you to explore the full potential of decentralized finance with intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Feature 1: Treinamento */}
          <Link href="/learn/training" className="glass-panel p-8 flex flex-col gap-6 relative group transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(250,82,160,0.15)] hover:border-primary/50 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Risk-Free Training</h3>
            <p className="text-muted-foreground text-sm flex-1 leading-relaxed">
              Train your bot without risking your funds! Use our secure simulation environment to validate your strategies live before investing real money.
            </p>
            <div className="mt-4 pt-4 border-t border-border/50 text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Learn how it works <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Feature 2: Comparação de Bots */}
          <Link href="/learn/compare" className="glass-panel p-8 flex flex-col gap-6 relative group transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(250,82,160,0.15)] hover:border-primary/50 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Optimize Your Success</h3>
            <p className="text-muted-foreground text-sm flex-1 leading-relaxed">
              Compare bot performances and maximize your profits. Access detailed data analytics, rank top strategies, and fine-tune your robot's parameters.
            </p>
            <div className="mt-4 pt-4 border-t border-border/50 text-blue-500 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              View success metrics <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Feature 3: Conhecimento Crypto */}
          <Link href="/learn/crypto-knowledge" className="glass-panel p-8 flex flex-col gap-6 relative group transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(250,82,160,0.15)] hover:border-primary/50 cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Crypto Knowledge</h3>
            <p className="text-muted-foreground text-sm flex-1 leading-relaxed">
              Enhance your understanding of the cryptocurrencies that interest you most. Discover broader market trends and become a true expert.
            </p>
            <div className="mt-4 pt-4 border-t border-border/50 text-purple-500 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Explore the evolution <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </section>

    </main>
  );
}
