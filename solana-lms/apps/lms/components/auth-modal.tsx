"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { Loader2, ChevronRight, Download } from "lucide-react";
import { Dialog, DialogContent } from "@workspace/ui/components/dialog";

interface AuthModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  allowClose?: boolean;
}

// Download URLs for each wallet
const WALLET_DOWNLOADS: Record<string, string> = {
  Phantom: "https://phantom.app/download",
  "Trust Wallet": "https://trustwallet.com/download",
  "Coinbase Wallet": "https://www.coinbase.com/wallet/downloads",
};

// Wallet display info
const WALLET_INFO = [
  {
    name: "Phantom",
    icon: (
      <svg
        width={25}
        height={25}
        color="#ab9ff2"
        fill="none"
        viewBox="0 0 108 93"
      >
        <title>Logo Phantom</title>
        <path
          d="M0.5 78.1789C0.5 90.2265 6.7065 93 13.1613 93C26.8155 93 37.077 80.6058 43.2007 70.8118C42.4559 72.9786 42.0422 75.1454 42.0422 77.2255C42.0422 82.946 45.1868 87.0196 51.3933 87.0196C59.9169 87.0196 69.0197 79.219 73.7367 70.8118C73.4056 72.0252 73.2401 73.1519 73.2401 74.192C73.2401 78.1789 75.3917 80.6924 79.7777 80.6924C93.5975 80.6924 107.5 55.124 107.5 32.7623C107.5 15.3411 99.0592 0 77.8743 0C40.6354 0 0.5 47.4967 0.5 78.1789ZM65.0476 30.8555C65.0476 26.5219 67.3647 23.4884 70.7575 23.4884C74.0677 23.4884 76.3848 26.5219 76.3848 30.8555C76.3848 35.1892 74.0677 38.3094 70.7575 38.3094C67.3647 38.3094 65.0476 35.1892 65.0476 30.8555ZM82.7568 30.8555C82.7568 26.5219 85.0739 23.4884 88.4668 23.4884C91.7769 23.4884 94.094 26.5219 94.094 30.8555C94.094 35.1892 91.7769 38.3094 88.4668 38.3094C85.0739 38.3094 82.7568 35.1892 82.7568 30.8555Z"
          fill="currentColor"
        ></path>
      </svg>
    ),
    description: "Popular Solana wallet",
  },
  {
    name: "Trust Wallet",
    icon: (
      <svg
        width={25}
        height={25}
        viewBox="0 0 39 43"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.710815 6.67346L19.4317 0.606445V42.6064C6.05944 37.0059 0.710815 26.2727 0.710815 20.207V6.67346Z"
          fill="#0500FF"
        ></path>
        <path
          d="M38.1537 6.67346L19.4329 0.606445V42.6064C32.8051 37.0059 38.1537 26.2727 38.1537 20.207V6.67346Z"
          fill="url(#paint0_linear_524_75868undefined)"
        ></path>
        <defs>
          <linearGradient
            id="paint0_linear_524_75868undefined"
            x1="33.1809"
            y1="-2.33467"
            x2="19.115"
            y2="42.0564"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.02" stop-color="#0000FF"></stop>
            <stop offset="0.08" stop-color="#0094FF"></stop>
            <stop offset="0.16" stop-color="#48FF91"></stop>
            <stop offset="0.42" stop-color="#0094FF"></stop>
            <stop offset="0.68" stop-color="#0038FF"></stop>
            <stop offset="0.9" stop-color="#0500FF"></stop>
          </linearGradient>
        </defs>
      </svg>
    ),
    description: "Mobile-first",
  },
  {
    name: "Coinbase Wallet",
    icon: (
      <svg
   width={25}
        height={25}
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle fill="#0052ff" cx="512" cy="512" r="512" />
        <path
        fill="white"
          d="M516.3 361.83c60.28 0 108.1 37.18 126.26 92.47H764C742 336.09 644.47 256 517.27 256 372.82 256 260 365.65 260 512.49S370 768 517.27 768c124.35 0 223.82-80.09 245.84-199.28H642.55c-17.22 55.3-65 93.45-125.32 93.45-83.23 0-141.56-63.89-141.56-149.68.04-86.77 57.43-150.66 140.63-150.66z"
        />
      </svg>
    ),
    description: "Easy and secure",
  },
];

