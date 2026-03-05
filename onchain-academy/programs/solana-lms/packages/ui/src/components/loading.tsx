import { Skeleton } from "@workspace/ui/components/skeleton";


export function CoursesGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl overflow-hidden border border-white/10 bg-card h-full flex flex-col"
        >
          {/* Thumbnail skeleton */}
          <Skeleton className="aspect-video h-30 w-full rounded-none" />

          {/* Content area */}
          <div className="p-6 pb-0 flex flex-col flex-1 gap-4">
            {/* Title skeleton */}
            <Skeleton className="h-6 w-3/4" />

            {/* Description skeleton - 2 lines */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Spacer for flex-1 */}
            <div className="flex-1" />

            {/* Duration and XP skeleton */}
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CourseDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl pt-12 px-4 pb-24 animate-pulse">
      {/* Hero */}
      <div className="flex flex-col lg:flex-row gap-12 items-start px-4">
        <div className="w-full lg:w-112.5 shrink-0">
          <div className="aspect-video rounded-2xl bg-white/5" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-3 bg-white/5 rounded w-1/3" />
          <div className="h-8 bg-white/5 rounded w-3/4" />
          <div className="h-4 bg-white/5 rounded w-full" />
          <div className="h-4 bg-white/5 rounded w-2/3" />
          <div className="flex gap-6 py-2 border-y border-white/5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 bg-white/5 rounded w-16" />
            ))}
          </div>
          <div className="h-12 bg-white/5 rounded w-40" />
        </div>
      </div>

      {/* Body */}
      <div className="mt-24 flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-16">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 bg-white/5 rounded w-1/4" />
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-5/6" />
              <div className="h-4 bg-white/5 rounded w-4/6" />
            </div>
          ))}
        </div>
        {/* Sidebar */}
        <div className="lg:w-87.5 shrink-0 space-y-6">
          <div className="h-80 bg-white/5 rounded-2xl" />
          <div className="h-24 bg-white/5 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}


export function LessonPageSkeleton() {
  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col animate-pulse">
      {/* Header */}
      <div className="h-14 border-b border-white/5 bg-black/50 flex items-center px-4 gap-4 shrink-0">
        <div className="w-8 h-8 rounded bg-white/5" />
        <div className="h-4 w-48 bg-white/5 rounded" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/5 bg-black/20 p-4 space-y-4 shrink-0">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-white/5 rounded" />
            <div className="h-1.5 bg-white/5 rounded-full" />
            <div className="h-3 w-16 bg-white/5 rounded" />
          </div>
          <div className="space-y-2 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <div className="w-4 h-4 rounded-full bg-white/5 shrink-0" />
                <div className="h-3 bg-white/5 rounded flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Lesson content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">
            <div className="h-8 bg-white/5 rounded w-2/3" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 bg-white/5 rounded" style={{ width: `${85 - i * 5}%` }} />
              ))}
            </div>
            <div className="h-32 bg-white/5 rounded-lg" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-white/5 rounded" style={{ width: `${90 - i * 8}%` }} />
              ))}
            </div>
          </div>
          {/* Footer */}
          <div className="h-14 border-t border-white/5 flex items-center justify-between px-4">
            <div className="h-8 w-24 bg-white/5 rounded" />
            <div className="h-8 w-32 bg-white/5 rounded" />
          </div>
        </div>

        {/* Editor panel */}
        <div className="w-80 border-l border-white/5 flex flex-col shrink-0">
          <div className="h-10 border-b border-white/5 bg-white/3" />
          <div className="flex-1 bg-white/2" />
          <div className="h-32 border-t border-white/5 bg-white/2" />
        </div>
      </div>
    </div>
  );
}

export function LessonContentSkeleton() {
  return (
    <div className="flex-1 flex flex-col animate-pulse">
      <div className="flex-1 py-6 px-6 max-w-3xl mx-auto w-full space-y-6">
        <div className="h-7 bg-white/5 rounded w-1/2" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-white/5 rounded" style={{ width: `${90 - i * 6}%` }} />
          ))}
        </div>
        <div className="h-24 bg-white/5 rounded-lg" />
      </div>
      {/* Footer placeholder to prevent layout shift */}
      <div className="h-14 border-t border-border/40 shrink-0" />
    </div>
  );
}



export function HomeCoursesSkeletonLoader() {
  return (
    <div className="grid pt-2 gap-3 grid-cols-1 lg:grid-cols-[1fr_minmax(0,24%)]">
      {/* ── Left Column: My Courses ── */}
      <div className="grid gap-3">
        <div className="rounded-2xl border border-white/5 bg-white/2 overflow-hidden max-h-96 flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>

          {/* Course list items */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {Array.from({ length: 1 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 h-40 rounded-xl border border-white/5 bg-white/2 overflow-hidden"
              >
                {/* Thumbnail */}
                <Skeleton className="w-40 shrink-0 self-stretch rounded-none" />

                {/* Content */}
                <div className="flex-1 min-w-0 py-3 pr-4 flex flex-col gap-2">
                  {/* Status badge */}
                  <Skeleton className="h-2.5 w-16" />
                  {/* Title */}
                  <Skeleton className="h-4 w-3/4 mt-1" />
                  {/* Description */}
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                  {/* Stats */}
                  <div className="flex items-center gap-3 mt-auto">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Browse more button */}
          <div className="px-4 pb-4">
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        </div>
      </div>

      {/* ── Right Column: Recently Active Course ── */}
      <div>
        <div className="rounded-2xl border border-white/5 bg-white/2 overflow-hidden h-full">
          <div className="flex flex-col h-full">
            {/* Big thumbnail header */}
            <Skeleton className="h-36 w-full rounded-none shrink-0" />

            {/* Course info */}
            <div className="px-4 py-3 flex flex-col flex-1 gap-2">
              {/* "Recently Active" label */}
              <Skeleton className="h-2 w-20" />
              {/* Title */}
              <Skeleton className="h-4 w-4/5" />

              {/* Stats row */}
              <div className="flex items-center gap-4 my-1">
                <div className="flex flex-col items-center gap-1">
                  <Skeleton className="h-5 w-8" />
                  <Skeleton className="h-2 w-6" />
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex flex-col items-center gap-1">
                  <Skeleton className="h-5 w-6" />
                  <Skeleton className="h-2 w-8" />
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex flex-col items-center gap-1">
                  <Skeleton className="h-5 w-8" />
                  <Skeleton className="h-2 w-4" />
                </div>
              </div>

              {/* CTA button */}
              <div className="mt-auto">
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}