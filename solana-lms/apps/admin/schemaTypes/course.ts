import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  //   icon: BookOpen,
  fields: [
    // Language field (added by plugin, but we make it explicit)
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),

    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(500),
    }),

    // Add after the description field
    defineField({
      name: 'learningObjectives',
      title: 'Learning Objectives',
      type: 'array',
      description: 'What students will learn in this course',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'objective',
              type: 'string',
              title: 'Learning Objective',
              validation: (Rule) => Rule.required().max(200),
            },
          ],
          preview: {
            select: {
              title: 'objective',
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(3).max(12),
    }),

    // Add a longer description field for "Read more" section
    defineField({
      name: 'fullDescription',
      title: 'Full Description',
      type: 'array',
      description: 'Detailed course description (shown after "Read more")',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
          ],
        },
      ],
    }),

    defineField({
      name: 'stats',
      title: 'Course Statistics',
      type: 'object',
      description: 'Auto-updated stats (read-only)',
      readOnly: true,
      fields: [
        {
          name: 'totalEnrollments',
          type: 'number',
          title: 'Total Enrollments',
          initialValue: 0,
        },
        {
          name: 'totalCompletions',
          type: 'number',
          title: 'Total Completions',
          initialValue: 0,
        },
        {
          name: 'averageRating',
          type: 'number',
          title: 'Average Rating',
          initialValue: 0,
        },
        {
          name: 'totalReviews',
          type: 'number',
          title: 'Total Reviews',
          initialValue: 0,
        },
      ],
    }),

    defineField({
      name: 'completionAchievement',
      title: 'Completion Achievement',
      type: 'reference',
      to: [{type: 'achievement'}],
      description: 'Achievement unlocked when completing this course',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advanced', value: 'advanced'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'track',
      title: 'Learning Track',
      type: 'string',
      description: 'Which learning path does this course belong to?',
      options: {
        list: [
          {title: 'Solana Fundamentals', value: 'fundamentals'},
          {title: 'DeFi Developer', value: 'defi'},
          {title: 'NFT Creator', value: 'nft'},
          {title: 'Gaming & Metaverse', value: 'gaming'},
          {title: 'Tooling & Infrastructure', value: 'tooling'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (hours)',
      type: 'number',
      description: 'Estimated time to complete',
      validation: (Rule) => Rule.required().min(0).max(200),
    }),
    defineField({
      name: 'xpReward',
      title: 'XP Reward',
      type: 'number',
      description: 'Total XP earned for completing the course',
      validation: (Rule) => Rule.required().min(10).max(10000),
      initialValue: 10,
    }),
    defineField({
      name: 'modules',
      title: 'Modules',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'module'}]}],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'instructors',
      title: 'Instructors',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'instructor'}]}],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: '📝 Draft', value: 'draft'},
          {title: '✅ Published', value: 'published'},
          {title: '📦 Archived', value: 'archived'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'prerequisites',
      title: 'Prerequisites',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'course'}]}],
      description: 'Courses that should be completed before this one',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      difficulty: 'difficulty',
      status: 'status',
      language: 'language',
      media: 'thumbnail',
    },
    prepare({title, difficulty, status, language, media}) {
      const statusEmoji = {
        draft: '📝',
        published: '✅',
        archived: '📦',
      }
      const langFlag = {
        en: '🇺🇸',
        pt: '🇧🇷',
        es: '🇪🇸',
      }
      return {
        title,
        subtitle: `${langFlag[language as keyof typeof langFlag] || ''} ${difficulty} • ${statusEmoji[status as keyof typeof statusEmoji] || ''} ${status}`,
        media,
      }
    },
  },
})
