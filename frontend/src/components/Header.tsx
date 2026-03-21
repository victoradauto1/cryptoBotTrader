import { Bot } from "lucide-react";
import Link from "next/link";
import { ConnectWallet } from "@/components/ConnectWallet";

export default function Header() {
  return (
    <header className="w-full flex justify-between items-center py-5 px-6 md:px-12 sticky top-0 z-50 glass-panel !rounded-none !border-x-0 !border-t-0 bg-card/90">
      <Link href="/" className="flex items-center gap-3 cursor-pointer">
        <Bot className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          CryptoBot<span className="text-accent">Trader</span>
        </h1>
      </Link>
      <nav className="flex items-center gap-6 text-sm font-semibold">
        <Link href="/all-bots" className="text-muted-foreground hover:text-primary transition-colors hidden sm:block">Explore Bots</Link>
        <Link href="/create" className="text-muted-foreground hover:text-primary transition-colors hidden sm:block">Create Bot</Link>
        <ConnectWallet />
      </nav>
    </header>
  );
}
