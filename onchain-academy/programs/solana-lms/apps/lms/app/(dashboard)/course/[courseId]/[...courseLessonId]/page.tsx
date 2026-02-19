import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import SingleCourse from "@/components/course/single-course";
import { getQueryClient } from "@/components/providers/query-client";
import { courseQueries, lessonQueries } from "@/lib/queries";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ [key: string]: string }>;
}) {
  const resolvedParams = await params;
  const queryClient = getQueryClient();
  const courseId = resolvedParams.courseId as string;
  const lessonSlug = resolvedParams.courseLessonId?.[0] as string;

  // Parallel prefetch - both fire at the same time
  await Promise.all([
    queryClient.prefetchQuery(courseQueries.bySlug(courseId)),
    queryClient.prefetchQuery(lessonQueries.bySlug(lessonSlug)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SingleCourse />
    </HydrationBoundary>
  );
}
