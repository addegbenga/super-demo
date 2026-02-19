"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname } from "next/navigation";
import { AuthModal } from "@/components/auth-modal";

interface AuthContextType {
  showAuthModal: () => void;
  hideAuthModal: () => void;
  isConnected?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
  protectedRoutes?: string[];
}

export function AuthProvider({
  children,
  protectedRoutes = ["/profile", "/certificates", "/leaderboard"],
}: AuthProviderProps) {
  const { connected } = useWallet();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname?.startsWith(route),
  );

  // Auto-block protected routes
  useEffect(() => {
    if (isProtectedRoute && !connected) {
      setShowModal(true);
    }
  }, [connected, isProtectedRoute]);

  return (
    <AuthContext.Provider
      value={{
        showAuthModal: () => setShowModal(true),
        hideAuthModal: () => setShowModal(false),
        isConnected: connected,
      }}
    >
      {children}
      <AuthModal
        open={showModal}
        onOpenChange={setShowModal}
        allowClose={!isProtectedRoute}
      />
    </AuthContext.Provider>
  );
}
