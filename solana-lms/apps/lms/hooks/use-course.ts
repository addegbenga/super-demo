"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryBuilder } from "@workspace/sanity-client";
import { learningService } from "@workspace/learning-service";
import { toast } from "sonner";
import { courseQueries, progressQueries, queryKeys } from "@/lib/queries";
import { completeCourse, completeLesson, enrollInCourse } from "@/lib/actions";
import { getCurrentUserId } from "./auth";

export type CourseProgressItem = {
  progress: {
    courseId: string;
    completedLessons: string[];
    completionPercentage: number;
    xpEarned: number;
    startedAt: string; // ISO date string
    lastActivityAt: string; // ISO date string
    enrolled: boolean;
  };
  course: {
    _id: string;
    title: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced" | string;
    duration: number;
    language: string;
    slug: {
      _type: "slug";
      current: string;
    };
    stats: {
      averageRating: number;
      totalCompletions: number;
      totalEnrollments: number;
      totalReviews: number;
    };
    status: "draft" | "published" | string;
    tags: string[];
    thumbnail: string;
    track: string;
    xpReward: number;
  };
};
export type CourseProgressResponse = CourseProgressItem[];

export function useCourse(slug: string) {
  const queryClient = useQueryClient();
  const {userId} = getCurrentUserId();

  // Fetch course data
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useQuery({
    queryKey: queryKeys.courses.detail(slug),
    queryFn: () => queryBuilder.getCourseBySlug(slug),
    enabled: !!slug,
  });

  // Fetch user progress from localStorage via learningService
  const {
    data: progress,
    isLoading: progressLoading,
    error: progressError,
  } = useQuery({
    queryKey: queryKeys.progress.course(userId, course?._id || ""),
    queryFn: () =>
      learningService.getProgress({ userId, courseId: course!._id }),
    enabled: !!userId && !!course?._id,
  });

  // Enrollment mutation
  // Server Action updates Sanity, onSuccess updates localStorage
  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !course) {
        throw new Error("User and course are required");
      }
      return enrollInCourse({ userId, courseId: course._id });
    },

    onSuccess: async (result, _variables) => {
      if (!result.success) {
        toast.error(result.error ?? "Failed to enroll");
        return;
      }

      // Client-side: save initial progress to localStorage
      await learningService.enrollInCourse({
        userId,
        courseId: course!._id,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.progress.course(userId, course!._id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.detail(slug),
      });

      toast.success("Successfully enrolled");
    },

    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to enroll");
    },
  });

  // Lesson completion mutation
  // Server Action updates Sanity progress, onSuccess updates localStorage
  const completeLessonMutation = useMutation({
    mutationFn: async (variables: {
      lessonId: string;
      totalLessons: number;
      xpReward: number;
    }) => {
      if (!userId || !course) {
        throw new Error("User and course are required");
      }
      return completeLesson({
        userId,
        courseId: course._id,
        lessonId: variables.lessonId,
      });
    },

    onSuccess: async (result, variables) => {
      if (!result.success) {
        toast.error(result.error ?? "Failed to save progress");
        return;
      }

      // Client-side: update localStorage, XP, streak, achievements
      const lessonResult = await learningService.completeLesson({
        userId,
        courseId: course!._id,
        lessonId: variables.lessonId,
        totalLessons: variables.totalLessons,
        xpReward: variables.xpReward,
      });

      // If course is now complete, update Sanity via Server Action
      if (lessonResult.courseCompleted) {
        await completeCourse({ userId, courseId: course!._id });
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.progress.course(userId, course!._id),
      });

      toast.success(`Lesson complete. +${lessonResult.xpAwarded} XP earned`);
    },

    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete lesson",
      );
    },
  });

  const isEnrolled =
    progress !== undefined && progress.completedLessons.length >= 0;
  const isCompleted = progress?.completionPercentage === 100;

  return {
    // Data
    course,
    progress,

    // Loading states
    isLoading: courseLoading || progressLoading,
    error: courseError || progressError,

    // Derived states
    isEnrolled,
    isCompleted,
    canReview: isCompleted,

    // Actions
    enroll: enrollMutation,
    completeLesson: completeLessonMutation,
  };
}

export function useEnrolledCoursesWithDetails(userId: string) {
  const enrolledQuery = useQuery(progressQueries.enrolled(userId));

  const courseIds = enrolledQuery.data?.map((p) => p.courseId) ?? [];

  const coursesQuery = useQuery(courseQueries.byIds(courseIds));

  const enrolledData = enrolledQuery.data;
  const coursesData = coursesQuery.data as any;

  const enrolled =
    !enrolledData || !coursesData
      ? []
      : enrolledData.map((progress) => ({
          progress,
          course:
            coursesData.find((c: any) => c._id === progress.courseId) ?? null,
        }));

  return {
    data:enrolled as unknown as CourseProgressResponse,
    isLoading: enrolledQuery.isLoading || coursesQuery.isLoading,
    isError: enrolledQuery.isError || coursesQuery.isError,
  };
}
