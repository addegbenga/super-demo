import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/components/providers/query-client";
import { courseQueries } from "@/lib/queries";
import { AllCourse } from "@/components/course";

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const queryClient = getQueryClient();
  const language = resolvedSearchParams.lang as string;

  // Prefetch on server
  await queryClient.prefetchQuery(courseQueries.all(language));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AllCourse />
    </HydrationBoundary>
  );
}
