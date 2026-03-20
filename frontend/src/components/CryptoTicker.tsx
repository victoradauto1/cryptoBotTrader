"use client";
import { useEffect, useState } from "react";

type Coin = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
};

export default function CryptoTicker() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCoins(data);
        }
      })
      .catch(err => console.error("Failed to fetch ticker data", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || coins.length === 0) return (
    <div className="w-full bg-card border-y border-border py-4 flex items-center justify-center shadow-sm glass-panel !rounded-none !border-x-0 relative z-10">
      <span className="text-muted-foreground text-sm font-medium animate-pulse">Loading live prices...</span>
    </div>
  );

  // Duplicate for seamless marquee loop
  const displayCoins = [...coins, ...coins];

  return (
    <div className="w-full bg-card border-y border-border overflow-hidden py-3 shadow-sm relative z-10 glass-panel !rounded-none !border-x-0">
      <div className="flex items-center gap-10 animate-ticker">
        {displayCoins.map((coin, i) => (
          <div key={`${coin.id}-${i}`} className="flex items-center gap-3 whitespace-nowrap">
            <span className="font-extrabold text-foreground uppercase tracking-tight">{coin.symbol}</span>
            <span className="font-medium text-muted-foreground">${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
            <span className={`text-sm font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-primary'}`}>
              {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
