export const queries = {
  // ==================== COURSES ====================

  // Get all published courses (filtered by language)
  allCourses: `*[_type == "course" && status == "published" && language == $language] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    difficulty,
    duration,
    xpReward,
    track,
    language,
    "thumbnail": thumbnail.asset->url,
    tags,
    stats,
    "moduleCount": count(modules),
    "lessonCount": count(modules[]->lessons),
    "instructors": instructors[]-> {
      _id,
      name,
      "avatar": avatar.asset->url,
      role
    }
  }`,

  // Get all courses (for admin, regardless of status)
  allCoursesAdmin: `*[_type == "course"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    status,
    difficulty,
    track,
    language,
    stats,
    _createdAt,
    _updatedAt
  }`,

  // Get course by ID with full details
courseById: `*[_type == "course" && _id == $id && language == $language][0] {
  _id,
  title,
  slug,
  description,
  fullDescription,
  learningObjectives,
  difficulty,
  duration,
  xpReward,
  track,
  language,
  "thumbnail": thumbnail.asset->url,
  status,
  tags,
  stats,
  "prerequisites": prerequisites[]-> {
    _id,
    title,
    slug,
    difficulty
  },
  "modules": modules[]-> {
    _id,
    title,
    description,
    order,
    "lessons": lessons[]-> {
      _id,
      title,
      slug,
      type,
      duration,
      xpReward,
      order,
      language,
      hasVideo,
      hasTextContent
    } | order(order asc)
  } | order(order asc),
  "instructors": instructors[]-> {
    _id,
    name,
    "avatar": avatar.asset->url,
    role,
    bio,
    social
  },
  "completionAchievement": completionAchievement-> {
    _id,
    id,
    name,
    description,
    icon,
    category
  },
  "reviews": *[_type == "review" && courseId == ^._id && verified == true] | order(rating desc, createdAt desc) {
    _id,
    userName,
    userRole,
    "userAvatar": userAvatar.asset->url,
    rating,
    content,
    featured,
    createdAt
  },
  "featuredReviews": *[_type == "review" && courseId == ^._id && featured == true && verified == true] | order(featuredOrder asc, rating desc) [0...4] {
    _id,
    userName,
    userRole,
    "userAvatar": userAvatar.asset->url,
    rating,
    content,
    createdAt
  }
}`,

  // Get course by slug with full details
  courseBySlug: `*[_type == "course" && slug.current == $slug && language == $language][0] {
    _id,
    title,
    slug,
    description,
    fullDescription,
    learningObjectives,
    difficulty,
    duration,
    xpReward,
    track,
    language,
    "thumbnail": thumbnail.asset->url,
    status,
    tags,
    stats,
    "prerequisites": prerequisites[]-> {
      _id,
      title,
      slug,
      difficulty
    },
    "modules": modules[]-> {
      _id,
      title,
      description,
      order,
      "lessons": lessons[]-> {
        _id,
        title,
        slug,
        type,
        duration,
        xpReward,
        order,
        language,
        hasVideo,
        hasTextContent
      } | order(order asc)
    } | order(order asc),
    "instructors": instructors[]-> {
      _id,
      name,
      "avatar": avatar.asset->url,
      role,
      bio,
      social
    },
    "completionAchievement": completionAchievement-> {
      _id,
      id,
      name,
      description,
      icon,
      category
    },
    "reviews": *[_type == "review" && courseId == ^._id && verified == true] | order(rating desc, createdAt desc) {
    _id,
    userName,
    userRole,
    "userAvatar": userAvatar.asset->url,
    rating,
    content,
    featured,
    createdAt
  },
    "featuredReviews": *[_type == "review" && courseId == ^._id && featured == true && verified == true] | order(featuredOrder asc, rating desc) [0...4] {
    _id,
    userName,
    userRole,
    "userAvatar": userAvatar.asset->url,
    rating,
    content,
    createdAt
  }
  }`,


  // Get course by slug with fallback to any language
  courseBySlugFallback: `*[_type == "course" && slug.current == $slug && status == "published"][0] {
    _id,
    title,
    slug,
    description,
    fullDescription,
    learningObjectives,
    difficulty,
    duration,
    xpReward,
    track,
    language,
    thumbnail,
    status,
    stats,
    "modules": modules[]-> {
      _id,
      title,
      description,
      order,
      "lessons": lessons[]-> {
        _id,
        title,
        slug,
        type,
        duration,
        xpReward,
        order,
        hasVideo,
        hasTextContent
      } | order(order asc)
    } | order(order asc),
    "instructors": instructors[]-> {
      _id,
      name,
      avatar,
      role,
      bio,
      social
    }
  }`,

  // Get courses by track
  coursesByTrack: `*[_type == "course" && track == $track && status == "published" && language == $language] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    difficulty,
    duration,
    xpReward,
    track,
    thumbnail,
    stats,
    "moduleCount": count(modules),
    "lessonCount": count(modules[]->lessons)
  }`,

  // Get courses by difficulty
  coursesByDifficulty: `*[_type == "course" && difficulty == $difficulty && status == "published" && language == $language] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    difficulty,
    duration,
    xpReward,
    thumbnail,
    track,
    stats
  }`,

  // Search courses
  searchCourses: `*[_type == "course" && status == "published" && language == $language && (
    title match $query + "*" || 
    description match $query + "*" ||
    tags[] match $query + "*"
  )] {
    _id,
    title,
    slug,
    description,
    difficulty,
    duration,
    thumbnail,
    track,
    tags,
    stats
  }`,

  // Get featured/recommended courses
  featuredCourses: `*[_type == "course" && status == "published" && language == $language] | order(_createdAt desc) [0...6] {
    _id,
    title,
    slug,
    description,
    difficulty,
    duration,
    xpReward,
    thumbnail,
    track,
    stats
  }`,

  // ==================== TESTIMONIALS ====================

  // Get featured reviews (for homepage)
  featuredReviews: `*[_type == "review" && featured == true && verified == true] | order(featuredOrder asc, rating desc) [0...6] {
  _id,
  userName,
  userRole,
  userAvatar,
  rating,
  content,
  createdAt,
  "course": *[_type == "course" && _id == ^.courseId][0] {
    title,
    slug
  }
}`,

  // Get featured reviews for a specific course
  featuredReviewsByCourse: `*[_type == "review" && courseId == $courseId && featured == true && verified == true] | order(rating desc, createdAt desc) [0...4] {
  _id,
  userName,
  userRole,
  userAvatar,
  rating,
  content,
  createdAt
}`,

  // Get all reviews for a course (for course page)
  reviewsByCourse: `*[_type == "review" && courseId == $courseId && verified == true] | order(rating desc, createdAt desc) {
  _id,
  userName,
  userRole,
  userAvatar,
  rating,
  content,
  featured,
  createdAt
}`,

  // Update course with testimonials query
  courseWithTestimonials: `*[_type == "course" && slug.current == $slug && language == $language][0] {
  _id,
  title,
  slug,
  description,
  fullDescription,
  learningObjectives,
  difficulty,
  duration,
  xpReward,
  track,
  thumbnail,
  stats,
  "modules": modules[]-> {
    _id,
    title,
    description,
    order,
    "lessons": lessons[]-> {
      _id,
      title,
      slug,
      type,
      duration,
      xpReward,
      order
    } | order(order asc)
  } | order(order asc),
  "instructors": instructors[]-> {
    _id,
    name,
    avatar,
    role,
    bio,
    social
  },
  "completionAchievement": completionAchievement-> {
    _id,
    id,
    name,
    description,
    icon
  },
  "featuredReviews": *[_type == "review" && courseId == ^._id && featured == true && verified == true] | order(rating desc) [0...4] {
    _id,
    userName,
    userRole,
    userAvatar,
    content,
    rating
  }
}`,

  // ==================== MODULES ====================

  // Get module by ID with lessons
  moduleById: `*[_type == "module" && _id == $id && language == $language][0] {
    _id,
    title,
    description,
    order,
    language,
    "lessons": lessons[]-> {
      _id,
      title,
      slug,
      type,
      duration,
      xpReward,
      order,
      language,
      hasVideo,
      hasTextContent
    }[language == $language] | order(order asc)
  }`,

  // ==================== LESSONS ====================

  // Get lesson by slug with full details
  lessonBySlug: `*[_type == "lesson" && slug.current == $slug && language == $language][0] {
    _id,
    title,
    slug,
    type,
    order,
    duration,
    xpReward,
    language,
    
    // Video content fields
    hasVideo,
    videoProvider,
    videoUrl,
    videoDuration,
    "videoThumbnail": videoThumbnail.asset->url,
    
    // Text content fields
    hasTextContent,
    content,
    
    // Challenge fields
    challengePrompt,
    starterCode,
    solution,
    testCases,
    
    // Common fields
    hints,
    resources
  }`,

  // Get lesson by slug with fallback (any language)
  lessonBySlugFallback: `*[_type == "lesson" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    type,
    order,
    duration,
    xpReward,
    language,
    
    // Video content
    hasVideo,
    videoProvider,
    videoUrl,
    videoDuration,
    videoThumbnail,
    
    // Text content
    hasTextContent,
    content,
    
    // Challenge fields
    challengePrompt,
    starterCode,
    solution,
    testCases,
    
    // Common fields
    hints,
    resources
  }`,

  // Get lesson by ID (quick lookup)
  lessonById: `*[_type == "lesson" && _id == $id][0] {
    _id,
    title,
    slug,
    type,
    duration,
    xpReward,
    order,
    language,
    hasVideo,
    hasTextContent
  }`,

  // Get next/previous lessons in a module
  getAdjacentLessons: `*[_type == "module" && _id == $moduleId][0] {
    "lessons": lessons[]-> {
      _id,
      title,
      slug,
      order,
      type,
      hasVideo,
      hasTextContent
    } | order(order asc)
  }`,

  // Get lesson preview for lists/cards
  lessonPreview: `*[_type == "lesson" && _id == $id][0] {
    _id,
    title,
    slug,
    type,
    duration,
    xpReward,
    order,
    hasVideo,
    hasTextContent
  }`,

  // ==================== INSTRUCTORS ====================

  // Get all instructors
  allInstructors: `*[_type == "instructor"] | order(name asc) {
    _id,
    name,
    avatar,
    role,
    bio,
    social
  }`,

  // Get instructor by ID
  instructorById: `*[_type == "instructor" && _id == $id][0] {
    _id,
    name,
    avatar,
    role,
    bio,
    social,
    "courses": *[_type == "course" && references(^._id) && status == "published"] {
      _id,
      title,
      slug,
      thumbnail,
      difficulty,
      stats
    }
  }`,

  // ==================== ACHIEVEMENTS ====================

  // Get all achievements
  allAchievements: `*[_type == "achievement"] | order(category asc, name asc) {
    _id,
    id,
    name,
    description,
    icon,
    category,
    requirement
  }`,

  // Get achievements by category
  achievementsByCategory: `*[_type == "achievement" && category == $category] | order(name asc) {
    _id,
    id,
    name,
    description,
    icon,
    category,
    requirement
  }`,

  // Get achievement by ID
  achievementById: `*[_type == "achievement" && id == $id][0] {
    _id,
    id,
    name,
    description,
    icon,
    category,
    requirement
  }`,

  // ==================== LEARNING PATHS ====================

  // Get all learning paths
  allLearningPaths: `*[_type == "learningPath"] | order(track asc) {
    _id,
    title,
    slug,
    description,
    track,
    thumbnail,
    "courses": courses[]-> {
      _id,
      title,
      slug,
      difficulty,
      duration,
      thumbnail,
      stats,
      "moduleCount": count(modules)
    }
  }`,

  // Get learning path by slug
  learningPathBySlug: `*[_type == "learningPath" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    track,
    thumbnail,
    "courses": courses[]-> {
      _id,
      title,
      slug,
      description,
      difficulty,
      duration,
      xpReward,
      thumbnail,
      track,
      stats,
      "moduleCount": count(modules),
      "lessonCount": count(modules[]->lessons)
    }
  }`,

  // Get learning path by track
  learningPathByTrack: `*[_type == "learningPath" && track == $track][0] {
    _id,
    title,
    slug,
    description,
    track,
    thumbnail,
    "courses": courses[]-> {
      _id,
      title,
      slug,
      difficulty,
      duration,
      thumbnail,
      stats
    }
  }`,

  // ==================== STATS & ANALYTICS ====================

  // Get platform stats (for homepage)
  platformStats: `{
    "totalCourses": count(*[_type == "course" && status == "published"]),
    "totalLessons": count(*[_type == "lesson"]),
    "totalInstructors": count(*[_type == "instructor"]),
    "totalAchievements": count(*[_type == "achievement"]),
    "totalLearningPaths": count(*[_type == "learningPath"])
  }`,

  // Get course statistics
  courseStats: `*[_type == "course" && _id == $courseId][0] {
    _id,
    title,
    stats,
    "totalModules": count(modules),
    "totalLessons": count(modules[]->lessons),
    "totalDuration": sum(modules[]->lessons[]->duration),
    "totalXP": sum(modules[]->lessons[]->xpReward) + xpReward,
    "videoLessons": count(modules[]->lessons[hasVideo == true]),
    "textLessons": count(modules[]->lessons[hasTextContent == true]),
    "challenges": count(modules[]->lessons[type == "challenge"])
  }`,

  // ==================== CONTENT PREVIEWS ====================

  // Get course preview (for cards)
  coursePreview: `*[_type == "course" && _id == $id][0] {
    _id,
    title,
    slug,
    description,
    difficulty,
    duration,
    thumbnail,
    track,
    xpReward,
    stats
  }`,

  // ==================== SITEMAP & SEO ====================

  // Get all published course slugs (for sitemap)
  allCourseSlugs: `*[_type == "course" && status == "published"] {
    "slug": slug.current,
    "language": language,
    _updatedAt
  }`,

  // Get all published lesson slugs (for sitemap)
  allLessonSlugs: `*[_type == "lesson"] {
    "slug": slug.current,
    "language": language,
    _updatedAt
  }`,

  // Get all learning path slugs (for sitemap)
  allLearningPathSlugs: `*[_type == "learningPath"] {
    "slug": slug.current,
    _updatedAt
  }`,

  // ==================== TRANSLATIONS ====================

  // Get all translations of a course
  courseTranslations: `*[_type == "course" && slug.current == $slug] {
    _id,
    language,
    title,
    status
  }`,

  // Get all translations of a lesson
  lessonTranslations: `*[_type == "lesson" && slug.current == $slug] {
    _id,
    language,
    title
  }`,

  // Check if translation exists
  translationExists: `count(*[_type == $type && slug.current == $slug && language == $language]) > 0`,
};
