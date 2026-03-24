import Link from 'next/link';
import { ChevronLeft, BarChart3, TrendingUp, Cpu } from 'lucide-react';

export default function ComparePage() {
  return (
    <main className="min-h-screen flex flex-col items-center py-20 px-6 max-w-5xl mx-auto">
      <Link href="/" className="self-start inline-flex items-center gap-2 text-muted-foreground hover:text-blue-500 mb-12 transition-colors font-medium">
        <ChevronLeft className="w-5 h-5" /> Back to Home
      </Link>
      
      <div className="glass-panel p-10 md:p-16 relative overflow-hidden group border-blue-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-all duration-700"></div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
          Compare performance and<br/><span className="text-blue-500">optimize your success</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-3xl leading-relaxed">
          Data-driven decisions outperform intuition. Analyze your bots' history, cross-reference vital metrics, and identify which strategy performs best under different market conditions.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-2">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Detailed Metrics</h3>
            <p className="text-muted-foreground text-sm">
              Access a dashboard displaying Win Rate, Total PnL, Maximum Drawdown, ROI, and much more, all clearly shown in real-time.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-2">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Fine Tuning</h3>
            <p className="text-muted-foreground text-sm">
              Calibrate take-profit and stop-loss based on logs showing exactly where each trade could have generated an extra 0.1% edge.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Global Overview</h3>
            <p className="text-muted-foreground text-sm">
              Evaluate how your different algorithms perform against each other or famous community strategies, adapting during high or low liquidity times.
            </p>
          </div>
        </div>

        <Link href="/dashboard" className="px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all inline-flex items-center justify-center shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.5)] cursor-pointer">
          Access My Dashboard
        </Link>
      </div>
    </main>
  );
}
