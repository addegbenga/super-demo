"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http")) return;
      if (href === `${window.location.pathname}${window.location.search}`) return;

      setVisible(true);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    setVisible(false);
  }, [pathname, searchParams]);

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0, pointerEvents: "none" }}
    >
      <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
    </div>
  );
}