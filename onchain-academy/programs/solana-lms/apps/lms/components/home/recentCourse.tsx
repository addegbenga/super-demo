"use client";

import { getCurrentUserId } from "@/hooks/auth";
import { useEnrolledCoursesWithDetails } from "@/hooks/use-course";
import { Button } from "@workspace/ui/components/button";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ICONS } from "@/lib/helper";
import { useI18n } from "@/lib/i18n";
import { useSearchParams } from "next/navigation";
import { HomeCoursesSkeletonLoader } from "@workspace/ui/components/loading";
import { useWallet } from "@solana/wallet-adapter-react";

export default function RecentCourseHome() {
  const searchParams = useSearchParams();
  const language = searchParams.get("language") as string;
  const { userId } = getCurrentUserId();
  const { connecting } = useWallet();
  const { data, isLoading } = useEnrolledCoursesWithDetails(userId, language);
  const { t } = useI18n();

  const recentCourse = data?.[0] ?? null;

  if (isLoading || connecting) {
    return <HomeCoursesSkeletonLoader />;
  }

  return (
    <div
      className={`grid pt-2 gap-3 ${
        recentCourse
          ? "grid-cols-1 lg:grid-cols-[1fr_minmax(0,24%)]"
          : "grid-cols-1"
      }`}
    >
      {/* ── My Courses + Activity (left column, full width if no recent) ── */}
      <div className="grid gap-3">
        {data?.length ? (
          <div className="rounded-2xl border border-white/5 bg-white/2 overflow-hidden max-h-96 flex flex-col">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-semibold">{t("home.myCourses")}</h3>
              <Link href="/course">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground h-6 px-2 gap-0.5 hover:text-foreground"
                >
                  {t("home.browseAll")}
                  <ICONS.chevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {data.map(({ course, progress }) => {
                if (!course) return null;
                const done = progress.completionPercentage === 100;

                return (
                  <Link
                    key={course._id}
                    href={`/course/${course.slug.current}`}
                    className="group items-center flex gap-4 h-40 rounded-xl border border-white/5 bg-white/2 hover:bg-white/4 hover:border-white/10 transition-all overflow-hidden"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-40 shrink-0 self-stretch min-h-30">
                      {course.thumbnail ? (
                        <Image
                          fill
                          src={course.thumbnail}
                          alt={course.title}
                          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <ICONS.bookOpen className="w-5 h-5 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 py-3 pr-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        {done ? (
                          <p className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-emerald-400">
                            <CheckCircle2 className="w-2.5 h-2.5" />{" "}
                            <span className="mt-0.5">
                              {t("home.completed")}
                            </span>
                          </p>
                        ) : (
                          <p className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-primary/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="mt-0.5">
                              {t("home.inProgress")}
                            </span>
                          </p>
                        )}
                      </div>
                      <p className="font-semibold tracking-tight leading-snug mb-1 group-hover:text-white transition-colors">
                        {course.title}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          <span className="text-white/70 font-medium">
                            {progress.completedLessons.length}
                          </span>{" "}
                          {t("home.lessons")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          <span className="text-primary/80 font-medium">
                            +{progress.xpEarned}
                          </span>{" "}
                          {t("home.xp")}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="px-4 pb-4">
              <Link href="/course">
                <Button className="w-full text-xs" variant="outline" size="sm">
                  {t("home.browseMoreCourses")}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <Link href="/course" className="w-full">
            <div className="rounded-2xl border bg-white/2 border-white/5 border-dashed hover:border-white/10 transition-colors p-20 flex flex-col items-center text-center gap-3 w-full">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <ICONS.bookOpen className="w-4 h-4 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm tracking-tight font-medium">
                  {t("home.startFirstCourse")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("home.browseAvailable")}
                </p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* ── Right Column: Recently Active Course ── */}
      {recentCourse && (
        <div>
          <div className="rounded-2xl border border-white/5 bg-white/2 overflow-hidden h-full">
            {(() => {
              const { course, progress } = recentCourse;
              const isCompleted = progress.completionPercentage === 100;
              return (
                <div className="flex flex-col h-full">
                  {/* Big thumbnail header */}
                  <div className="relative h-36 w-full shrink-0">
                    {course?.thumbnail ? (
                      <Image
                        fill
                        src={course.thumbnail}
                        alt={course?.title ?? ""}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-[#0d0d0d] via-[#0d0d0d]/90 to-transparent" />
                    <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
                      {isCompleted ? (
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] font-semibold text-emerald-300">
                            {t("home.completed")}
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[10px] font-semibold text-primary/90">
                            {t("home.inProgress")}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Course info */}
                  <div className="px-4 py-3 flex flex-col flex-1">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium mb-1">
                      {t("home.recentlyActive")}
                    </p>
                    <h3 className="text-sm font-bold leading-snug line-clamp-1 mb-2">
                      {course?.title}
                    </h3>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="text-center">
                        <p
                          className="text-base font-black tabular-nums leading-none"
                          style={{ color: isCompleted ? "#34d399" : undefined }}
                        >
                          {progress.completionPercentage}%
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          {t("home.done")}
                        </p>
                      </div>
                      <div className="w-px h-6 bg-white/10" />
                      <div className="text-center">
                        <p className="text-base font-black tabular-nums leading-none">
                          {progress.completedLessons.length}
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          {t("home.lessons")}
                        </p>
                      </div>
                      <div className="w-px h-6 bg-white/10" />
                      <div className="text-center">
                        <p className="text-base font-black tabular-nums leading-none text-primary">
                          +{progress.xpEarned}
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          {t("home.xp")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <Link
                        href={`/course/${course?.slug.current}`}
                        className="block"
                      >
                        <Button
                          size="sm"
                          variant={isCompleted ? "outline" : "default"}
                          className="w-full gap-1.5 text-xs h-8"
                        >
                          {isCompleted
                            ? t("home.reviewCourse")
                            : t("home.continueLearning")}
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
