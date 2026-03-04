"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { useCallback, useTransition } from "react";

// ─── Hook: shared URL param helpers ──────────────────────────────────────────

export function useCourseParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const language = searchParams.get("lang") as string;
  const query = searchParams.get("q") ?? "";
  const difficulties = searchParams.getAll("difficulty");
  const tracks = searchParams.getAll("track");

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        params.delete(key);
        if (value === null) continue;
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router, pathname],
  );

  return { language, query, difficulties, tracks, updateParams };
}