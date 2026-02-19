"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname } from "next/navigation";
import { AuthModal } from "@/components/auth-modal";

interface AuthContextType {
  showAuthModal: () => void;
  hideAuthModal: () => void;
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
  protectedRoutes = ["/", "/course","/profile","/leaderboard"],
}: AuthProviderProps) {
  const { connected } = useWallet();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname?.startsWith(route),
  );

  useEffect(() => {
    // Only check after initial render
    if (!hasCheckedAuth) {
      setHasCheckedAuth(true);
      return;
    }

    // Show modal if on protected route and not connected
    if (isProtectedRoute && !connected) {
      setShowModal(true);
    }
  }, [connected, isProtectedRoute, hasCheckedAuth]);

  const showAuthModal = () => setShowModal(true);
  const hideAuthModal = () => setShowModal(false);

  return (
    <AuthContext.Provider value={{ showAuthModal, hideAuthModal }}>
      {children}

      {/* Auth Modal - blocks access to protected routes */}
      <AuthModal
        open={showModal && isProtectedRoute && !connected}
        onOpenChange={setShowModal}
        allowClose={false} // Cannot close without connecting on protected routes
      />
    </AuthContext.Provider>
  );
}
