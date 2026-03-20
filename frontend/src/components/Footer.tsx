import { Bot } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background border-t border-border mt-auto">
      {/* Upper section */}
      <div className="w-full py-8 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <Bot className="w-6 h-6 text-primary" />
          <p className="text-xl font-bold tracking-tight text-foreground">CryptoBot<span className="text-accent">Trader</span></p>
        </div>

        <nav className="flex gap-6 text-sm font-semibold">
          <a href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</a>
          <a href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</a>
          <a href="/create" className="text-muted-foreground hover:text-primary transition-colors">Create Bot</a>
        </nav>
      </div>

      {/* Divider line */}
      <div className="w-full h-px bg-border"></div>

      {/* Lower section */}
      <div className="w-full py-10 px-6 bg-background">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
          {/* Social icons */}
          <div className="flex items-center gap-6">
            <a href="javascript:void(0)" className="text-muted-foreground hover:text-accent transition-colors">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 2 .1v2.3h-1.1c-1 0-1.3.6-1.3 1.2V12h2.5l-.4 3h-2.1v7A10 10 0 0 0 22 12z" />
              </svg>
            </a>
            <a href="javascript:void(0)" className="text-muted-foreground hover:text-accent transition-colors">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 0 1-3.1 1.5A4.48 4.48 0 0 0 16.5 3c-2.5 0-4.5 2-4.5 4.4 0 .3 0 .7.1 1A12.9 12.9 0 0 1 3 4s-4 9 5 13a13.4 13.4 0 0 1-8 2c9 5 20 0 20-11.5v-.5A7.7 7.7 0 0 0 23 3z" />
              </svg>
            </a>
            <a href="javascript:void(0)" className="text-muted-foreground hover:text-accent transition-colors">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7z" />
              </svg>
            </a>
            <a href="javascript:void(0)" className="text-muted-foreground hover:text-accent transition-colors">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.45 20.45h-3.6v-5.4c0-1.3 0-3-1.9-3s-2.1 1.5-2.1 2.9v5.4h-3.6V9h3.4v1.6h.1a3.7 3.7 0 0 1 3.3-1.8c3.5 0 4.1 2.3 4.1 5.2v6.4z" />
              </svg>
            </a>
          </div>

          <p className="text-center text-sm leading-relaxed max-w-2xl text-muted-foreground">
            <strong className="text-foreground">
              Decentralized trading, on-chain transparency.
            </strong>
            <br />
            CryptoBotTrader is a non-custodial platform. Users are fully responsible for
            their wallet interactions and automated trading decisions.
          </p>
          <p className="text-xs text-muted-foreground/60">&copy; {currentYear} CryptoBotTrader. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
