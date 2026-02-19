"use client"
import { useWallet } from "@solana/wallet-adapter-react";

export function getCurrentUserId() {
  const { publicKey } = useWallet();
  return {userId: publicKey?.toBase58() ?? "1234", user:publicKey}; // fallback for unauthenticated
}