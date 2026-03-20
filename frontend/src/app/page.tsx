import { Activity, Wallet, ChevronRight, Trophy, TrendingUp, Zap, Star } from "lucide-react";
import Link from "next/link";
import CryptoTicker from "@/components/CryptoTicker";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      {/* TICKER */}
      <CryptoTicker />

      {/* SPLIT HERO SECTION */}
      <section className="w-full max-w-7xl px-6 mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* LEFT: VALUE PROPOSITION */}
        <div className="flex flex-col text-left gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-sm text-primary mb-2 font-semibold w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Protocol Live on Arbitrum
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-foreground leading-[1.1]">
            Automate Your Edge <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">With Smart Contracts</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mt-2 max-w-xl">
            Deploy invincible trading strategies directly to the blockchain. Non-custodial, fully decentralized, and blazing fast.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <Link href="/create" className="px-8 py-4 bg-gradient-to-r from-primary to-pink-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_4px_20px_rgba(250,82,160,0.4)] flex items-center gap-2 text-lg group cursor-pointer">
              Create New Bot <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/dashboard" className="px-8 py-4 glass-panel border border-border text-foreground font-bold rounded-xl hover:bg-muted transition-all text-lg shadow-sm cursor-pointer">
              View Analytics
            </Link>
          </div>
        </div>

        {/* RIGHT: BOT RANKINGS (Hero Right Side) */}
        <div className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden group">
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
            View full rankings &rarr;
          </Link>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="w-full max-w-7xl px-6 mt-32 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pay only for what you use. No hidden fees, no custodial risks. Let your strategies do the heavy lifting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Free Tier */}
          <div className="glass-panel p-8 flex flex-col gap-6 relative">
            <h3 className="text-2xl font-bold text-foreground">Hobbyist</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-foreground">Free</span>
            </div>
            <p className="text-muted-foreground text-sm">Perfect for testing the waters and paper trading.</p>
            <ul className="flex flex-col gap-3 mt-4 flex-1">
              {["1 Active Strategy", "Paper Trading Only", "Standard Execution Speed", "Community Support"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/create" className="w-full py-3 text-center rounded-lg border border-border text-foreground hover:bg-muted font-semibold transition-colors mt-6 cursor-pointer">
              Get Started
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="glass-panel p-8 flex flex-col gap-6 relative border-primary shadow-[0_0_30px_rgba(250,82,160,0.15)]">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3">
              <span className="bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Most Popular
              </span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">Pro Trader</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-foreground">$29</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <p className="text-muted-foreground text-sm">For serious traders deploying capital on-chain.</p>
            <ul className="flex flex-col gap-3 mt-4 flex-1">
              {["Up to 10 Active Strategies", "Live On-Chain Trading", "Priority Execution RPC", "Advanced Analytics", "Discord VIP Support"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/create" className="w-full py-3 text-center rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors mt-6 shadow-[0_0_15px_rgba(250,82,160,0.4)] cursor-pointer">
              Upgrade to Pro
            </Link>
          </div>

          {/* Whale Tier */}
          <div className="glass-panel p-8 flex flex-col gap-6 relative">
            <h3 className="text-2xl font-bold text-foreground">Whale</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-foreground">$199</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <p className="text-muted-foreground text-sm">Institutional grade tools and unlimited power.</p>
            <ul className="flex flex-col gap-3 mt-4 flex-1">
              {["Unlimited Strategies", "Private RPC Endpoints", "Custom Smart Contract Logic", "Front-running Protection", "1-on-1 Strategy Review"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/50" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/create" className="w-full py-3 text-center rounded-lg border border-border text-foreground hover:bg-muted font-semibold transition-colors mt-6 cursor-pointer">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
