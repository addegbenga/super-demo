"use client";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { X } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Search, Filter } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useDebouncedCallback } from "use-debounce";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useCourseParams } from "@/hooks";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
const TRACKS = ["fundamentals", "defi", "nft", "gaming", "tooling"] as const;


// ─── CourseHeader ─────────────────────────────────────────────────────────────

export function CourseHeader() {
  const { t } = useI18n();
  const { query, difficulties, tracks, updateParams } = useCourseParams();

  const activeFilterCount = difficulties.length + tracks.length;

  const handleSearch = useDebouncedCallback((value: string) => {
    updateParams({ q: value || null });
  }, 300);

  const toggleDifficulty = (value: string) => {
    const next = difficulties.includes(value)
      ? difficulties.filter((d) => d !== value)
      : [...difficulties, value];
    updateParams({ difficulty: next.length ? next : null });
  };

  const toggleTrack = (value: string) => {
    const next = tracks.includes(value)
      ? tracks.filter((t) => t !== value)
      : [...tracks, value];
    updateParams({ track: next.length ? next : null });
  };

  const clearFilters = () => updateParams({ difficulty: null, track: null });

  return (
    <div className="flex flex-col gap-6 mb-12">
      <div>
        <h1 className="text-3xl tracking-tighter font-bold mb-2">
          {t("courses.courseCatalog")}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("courses.masterSolana")}
        </p>
      </div>

      <div className="flex w-full md:w-auto gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("courses.searchCourses")}
            defaultValue={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-11 bg-white/5 border-white/10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-white/10 h-11 bg-white/5"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t("common.filter")}
              {activeFilterCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Difficulty</DropdownMenuLabel>
            {DIFFICULTIES.map((d) => (
              <DropdownMenuCheckboxItem
                key={d}
                checked={difficulties.includes(d)}
                onCheckedChange={() => toggleDifficulty(d)}
                className="capitalize"
              >
                {d}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Track</DropdownMenuLabel>
            {TRACKS.map((track) => (
              <DropdownMenuCheckboxItem
                key={track}
                checked={tracks.includes(track)}
                onCheckedChange={() => toggleTrack(track)}
                className="capitalize"
              >
                {track}
              </DropdownMenuCheckboxItem>
            ))}
            {activeFilterCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <button
                  onClick={clearFilters}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear filters
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active filter pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {difficulties.map((d) => (
            <Badge
              key={d}
              variant="secondary"
              className="gap-1 capitalize cursor-pointer hover:bg-destructive/20"
              onClick={() => toggleDifficulty(d)}
            >
              {d} <X className="w-3 h-3" />
            </Badge>
          ))}
          {tracks.map((track) => (
            <Badge
              key={track}
              variant="secondary"
              className="gap-1 capitalize cursor-pointer hover:bg-destructive/20"
              onClick={() => toggleTrack(track)}
            >
              {track} <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}