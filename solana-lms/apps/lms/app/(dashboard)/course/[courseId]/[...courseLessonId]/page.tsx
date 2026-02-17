
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import SingleCourse from "@/components/course/single-course";
import { getQueryClient } from "@/components/providers/query-client";
import { courseQueries, lessonQueries } from "@/lib/queries";


export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const queryClient = getQueryClient();
  const language = resolvedSearchParams.lang as string;
  const courseId = resolvedParams.courseId as string;
  const lessonSlug = resolvedParams.courseLessonId?.[0] as string;

  // ✅ Parallel prefetch - both fire at the same time
  await Promise.all([
    queryClient.prefetchQuery(courseQueries.bySlug(courseId, language)),
    queryClient.prefetchQuery(lessonQueries.bySlug(lessonSlug, language)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SingleCourse />
    </HydrationBoundary>
  );
}
