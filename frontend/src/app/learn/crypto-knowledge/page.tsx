import Link from 'next/link';
import { ChevronLeft, Globe, LineChart, BookOpen } from 'lucide-react';

export default function CryptoKnowledgePage() {
  return (
    <main className="min-h-screen flex flex-col items-center py-20 px-6 max-w-5xl mx-auto">
      <Link href="/" className="self-start inline-flex items-center gap-2 text-muted-foreground hover:text-purple-500 mb-12 transition-colors font-medium">
        <ChevronLeft className="w-5 h-5" /> Back to Home
      </Link>
      
      <div className="glass-panel p-10 md:p-16 relative overflow-hidden group border-purple-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10 group-hover:bg-purple-500/10 transition-all duration-700"></div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
          Enhance your knowledge of the <br/><span className="text-purple-500">most relevant cryptos</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-3xl leading-relaxed">
          To profit in Trading, you can't operate blindly. Understanding each asset's fundamentals and technical movements is the key that separates amateurs from consistent investors.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center mb-2">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Market Overview</h3>
            <p className="text-muted-foreground text-sm">
              Discover which narratives drive new tokens, how protocol updates affect L2 networks, and what to watch out for in times of decorrelation.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center mb-2">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Technical Analysis</h3>
            <p className="text-muted-foreground text-sm">
              Learn to map support and resistance, identify institutional order blocks, and visualize liquidity zones to configure your bot's entries.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center mb-2">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Constant Resources</h3>
            <p className="text-muted-foreground text-sm">
              Read our exclusive weekly articles. We explain everything from how Uniswap V3 pools work to advanced Market Making techniques.
            </p>
          </div>
        </div>

        <Link href="/all-bots" className="px-8 py-4 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition-all inline-flex items-center justify-center shadow-[0_4px_20px_rgba(168,85,247,0.3)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.5)] cursor-pointer">
          Explore Community Bots
        </Link>
      </div>
    </main>
  );
}
