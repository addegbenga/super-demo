import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/components/providers/query-client";
import { courseQueries } from "@/lib/queries";
import { AllCourse } from "@/components/course";
import { Suspense } from "react";

export default async function CoursePage({
  searchParams,
}: {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  const language = resolvedSearchParams.lang as string;
  const query = (resolvedSearchParams.q as string) ?? "";
  const difficulties = resolvedSearchParams.difficulty
    ? Array.isArray(resolvedSearchParams.difficulty)
      ? resolvedSearchParams.difficulty
      : [resolvedSearchParams.difficulty]
    : [];
  const tracks = resolvedSearchParams.track
    ? Array.isArray(resolvedSearchParams.track)
      ? resolvedSearchParams.track
      : [resolvedSearchParams.track]
    : [];

  const queryClient = getQueryClient();

  // Single prefetch covers both browsing and filtered/searched states
  await queryClient.prefetchQuery(
    courseQueries.search(language, query, { difficulties, tracks }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AllCourse />
    </HydrationBoundary>
  );
}
