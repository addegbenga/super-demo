import { queries } from "./index";
import type { SupportedLanguage } from "./language";
import type {
  Course,
  Module,
  Lesson,
  Instructor,
  Achievement,
  LearningPath,
  Review,
} from "./types.gen";
import { publicClient } from "./client";

const toLocalizedSlug = (slug: string, language?: string) => {
  // Always strip existing suffix first
  const base = slug.replace(/-(?:en|es|pt)$/, "");
  if (!language || language === "en") return base;
  return `${base}-${language}`;
};

type QueryParams = {
  language?: SupportedLanguage;
  slug?: string;
  ids?: string[];
  id?: string;
  track?: string;
  difficulty?: string;
  searchQuery?: string;
  courseId?: string;
  moduleId?: string;
  category?: string;
  type?: string;
  filter?: any;
};
// ==================== SPECIALIZED RETURN TYPES ====================

export interface CourseStatsResponse {
  _id: string;
  title: string;
  stats: Pick<Course, "stats">;
  totalModules: number;
  totalLessons: number;
  totalDuration: number;
  totalXP: number;
  videoLessons: number;
  textLessons: number;
  challenges: number;
}

export interface CourseTranslation {
  _id: string;
  language: string;
  title: string;
  status: string;
}

export interface LessonTranslation {
  _id: string;
  language: string;
  title: string;
}

export interface AdjacentLessonsResponse {
  lessons: Array<{
    _id: string;
    title: string;
    slug: { current: string };
    order: number;
    type: string;
    hasVideo?: boolean;
    hasTextContent?: boolean;
  }>;
}

export interface SlugResponse {
  slug: string;
  language: string;
  _updatedAt: string;
}

export interface LearningPathSlugResponse {
  slug: string;
  _updatedAt: string;
}

export interface PlatformStatsResponse {
  totalCourses: number;
  totalLessons: number;
  totalInstructors: number;
  totalAchievements: number;
  totalLearningPaths: number;
}

export interface CourseWithTestimonials extends Course {
  featuredReviews: Review[];
}

/**
 * Type-safe query executor with automatic language handling
 */
export class QueryBuilder {
  private defaultLanguage: SupportedLanguage = "en";

  setDefaultLanguage(lang: SupportedLanguage) {
    this.defaultLanguage = lang;
  }

  async execute<T>(
    queryKey: keyof typeof queries,
    params: QueryParams = {},
  ): Promise<T> {
    const query = queries[queryKey];
    const language = params.language || this.defaultLanguage;
    return publicClient.fetch<T>(query, { ...params, language });
  }
  // ==================== COURSES ====================

  async getCourses(language?: SupportedLanguage): Promise<Course[]> {
    return this.execute<Course[]>("allCourses", { language });
  }

  async getCoursesAdmin(): Promise<Course[]> {
    return this.execute<Course[]>("allCoursesAdmin");
  }

  async getCourseBySlug(
    slug: string,
    language?: SupportedLanguage,
  ): Promise<Course> {
    return this.execute<Course>("courseBySlug", {
      slug: toLocalizedSlug(slug, language),
      language,
    });
  }

  async getCourseByIds(
    ids: string[],
    language?: SupportedLanguage,
  ): Promise<Course> {
    return this.execute<Course>("coursesByIds", { ids, language });
  }

  async getCourseByI18nIds(
    ids: string[],
    language?: SupportedLanguage,
  ): Promise<Course> {
    return this.execute<Course>("coursesByi18nIds", { ids, language });
  }

  async getCourseBySlugFallback(slug: string): Promise<Course> {
    return this.execute<Course>("courseBySlugFallback", { slug });
  }

  async getCourseWithTestimonials(
    slug: string,
    language?: SupportedLanguage,
  ): Promise<CourseWithTestimonials> {
    return this.execute<CourseWithTestimonials>("courseWithTestimonials", {
      slug,
      language,
    });
  }

  async getCoursesByTrack(
    track: string,
    language?: SupportedLanguage,
  ): Promise<Course[]> {
    return this.execute<Course[]>("coursesByTrack", { track, language });
  }

  async getCoursesByDifficulty(
    difficulty: string,
    language?: SupportedLanguage,
  ): Promise<Course[]> {
    return this.execute<Course[]>("coursesByDifficulty", {
      difficulty,
      language,
    });
  }

  async searchCourses(
    searchQuery: string,
    language?: SupportedLanguage,
  ): Promise<Course[]> {
    return this.execute<Course[]>("searchCourses", { searchQuery, language });
  }

  async searchCoursesQuery(
    language?: SupportedLanguage,
    searchQuery: string = "",
    filter?: { difficulties?: string[]; tracks?: string[] },
  ): Promise<Course[]> {
    return this.execute<Course[]>("searchCoursesQuery", {
      filter: {
        language: language ?? "en",
        query: searchQuery.trim(),
        difficulties: filter?.difficulties ?? [],
        tracks: filter?.tracks ?? [],
      },
    });
  }

