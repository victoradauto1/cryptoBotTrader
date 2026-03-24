import Link from 'next/link';
import { ChevronLeft, Target, Shield, CheckCircle } from 'lucide-react';

export default function TrainingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center py-20 px-6 max-w-5xl mx-auto">
      <Link href="/" className="self-start inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-12 transition-colors font-medium">
        <ChevronLeft className="w-5 h-5" /> Back to Home
      </Link>
      
      <div className="glass-panel p-10 md:p-16 relative overflow-hidden group border-primary/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-all duration-700"></div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
          Train your bot without<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">risking your finances</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-3xl leading-relaxed">
          Success in the cryptocurrency market requires precision. With our simulation environment, you can test, adjust, and analyze trading logic under exact real-market conditions — with zero financial exposure.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-2">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Complete Security</h3>
            <p className="text-muted-foreground text-sm">
              Use virtual funds in an exact replica of the on-chain market. Validate 100% of your contract's moves without paying real gas fees.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-2">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Real-Time Data</h3>
            <p className="text-muted-foreground text-sm">
              Connect to market oracles. Our simulations experience true volatility to measure your robot's exactness against daily fluctuations.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Immediate Transition</h3>
            <p className="text-muted-foreground text-sm">
              Reached desired profitability? Promote your strategy to the mainnet with a single click. Your bot is ready to generate real profits.
            </p>
          </div>
        </div>

        <Link href="/create" className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all inline-flex items-center justify-center shadow-[0_4px_20px_rgba(250,82,160,0.3)] hover:shadow-[0_4px_25px_rgba(250,82,160,0.5)] cursor-pointer">
          Create My First Bot
        </Link>
      </div>
    </main>
  );
}
