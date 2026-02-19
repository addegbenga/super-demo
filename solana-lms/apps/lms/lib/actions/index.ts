"use server";

import { revalidatePath } from "next/cache";
import { apiBase } from "../constant";

type EnrollPayload = {
  userId: string;
  courseId: string;
};

type CompleteLessonPayload = {
  userId: string;
  courseId: string;
  lessonId: string;
};

// Handles the server-side half of enrollment.
// The client-side half (localStorage) is handled in onSuccess of the mutation.
export async function enrollInCourse({ courseId, userId }: EnrollPayload) {
  try {
    const response = await fetch(`${apiBase}/courses/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        userId,
        userEmail: `${userId}@example.com`,
        userName: userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Enrollment API responded with ${response.status}`);
    }

    revalidatePath(`/course/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Server Action - enrollInCourse failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to enroll",
    };
  }
}

// Handles the server-side half of lesson completion.
// The client-side half (localStorage, XP, streak, achievements)
// is handled in onSuccess of the mutation via learningService.
export async function completeLesson({
  courseId,
  userId,
  lessonId,
}: CompleteLessonPayload) {
  try {
    const response = await fetch(`${apiBase}/courses/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        userId,
        lessonId: lessonId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Progress API responded with ${response.status}`);
    }

    revalidatePath(`/course/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Server Action - completeLesson failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save progress",
    };
  }
}

// Handles course completion on the Sanity side.
// Called from onSuccess after completeLesson returns courseCompleted: true.
export async function completeCourse({ courseId, userId }: EnrollPayload) {
  try {
    const response = await fetch(`${apiBase}/courses/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, userId }),
    });

    if (!response.ok) {
      throw new Error(`Complete API responded with ${response.status}`);
    }

    revalidatePath(`/course/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Server Action - completeCourse failed:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to complete course",
    };
  }
}
