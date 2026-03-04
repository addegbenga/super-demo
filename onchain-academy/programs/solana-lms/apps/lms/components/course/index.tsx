"use client";
import { courseQueries } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Clock, Zap, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";

import { useCourseParams } from "@/hooks";
import { CourseHeader } from "./course-filter";

// ─── CourseGrid ───────────────────────────────────────────────────────────────

export function CourseGrid() {
  const { t } = useI18n();
  const { language, query, difficulties, tracks } = useCourseParams();

  const { data, isError, error, refetch, isFetching } = useQuery(
    courseQueries.search(language, query, { difficulties, tracks }),
  );

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {t("courses.failedToLoadCourses")}
        </h2>
        <p className="text-muted-foreground truncate text-center mb-6 max-w-md">
          {error?.message || t("courses.somethingWentWrong")}
        </p>
        <Button onClick={() => refetch()} variant="default">
          {t("common.tryAgain")}
        </Button>
      </div>
    );
  }

  if (!isFetching && data?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Search className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">No courses found</h2>
        <p className="text-muted-foreground">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-200 ${
        isFetching ? "opacity-60 pointer-events-none" : "opacity-100"
      }`}
    >
      {data?.map((course) => (
        <Link
          key={course._id}
          href={`/course/${course.slug?.current}`}
          prefetch={true}
        >
          <div className="group relative rounded-2xl overflow-hidden border border-white/10 bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer h-full flex flex-col">
            <div className="aspect-video h-44 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent z-10" />
              <Image
                width={200}
                height={200}
                src={course.thumbnail as any}
                alt={course?.slug?.source || ""}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {course.difficulty && (
                <div className="absolute top-3 right-3 z-20">
                  <Badge
                    variant="secondary"
                    className="bg-black/50 backdrop-blur-md border-white/10 capitalize text-xs"
                  >
                    {course.difficulty}
                  </Badge>
                </div>
              )}
            </div>
            <div className="p-6 pb-0 flex flex-col flex-1">
              <h3 className="tracking-tight font-bold mb-2 group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>
              <div className="grid pt-2.5 space-y-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {course.duration}hrs
                  </span>
                  <span className="flex items-center gap-1 text-primary">
                    <Zap className="w-3 h-3" /> {course.xpReward} XP
                  </span>
                  {course.track && (
                    <span className="capitalize text-xs text-muted-foreground/70">
                      {course.track}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── AllCourse ────────────────────────────────────────────────────────────────

export function AllCourse() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <CourseHeader />

      <CourseGrid />
    </div>
  );
}