export function AuthModal({
  open,
  onOpenChange,
  allowClose = false,
}: AuthModalProps) {
  const { connected, connecting, publicKey, select, wallets } = useWallet();
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    // Auto-close when wallet connects
    if (connected) {
      setIsOpen(false);
      onOpenChange?.(false);
    }
  }, [connected, onOpenChange]);

  const handleOpenChange = (open: boolean) => {
    if (allowClose || connected) {
      setIsOpen(open);
      onOpenChange?.(open);
    }
  };

  // ✅ Check if wallet is ACTUALLY installed (readyState === 'Installed')
  const isWalletInstalled = (walletName: string) => {
    return wallets.some(
      (w) =>
        w.adapter.name.toLowerCase().includes(walletName.toLowerCase()) &&
        w.readyState === "Installed", // ✅ This is the key check!
    );
  };

  const handleWalletClick = (walletName: string) => {
    const isInstalled = isWalletInstalled(walletName);

    if (isInstalled) {
      // Find and select the wallet
      const wallet = wallets.find(
        (w) =>
          w.adapter.name.toLowerCase().includes(walletName.toLowerCase()) &&
          w.readyState === "Installed",
      );
      if (wallet) {
        select(wallet.adapter.name);
      }
    } else {
      // Open download page
      const downloadUrl = WALLET_DOWNLOADS[walletName];
      if (downloadUrl) {
        window.open(downloadUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-sm p-0 gap-0 overflow-hidden"
        onPointerDownOutside={(e) => !allowClose && e.preventDefault()}
        onEscapeKeyDown={(e) => !allowClose && e.preventDefault()}
      >
        {/* Header with Logo */}
        <div className="flex flex-col items-center pt-12 pb-8 px-6">
          <svg
            width="65"
            height="65"
            viewBox="0 0 11 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="10"
              height="9.5"
              rx="1"
              fill="white"
              fillOpacity="0.95"
            />
            <rect
              x="6.30295"
              y="1.73258"
              width="1"
              height="6.08529"
              rx="0.5"
              transform="rotate(45 6.30295 1.73258)"
              fill="black"
            />
            <rect
              x="9.92242"
              y="0.5"
              width="1"
              height="8.37557"
              rx="0.5"
              transform="rotate(45 9.92242 0.5)"
              fill="black"
            />
          </svg>

          <h2 className="text-2xl font-bold  text-accent-foreground tracking-tighter">
            Welcome to Solex
          </h2>
          <p className="text-sm tracking-tight text-muted-foreground mt-2">
            Connect your wallet to start learning
          </p>
        </div>

        {/* Wallet Options */}
        <div className="px-4 pb-6">
          <div className=" rounded-2xl overflow-hidden border">
            {connecting ? (
              <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : connected && publicKey ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-500 text-2xl">✓</span>
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  <div className="text-green-500 font-medium mb-1">
                    Connected
                  </div>
                  <div className="font-mono text-xs">
                    {publicKey.toBase58().slice(0, 4)}...
                    {publicKey.toBase58().slice(-4)}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {WALLET_INFO.map((wallet, index) => {
                  const isInstalled = isWalletInstalled(wallet.name);

                  return (
                    <button
                      key={wallet.name}
                      onClick={() => handleWalletClick(wallet.name)}
                      className={`
                        w-full flex items-center gap-4 px-6 py-4 
                        hover:bg-muted/50 transition-colors
                        ${index !== 0 ? "border-t border-border" : ""}
               
                      `}
                    >
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-white/10 to-white/5 flex items-center justify-center text-2xl">
                        {wallet.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-accent-foreground/80  flex items-center gap-2">
                          {wallet.name}
                          {isInstalled ? (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-500/20 text-green-500 font-medium">
                              Detected
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 text-muted-foreground font-medium">
                              Not Installed
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isInstalled
                            ? wallet.description
                            : "Click to install"}
                        </div>
                      </div>
                      {isInstalled ? (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Download className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <p className="text-xs tracking-tight text-muted-foreground text-center leading-relaxed">
            By connecting your wallet and using Superteam Academy, you agree to
            our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            &{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
