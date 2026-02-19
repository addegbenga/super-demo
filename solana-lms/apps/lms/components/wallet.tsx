"use client";
import { Wallet, Copy, ExternalLink, LogOut, ChevronDown, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { cn } from "@workspace/ui/lib/utils";

export function WalletPopover() {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);

  const address = publicKey?.toBase58() ?? null;
  const shortAddress = address
    ? `${address.slice(0, 4)}…${address.slice(-4)}`
    : null;

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Not connected — open the wallet adapter modal (Phantom, Backpack, etc.)
  if (!connected || !address) {
    return (
      <Button
        onClick={() => setVisible(true)}
        size="sm"
        className="gap-2 h-8 px-4 rounded-full bg-background border border-border font-medium text-xs transition-all"
      >
        <Wallet className="w-3.5 h-3.5" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 h-8 px-3 rounded-full bg-background border border-border transition-all group">
          {/* Live green pulse */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-mono text-white/80">{shortAddress}</span>
          <ChevronDown className="w-3 h-3 text-white/40 group-hover:text-white/60 transition-colors" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-72 p-0 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">
              Connected
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {/* Gradient avatar — unique per wallet via address color */}
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-mono text-white font-medium leading-tight truncate">
                {shortAddress}
              </p>
              <p className="text-[11px] text-white/40 mt-0.5">Solana</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-2 flex flex-col gap-0.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
            )}
            <span
              className={cn(
                "text-sm transition-colors",
                copied ? "text-emerald-400" : "text-white/70 group-hover:text-white",
              )}
            >
              {copied ? "Copied!" : "Copy address"}
            </span>
          </button>

          <a
            href={`https://solscan.io/account/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
            <span className="text-sm text-white/70 group-hover:text-white transition-colors">
              View on Solscan
            </span>
          </a>

          <div className="my-1 h-px bg-white/5 mx-2" />

          <button
            onClick={() => disconnect()}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-left group"
          >
            <LogOut className="w-4 h-4 text-white/40 group-hover:text-red-400 transition-colors" />
            <span className="text-sm text-white/70 group-hover:text-red-400 transition-colors">
              Disconnect
            </span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}