  async getFeaturedCourses(language?: SupportedLanguage): Promise<Course[]> {
    return this.execute<Course[]>("featuredCourses", { language });
  }

  async getCoursePreview(id: string): Promise<Course> {
    return this.execute<Course>("coursePreview", { id });
  }

  async getCourseStats(courseId: string): Promise<CourseStatsResponse> {
    return this.execute<CourseStatsResponse>("courseStats", { courseId });
  }

  async getCourseTranslations(slug: string): Promise<CourseTranslation[]> {
    return this.execute<CourseTranslation[]>("courseTranslations", { slug });
  }

  // ==================== REVIEWS ====================

  async getAllFeaturedReviews(): Promise<Review[]> {
    return this.execute<Review[]>("featuredReviews");
  }

  async getFeaturedReviewsByCourse(courseId: string): Promise<Review[]> {
    return this.execute<Review[]>("featuredReviewsByCourse", { courseId });
  }

  async getReviewsByCourse(courseId: string): Promise<Review[]> {
    return this.execute<Review[]>("reviewsByCourse", { courseId });
  }

  // ==================== MODULES ====================

  async getModuleById(
    id: string,
    language?: SupportedLanguage,
  ): Promise<Module> {
    return this.execute<Module>("moduleById", { id, language });
  }

  // ==================== LESSONS ====================

  async getLessonBySlug(
    slug: string,
    language?: SupportedLanguage,
  ): Promise<Lesson> {
    return this.execute<Lesson>("lessonBySlug", {
      slug: toLocalizedSlug(slug, language),
      language,
    });
  }

  async getLessonBySlugFallback(slug: string): Promise<Lesson> {
    return this.execute<Lesson>("lessonBySlugFallback", { slug });
  }

  async getLessonById(id: string): Promise<Lesson> {
    return this.execute<Lesson>("lessonById", { id });
  }

  async getLessonPreview(id: string): Promise<Lesson> {
    return this.execute<Lesson>("lessonPreview", { id });
  }
  async getLessonsByCourse(courseSlug: string): Promise<Lesson[]> {
    return this.execute<Lesson[]>("lessonsByCourse", { slug: courseSlug });
  }

  async getAdjacentLessons(moduleId: string): Promise<AdjacentLessonsResponse> {
    return this.execute<AdjacentLessonsResponse>("getAdjacentLessons", {
      moduleId,
    });
  }

  async getLessonTranslations(slug: string): Promise<LessonTranslation[]> {
    return this.execute<LessonTranslation[]>("lessonTranslations", { slug });
  }

  // ==================== INSTRUCTORS ====================

  async getInstructors(): Promise<Instructor[]> {
    return this.execute<Instructor[]>("allInstructors");
  }

  async getInstructorById(id: string): Promise<Instructor> {
    return this.execute<Instructor>("instructorById", { id });
  }

  // ==================== ACHIEVEMENTS ====================

  async getAchievements(): Promise<Achievement[]> {
    return this.execute<Achievement[]>("allAchievements");
  }

  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    return this.execute<Achievement[]>("achievementsByCategory", { category });
  }

  async getAchievementById(id: string): Promise<Achievement> {
    return this.execute<Achievement>("achievementById", { id });
  }

  // ==================== LEARNING PATHS ====================

  async getLearningPaths(): Promise<LearningPath[]> {
    return this.execute<LearningPath[]>("allLearningPaths");
  }

  async getLearningPathBySlug(slug: string): Promise<LearningPath> {
    return this.execute<LearningPath>("learningPathBySlug", { slug });
  }

  async getLearningPathByTrack(track: string): Promise<LearningPath> {
    return this.execute<LearningPath>("learningPathByTrack", { track });
  }

  async getAllLearningPathSlugs(): Promise<LearningPathSlugResponse[]> {
    return this.execute<LearningPathSlugResponse[]>("allLearningPathSlugs");
  }

  // ==================== STATS & ANALYTICS ====================

  async getPlatformStats(): Promise<PlatformStatsResponse> {
    return this.execute<PlatformStatsResponse>("platformStats");
  }

  // ==================== SITEMAP & SEO ====================

  async getAllCourseSlugs(): Promise<SlugResponse[]> {
    return this.execute<SlugResponse[]>("allCourseSlugs");
  }

  async getAllLessonSlugs(): Promise<SlugResponse[]> {
    return this.execute<SlugResponse[]>("allLessonSlugs");
  }

  // ==================== TRANSLATIONS ====================

  async checkTranslationExists(
    type: string,
    slug: string,
    language: SupportedLanguage,
  ): Promise<boolean> {
    return this.execute<boolean>("translationExists", { type, slug, language });
  }
}

export const queryBuilder = new QueryBuilder();
